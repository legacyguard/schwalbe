
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { toast } from 'sonner';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import type { TimeCapsuleAccess } from '@/types/timeCapsule';
import { format } from 'date-fns';

export default function TimeCapsuleViewPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const createSupabaseClient = useSupabaseWithClerk();

  const [accessData, setAccessData] = useState<null | TimeCapsuleAccess>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [_volume, _setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const controlsTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  // Fetch time capsule data using access token
  useEffect(() => {
    const fetchTimeCapsule = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = await createSupabaseClient();

        // Get capsule by access token (public access)
        const { data: capsule, error } = await supabase
          .from('time_capsules')
          .select(
            `
            *,
            user:user_id (
              id
            )
          `
          )
          .eq('access_token', token)
          .eq('is_delivered', true)
          .single();

        if (error || !capsule) {
          toast.error('Time Capsule not found or not yet delivered.');
          navigate('/');
          return;
        }

        // Get signed URL for the media file
        const { data: signedUrlData } = await supabase.storage
          .from('time-capsules')
          .createSignedUrl((capsule as any).storage_path || 'unknown', 3600); // 1 hour expiry

        let thumbnailUrl = null;
        if ((capsule as any).thumbnail_path) {
          const { data: thumbnailData } = await supabase.storage
            .from('time-capsules')
            .createSignedUrl((capsule as any).thumbnail_path, 3600);
          thumbnailUrl = thumbnailData?.signedUrl || null;
        }

        const accessData: TimeCapsuleAccess = {
          capsule: capsule as any,
          user_name: 'Anonymous', // We don't expose user names for privacy
          signed_url: signedUrlData?.signedUrl || '',
          thumbnail_url: thumbnailUrl || undefined,
        };

        setAccessData(accessData);
      } catch (error) {
        console.error('Error fetching time capsule:', error);
        toast.error('Failed to load Time Capsule.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeCapsule();
  }, [token, createSupabaseClient, navigate]);

  // Media event handlers
  const handlePlay = () => {
    setIsPlaying(true);
    setHasStarted(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    const media = videoRef.current || audioRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
      setDuration(media.duration);
    }
  };

  // const __handleSeek = (time: number) => { // Unused
  // const media = videoRef.current || audioRef.current;
  // if (media) {
  // media.currentTime = time;
  // }
  // }; // Unused

  // const __handleVolumeChange = (newVolume: number) => { // Unused
  // setVolume(newVolume);
  // const media = videoRef.current || audioRef.current;
  // if (media) {
  // media.volume = newVolume;
  // }
  // }; // Unused

  const togglePlayPause = () => {
    const media = videoRef.current || audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls for video
  const handleMouseMove = () => {
    if (accessData?.capsule.file_type === 'video') {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <Icon
            name='loader'
            className='w-8 h-8 animate-spin text-primary mx-auto mb-4'
          />
          <p className='text-muted-foreground'>Loading your Time Capsule...</p>
        </div>
      </div>
    );
  }

  if (!accessData) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Card className='max-w-md'>
          <CardContent className='p-8 text-center'>
            <Icon
              name='alert-circle'
              className='w-12 h-12 text-red-500 mx-auto mb-4'
            />
            <h2 className='text-xl font-semibold mb-2'>
              Time Capsule Not Found
            </h2>
            <p className='text-muted-foreground mb-4'>
              This Time Capsule doesn't exist or hasn't been delivered yet.
            </p>
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { capsule } = accessData;

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'>
      <div className='container max-w-4xl mx-auto px-4 py-8'>
        <FadeIn duration={0.6}>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Icon name='heart' className='w-10 h-10 text-white' />
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {capsule.message_title}
            </h1>
            <p className='text-lg text-gray-600'>
              A personal message for {capsule.recipient_name}
            </p>
            <div className='flex items-center justify-center gap-4 mt-4 text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <Icon name='calendar' className='w-4 h-4' />
                <span>
                  {capsule.delivery_condition === 'ON_DATE' &&
                  capsule.delivery_date
                    ? `Scheduled for ${format(new Date(capsule.delivery_date), 'MMMM d, yyyy')}`
                    : 'Delivered with Family Shield'}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <Icon name='clock' className='w-4 h-4' />
                <span>
                  {capsule.duration_seconds
                    ? formatTime(capsule.duration_seconds)
                    : 'Unknown duration'}
                </span>
              </div>
            </div>
          </div>

          {/* Media Player */}
          <Card className='overflow-hidden shadow-2xl'>
            <CardContent className='p-0'>
              <div
                className='relative bg-black'
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setShowControls(true)}
              >
                {capsule.file_type === 'video' ? (
                  <>
                    <video
                      ref={videoRef}
                      src={accessData.signed_url}
                      poster={accessData.thumbnail_url || undefined}
                      className='w-full aspect-video'
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleTimeUpdate}
                    />

                    {/* Video Controls Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
                        showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className='absolute inset-0 flex items-center justify-center'>
                        {!hasStarted && (
                          <Button
                            onClick={togglePlayPause}
                            size='lg'
                            className='w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/50'
                          >
                            <Icon name='play' className='w-8 h-8' />
                          </Button>
                        )}
                      </div>

                      {/* Bottom controls */}
                      <div className='absolute bottom-0 left-0 right-0 p-4'>
                        <div className='flex items-center gap-3 text-white'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={togglePlayPause}
                            className='text-white hover:bg-white/20'
                          >
                            <Icon
                              name={isPlaying ? 'pause' : 'play'}
                              className='w-4 h-4'
                            />
                          </Button>

                          <div className='flex-1'>
                            <div className='w-full bg-white/20 rounded-full h-1'>
                              <div
                                className='bg-white h-1 rounded-full transition-all duration-100'
                                style={{
                                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}}%`,
                                }}
                              />
                            </div>
                            <div className='flex justify-between text-xs mt-1'>
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleFullscreen}
                            className='text-white hover:bg-white/20'
                          >
                            <Icon name='maximize-2' className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='bg-gradient-to-br from-purple-600 to-pink-600 p-12'>
                    <div className='text-center text-white'>
                      <div className='w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6'>
                        <Icon name='mic' className='w-12 h-12' />
                      </div>
                      <h3 className='text-xl font-semibold mb-2'>
                        Audio Message
                      </h3>
                      <p className='text-white/80 mb-6'>
                        {capsule.message_preview ||
                          'A personal audio message just for you'}
                      </p>

                      <audio
                        ref={audioRef}
                        src={accessData.signed_url}
                        onPlay={handlePlay}
                        onPause={handlePause}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleTimeUpdate}
                        className='hidden'
                      />

                      {/* Audio Controls */}
                      <div className='space-y-4'>
                        <Button
                          onClick={togglePlayPause}
                          size='lg'
                          className='w-16 h-16 rounded-full bg-white text-purple-600 hover:bg-white/90'
                        >
                          <Icon
                            name={isPlaying ? 'pause' : 'play'}
                            className='w-6 h-6'
                          />
                        </Button>

                        <div className='max-w-md mx-auto'>
                          <div className='w-full bg-white/20 rounded-full h-2'>
                            <div
                              className='bg-white h-2 rounded-full transition-all duration-100'
                              style={{
                                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}}%`,
                              }}
                            />
                          </div>
                          <div className='flex justify-between text-sm mt-2'>
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Details */}
          {capsule.message_preview && (
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icon name='message-circle' className='w-5 h-5' />
                  Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-700 leading-relaxed'>
                  {capsule.message_preview}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className='text-center mt-8 p-6 bg-white/50 rounded-lg'>
            <p className='text-sm text-gray-600'>
              This Time Capsule was created with love and delivered at exactly
              the right moment.
            </p>
            <div className='flex items-center justify-center gap-2 mt-2 text-xs text-gray-500'>
              <Icon name='shield' className='w-3 h-3' />
              <span>Secured with Family Shield Technology</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
