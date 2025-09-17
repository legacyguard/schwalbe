
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  type CapsuleFileType,
  DEFAULT_RECORDING_CONSTRAINTS,
  MAX_FILE_SIZE,
  MAX_RECORDING_DURATION,
  type TimeCapsuleRecordingData,
} from '@/types/timeCapsule';

interface RecordingStepProps {
  messagePreview: string;
  messageTitle: string;
  onMessagePreviewChange: (preview: string) => void;
  onMessageTitleChange: (title: string) => void;
  onRecordingChange: (recording: null | TimeCapsuleRecordingData) => void;
  recording: null | TimeCapsuleRecordingData;
}

type RecordingState = 'completed' | 'idle' | 'paused' | 'recording';

export function RecordingStep({
  messageTitle,
  messagePreview,
  recording,
  onMessageTitleChange,
  onMessagePreviewChange,
  onRecordingChange,
}: RecordingStepProps) {
  const { t } = useTranslation('ui/recording-step');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingType, setRecordingType] = useState<CapsuleFileType>('video');
  const [duration, setDuration] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<null | number>(null);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    try {
      const constraints =
        recordingType === 'video'
          ? {
              video: DEFAULT_RECORDING_CONSTRAINTS.video,
              audio: DEFAULT_RECORDING_CONSTRAINTS.audio,
            }
          : {
              audio: DEFAULT_RECORDING_CONSTRAINTS.audio,
            };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsPermissionGranted(true);

      // Show preview
      if (recordingType === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Permission denied:', error);
      toast.error(t('errors.accessDenied'));
      setIsPermissionGranted(false);
      return null;
    }
  }, [recordingType]);

  // Generate video thumbnail
  const generateThumbnail = useCallback((): Blob | undefined => {
    if (recordingType !== 'video' || !videoRef.current || !canvasRef.current) {
      return undefined;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return undefined;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob>(resolve => {
      canvas.toBlob(
        blob => {
          resolve(blob!);
        },
        'image/jpeg',
        0.8
      );
    }) as unknown as Blob;
  }, [recordingType]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = streamRef.current || (await requestPermissions());
      if (!stream) return;

      chunksRef.current = [];
      const options = {
        mimeType:
          recordingType === 'video'
            ? 'video/webm;codecs=vp8,opus'
            : 'audio/ogg;codecs=opus',
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingType === 'video' ? 'video/webm' : 'audio/ogg',
        });

        // Check file size
        if (blob.size > MAX_FILE_SIZE) {
          toast.error(t('errors.tooLarge'));
          return;
        }

        const thumbnail = generateThumbnail();

        const recordingData: TimeCapsuleRecordingData = {
          blob,
          duration: duration,
          fileType: recordingType,
          thumbnail,
        };

        onRecordingChange(recordingData);
        setRecordingState('completed');
      };

      mediaRecorder.start(1000); // Collect data every second
      setRecordingState('recording');
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_RECORDING_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Recording failed:', error);
      toast.error(t('errors.recordingFailed'));
    }
  }, [
    recordingType,
    requestPermissions,
    generateThumbnail,
    duration,
    onRecordingChange,
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setRecordingState('completed');
  }, [recordingState]);

  // Pause/Resume recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');

      // Resume timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_RECORDING_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, [recordingState, stopRecording]);

  // Delete recording and start over
  const deleteRecording = useCallback(() => {
    onRecordingChange(null);
    setRecordingState('idle');
    setDuration(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [onRecordingChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Switch recording type
  const switchRecordingType = useCallback(
    (type: CapsuleFileType) => {
      if (recordingState !== 'idle') {
        toast.error(t('errors.recordingFailed'));
        return;
      }

      setRecordingType(type);
      setIsPermissionGranted(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    },
    [recordingState]
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='space-y-6'>
      {/* Message Details */}
      <div className='space-y-4'>
        <div>
          <Label htmlFor='messageTitle'>{t('title')}</Label>
          <Input
            id='messageTitle'
            value={messageTitle}
            onChange={e => onMessageTitleChange(e.target.value)}
            placeholder='e.g., Happy 25th Birthday, Sarah'
            className='mt-1'
          />
        </div>

        <div>
          <Label htmlFor='messagePreview'>{t('subtitle')}</Label>
          <Textarea
            id='messagePreview'
            value={messagePreview}
            onChange={e => onMessagePreviewChange(e.target.value)}
            placeholder='A brief description of what this message contains...'
            rows={2}
            className='mt-1'
          />
        </div>
      </div>

      {/* Recording Type Selection */}
      <div className='space-y-3'>
        <Label>{t('recordingType.label')}</Label>
        <div className='flex gap-3'>
          <Button
            variant={recordingType === 'video' ? 'default' : 'outline'}
            onClick={() => switchRecordingType('video')}
            className='flex-1'
            disabled={recordingState !== 'idle'}
          >
            <Icon name="video" className='w-4 h-4 mr-2' />
            {t('recordingType.video')}
          </Button>
          <Button
            variant={recordingType === 'audio' ? 'default' : 'outline'}
            onClick={() => switchRecordingType('audio')}
            className='flex-1'
            disabled={recordingState !== 'idle'}
          >
            <Icon name="mic" className='w-4 h-4 mr-2' />
            {t('recordingType.audio')}
          </Button>
        </div>
      </div>

      {/* Recording Interface */}
      <Card>
        <CardContent className='p-6'>
          {!isPermissionGranted && recordingState === 'idle' && (
            <div className='text-center py-8'>
              <Icon
                name="camera"
                className='w-12 h-12 text-muted-foreground mx-auto mb-4'
              />
              <p className='text-muted-foreground mb-4'>
                {recordingType === 'video' ? t('permissions.cameraDescription') : t('permissions.microphoneDescription')}
              </p>
              <Button onClick={requestPermissions}>
                <Icon name="camera" className='w-4 h-4 mr-2' />
                {recordingType === 'video' ? t('permissions.grantCamera') : t('permissions.grantMicrophone')}
              </Button>
            </div>
          )}

          {isPermissionGranted && recordingState === 'idle' && (
            <div className='text-center py-8'>
              {recordingType === 'video' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className='w-full max-w-md mx-auto rounded-lg mb-4'
                />
              ) : (
                <div className='w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Icon
                    name="mic"
                    className='w-12 h-12 text-gray-400'
                  />
                </div>
              )}
              <Button
                onClick={startRecording}
                size='lg'
                className='bg-red-600 hover:bg-red-700'
              >
                <Icon name="circle" className='w-4 h-4 mr-2' />
                {t('buttons.startRecording')}
              </Button>
            </div>
          )}

          {(recordingState === 'recording' || recordingState === 'paused') && (
            <div className='space-y-4'>
              {recordingType === 'video' && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className='w-full max-w-md mx-auto rounded-lg'
                />
              )}

              <div className='text-center space-y-4'>
                <div className='flex items-center justify-center space-x-4'>
                  {recordingState === 'recording' && (
                    <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
                  )}
                  <span className='text-lg font-mono'>
                    {formatTime(duration)} /{' '}
                    {formatTime(MAX_RECORDING_DURATION)}
                  </span>
                </div>

                <Progress
                  value={(duration / MAX_RECORDING_DURATION) * 100}
                  className='w-full max-w-sm mx-auto'
                />

                <div className='flex justify-center space-x-2'>
                  <Button onClick={pauseRecording} variant='outline'>
                    <Icon
                      name={recordingState === 'paused' ? 'play' : 'pause'}
                      className='w-4 h-4'
                    />
                  </Button>
                  <Button
                    onClick={stopRecording}
                    className='bg-red-600 hover:bg-red-700'
                  >
                    <Icon name="square" className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {recordingState === 'completed' && recording && (
            <div className='text-center py-4 space-y-4'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
                <Icon
                  name="check"
                  className='w-8 h-8 text-green-600'
                />
              </div>
              <div>
                <h3 className='font-medium text-green-900'>
                  {t('status.stopped')}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Duration: {formatTime(Math.round(recording.duration))} • Size:{' '}
                  {(recording.blob.size / (1024 * 1024)).toFixed(1)}MB
                </p>
              </div>

              <div className='flex justify-center space-x-2'>
                <Button variant='outline' onClick={deleteRecording}>
                  <Icon name="trash-2" className='w-4 h-4 mr-2' />
                  {t('buttons.recordAgain')}
                </Button>
                <Button variant='outline'>
                  <Icon name="play" className='w-4 h-4 mr-2' />
                  {t('buttons.preview')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden audio element for audio playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
