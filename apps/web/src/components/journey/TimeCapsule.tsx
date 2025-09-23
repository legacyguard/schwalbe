/**
 * Time Capsule Recording Component
 * Premium recording interface with Apple-style liquid glass design
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Save,
  Trash2,
  Heart,
  Clock,
  Camera,
  Video,
  FileText,
  Lock,
  Unlock,
  Calendar,
  Users
} from 'lucide-react';
import { SofiaFirefly } from '../sofia/SofiaFirefly';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeCapsuleData {
  id?: string;
  title: string;
  type: 'audio' | 'video' | 'text' | 'photo';
  content?: string;
  audioBlob?: Blob;
  videoBlob?: Blob;
  photoFile?: File;
  recipient: string;
  deliveryDate?: Date;
  isSealed: boolean;
  message: string;
  createdAt: Date;
}

interface TimeCapsuleProps {
  onSave?: (capsule: TimeCapsuleData) => void;
  onCancel?: () => void;
  existingCapsule?: TimeCapsuleData;
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'reviewing';
type CapsuleStep = 'type' | 'content' | 'recipient' | 'seal' | 'complete';

export function TimeCapsule({
  onSave,
  onCancel,
  existingCapsule,
  className = ''
}: TimeCapsuleProps) {
  const [step, setStep] = useState<CapsuleStep>('type');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [capsuleData, setCapsuleData] = useState<TimeCapsuleData>({
    title: '',
    type: 'audio',
    recipient: '',
    isSealed: false,
    message: '',
    createdAt: new Date()
  });

  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const liquidGlassStyle = {
    background: `
      linear-gradient(135deg,
        rgba(15, 23, 42, 0.9) 0%,
        rgba(30, 41, 59, 0.8) 100%
      )
    `,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `
      0 20px 40px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `
  };

  useEffect(() => {
    if (existingCapsule) {
      setCapsuleData(existingCapsule);
    }
  }, [existingCapsule]);

  // Recording timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const constraints = capsuleData.type === 'video'
        ? { audio: true, video: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (capsuleData.type === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: capsuleData.type === 'video' ? 'video/webm' : 'audio/webm'
        });

        if (capsuleData.type === 'video') {
          setCapsuleData(prev => ({ ...prev, videoBlob: blob }));
          setVideoUrl(URL.createObjectURL(blob));
        } else {
          setCapsuleData(prev => ({ ...prev, audioBlob: blob }));
          setAudioUrl(URL.createObjectURL(blob));
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('reviewing');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  };

  const resetRecording = () => {
    setRecordingState('idle');
    setRecordingTime(0);
    setAudioUrl(null);
    setVideoUrl(null);
    setCapsuleData(prev => ({
      ...prev,
      audioBlob: undefined,
      videoBlob: undefined
    }));

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...capsuleData,
        id: existingCapsule?.id || `capsule_${Date.now()}`
      });
    }
  };

  const getSofiaMessage = () => {
    switch (step) {
      case 'type':
        return "What kind of message would you like to leave? Your voice, your image, or your written words?";
      case 'content':
        return capsuleData.type === 'audio'
          ? "Speak from your heart. Your loved ones will treasure every word."
          : capsuleData.type === 'video'
          ? "Let them see your love. This moment will become timeless."
          : "Write what matters most. Sometimes the heart speaks best through words.";
      case 'recipient':
        return "Who is this precious message for? They'll feel your love across time.";
      case 'seal':
        return "Ready to seal this treasure? Once sealed, it becomes a sacred gift.";
      case 'complete':
        return "Beautiful! Your message is now safely stored in your Garden of Legacy.";
      default:
        return "Let's create something meaningful together.";
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Choose Your Message Type
              </h2>
              <p className="text-lg text-slate-300">
                How would you like to connect with your loved ones?
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'audio', icon: Mic, label: 'Voice Message', description: 'Record your voice' },
                { type: 'video', icon: Video, label: 'Video Message', description: 'Record yourself' },
                { type: 'text', icon: FileText, label: 'Written Letter', description: 'Write your thoughts' },
                { type: 'photo', icon: Camera, label: 'Photo Memory', description: 'Share a moment' }
              ].map((option) => (
                <motion.button
                  key={option.type}
                  onClick={() => setCapsuleData(prev => ({ ...prev, type: option.type as any }))}
                  className={`p-6 rounded-2xl transition-all duration-300 ${
                    capsuleData.type === option.type
                      ? 'ring-2 ring-blue-400'
                      : ''
                  }`}
                  style={{
                    ...liquidGlassStyle,
                    background: capsuleData.type === option.type
                      ? `linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 100%)`
                      : liquidGlassStyle.background
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <option.icon size={32} className="text-blue-400 mx-auto mb-3" />
                  <div className="text-white font-medium mb-1">{option.label}</div>
                  <div className="text-slate-400 text-sm">{option.description}</div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => setStep('content')}
                disabled={!capsuleData.type}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Create Your Message
              </h2>
              <p className="text-lg text-slate-300">
                {capsuleData.type === 'audio' && "Record your voice message"}
                {capsuleData.type === 'video' && "Record your video message"}
                {capsuleData.type === 'text' && "Write your letter"}
                {capsuleData.type === 'photo' && "Upload your photo"}
              </p>
            </div>

            {/* Audio Recording */}
            {capsuleData.type === 'audio' && (
              <div className="space-y-6">
                <div className="text-center">
                  <motion.div
                    className="w-32 h-32 rounded-full mx-auto flex items-center justify-center relative"
                    style={{
                      ...liquidGlassStyle,
                      background: recordingState === 'recording'
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.6) 100%)'
                        : liquidGlassStyle.background
                    }}
                    animate={recordingState === 'recording' ? {
                      scale: [1, 1.1, 1],
                      transition: { duration: 1.5, repeat: Infinity }
                    } : {}}
                  >
                    {recordingState === 'recording' ? (
                      <MicOff size={48} className="text-white" />
                    ) : (
                      <Mic size={48} className="text-blue-400" />
                    )}

                    {/* Recording indicator */}
                    {recordingState === 'recording' && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-red-400"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>

                {/* Recording time */}
                <div className="text-center">
                  <div className="text-2xl font-mono text-white">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {recordingState === 'recording' && 'Recording...'}
                    {recordingState === 'paused' && 'Paused'}
                    {recordingState === 'idle' && 'Ready to record'}
                    {recordingState === 'reviewing' && 'Recording complete'}
                  </div>
                </div>

                {/* Recording controls */}
                <div className="flex justify-center gap-4">
                  {recordingState === 'idle' && (
                    <Button
                      onClick={startRecording}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl"
                    >
                      <Mic className="mr-2" size={20} />
                      Start Recording
                    </Button>
                  )}

                  {recordingState === 'recording' && (
                    <>
                      <Button
                        onClick={pauseRecording}
                        className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl"
                      >
                        <Pause size={20} />
                      </Button>
                      <Button
                        onClick={stopRecording}
                        className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl"
                      >
                        <Square size={20} />
                      </Button>
                    </>
                  )}

                  {recordingState === 'paused' && (
                    <>
                      <Button
                        onClick={resumeRecording}
                        className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl"
                      >
                        <Play size={20} />
                      </Button>
                      <Button
                        onClick={stopRecording}
                        className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl"
                      >
                        <Square size={20} />
                      </Button>
                    </>
                  )}

                  {recordingState === 'reviewing' && (
                    <>
                      <audio
                        src={audioUrl || undefined}
                        controls
                        className="mx-auto"
                        style={{ filter: 'invert(1)' }}
                      />
                      <Button
                        onClick={resetRecording}
                        variant="outline"
                        className="px-4 py-3 bg-slate-800/50 border-slate-600 text-slate-300 rounded-2xl"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Video Recording */}
            {capsuleData.type === 'video' && (
              <div className="space-y-6">
                <div className="relative mx-auto max-w-md">
                  <video
                    ref={videoRef}
                    className="w-full rounded-2xl"
                    style={{ background: '#000' }}
                    muted
                  />
                  {videoUrl && recordingState === 'reviewing' && (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full rounded-2xl"
                    />
                  )}
                </div>

                <div className="text-center">
                  <div className="text-2xl font-mono text-white">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {recordingState === 'recording' && 'Recording...'}
                    {recordingState === 'idle' && 'Ready to record'}
                    {recordingState === 'reviewing' && 'Recording complete'}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  {recordingState === 'idle' && (
                    <Button
                      onClick={startRecording}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl"
                    >
                      <Video className="mr-2" size={20} />
                      Start Recording
                    </Button>
                  )}

                  {recordingState === 'recording' && (
                    <Button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl"
                    >
                      <Square className="mr-2" size={20} />
                      Stop Recording
                    </Button>
                  )}

                  {recordingState === 'reviewing' && (
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      className="px-4 py-3 bg-slate-800/50 border-slate-600 text-slate-300 rounded-2xl"
                    >
                      <Trash2 className="mr-2" size={20} />
                      Re-record
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Text Message */}
            {capsuleData.type === 'text' && (
              <div className="space-y-4">
                <Textarea
                  value={capsuleData.content || ''}
                  onChange={(e) => setCapsuleData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your message from the heart..."
                  className="min-h-[200px] bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 rounded-2xl"
                />
              </div>
            )}

            {/* Photo Upload */}
            {capsuleData.type === 'photo' && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center"
                  style={liquidGlassStyle}
                >
                  <Camera size={48} className="text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-4">Upload a meaningful photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCapsuleData(prev => ({ ...prev, photoFile: file }));
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl cursor-pointer"
                  >
                    Choose Photo
                  </label>
                </div>

                {capsuleData.photoFile && (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(capsuleData.photoFile)}
                      alt="Preview"
                      className="max-w-xs mx-auto rounded-2xl"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setStep('type')}
                variant="outline"
                className="px-6 py-3 bg-slate-800/50 border-slate-600 text-slate-300 rounded-2xl"
              >
                Back
              </Button>

              <Button
                onClick={() => setStep('recipient')}
                disabled={
                  (capsuleData.type === 'audio' && !capsuleData.audioBlob) ||
                  (capsuleData.type === 'video' && !capsuleData.videoBlob) ||
                  (capsuleData.type === 'text' && !capsuleData.content?.trim()) ||
                  (capsuleData.type === 'photo' && !capsuleData.photoFile)
                }
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'recipient':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Who Is This For?
              </h2>
              <p className="text-lg text-slate-300">
                Choose who will receive this precious message
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message Title
                </label>
                <Input
                  value={capsuleData.title}
                  onChange={(e) => setCapsuleData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your message a name..."
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Recipient
                </label>
                <Input
                  value={capsuleData.recipient}
                  onChange={(e) => setCapsuleData(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder="Who is this message for?"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Delivery Date (Optional)
                </label>
                <Input
                  type="date"
                  value={capsuleData.deliveryDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setCapsuleData(prev => ({
                    ...prev,
                    deliveryDate: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                  className="bg-slate-800/50 border-slate-600 text-white rounded-2xl"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Leave empty to make available immediately
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Personal Message
                </label>
                <Textarea
                  value={capsuleData.message}
                  onChange={(e) => setCapsuleData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Add a short note about this message..."
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 rounded-2xl"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setStep('content')}
                variant="outline"
                className="px-6 py-3 bg-slate-800/50 border-slate-600 text-slate-300 rounded-2xl"
              >
                Back
              </Button>

              <Button
                onClick={() => setStep('seal')}
                disabled={!capsuleData.title.trim() || !capsuleData.recipient.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl"
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 'seal':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Seal Your Time Capsule
              </h2>
              <p className="text-lg text-slate-300">
                Once sealed, this message becomes a sacred gift
              </p>
            </div>

            {/* Sealing animation */}
            <div className="flex justify-center">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className="w-48 h-32 rounded-2xl flex items-center justify-center relative"
                  style={liquidGlassStyle}
                >
                  {capsuleData.isSealed ? (
                    <Lock size={48} className="text-yellow-400" />
                  ) : (
                    <Unlock size={48} className="text-blue-400" />
                  )}

                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: capsuleData.isSealed
                        ? ['0 0 20px rgba(251, 191, 36, 0.3)', '0 0 40px rgba(251, 191, 36, 0.5)', '0 0 20px rgba(251, 191, 36, 0.3)']
                        : ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Seal toggle */}
            <div className="text-center space-y-4">
              <button
                onClick={() => setCapsuleData(prev => ({ ...prev, isSealed: !prev.isSealed }))}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  capsuleData.isSealed
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                }`}
              >
                {capsuleData.isSealed ? (
                  <>
                    <Lock className="mr-2 inline" size={20} />
                    Sealed with Love
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 inline" size={20} />
                    Click to Seal
                  </>
                )}
              </button>

              {capsuleData.isSealed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-yellow-300 text-sm"
                >
                  ✨ Your message is now sealed and protected
                </motion.p>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setStep('recipient')}
                variant="outline"
                className="px-6 py-3 bg-slate-800/50 border-slate-600 text-slate-300 rounded-2xl"
              >
                Back
              </Button>

              <Button
                onClick={() => {
                  setStep('complete');
                  setTimeout(() => handleSave(), 2000);
                }}
                disabled={!capsuleData.isSealed}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl"
              >
                <Save className="mr-2" size={20} />
                Save Capsule
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div
                className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(21, 128, 61, 0.6) 100%)',
                  boxShadow: '0 0 50px rgba(34, 197, 94, 0.5)'
                }}
              >
                <Heart size={48} className="text-green-200" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Time Capsule Created
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Your precious message has been safely stored. It will be a treasure
                for {capsuleData.recipient} whenever they need to feel your love.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6 ${className}`}>
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto">
        <Card
          className="p-8 md:p-12"
          style={liquidGlassStyle}
        >
          {renderStep()}

          {/* Cancel button */}
          {step !== 'complete' && (
            <div className="mt-8 text-center">
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-300 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </Card>

        {/* Sofia guide */}
        <SofiaFirefly
          size="lg"
          message={getSofiaMessage()}
          showDialog={true}
          position={{ x: 85, y: 20 }}
          className="absolute"
        />
      </div>
    </div>
  );
}