/**
 * Video Recording Studio
 * Professional video recording interface with camera access and emotional milestone integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';

interface VideoRecording {
  id: string;
  title: string;
  description?: string;
  duration: number;
  createdAt: Date;
  recordedBy: string;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  metadata: {
    resolution: string;
    bitrate: number;
    format: string;
    size: number;
    thumbnail?: string;
  };
  triggers: VideoTrigger[];
  accessControl: {
    recipients: string[];
    releaseConditions: string[];
    isPublic: boolean;
    requiresApproval: boolean;
  };
  emotionalContext: {
    occasion: string;
    mood: 'happy' | 'nostalgic' | 'loving' | 'serious' | 'hopeful';
    importance: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
  };
}

interface VideoTrigger {
  id: string;
  type: 'date' | 'milestone' | 'emergency' | 'manual' | 'conditional';
  condition: string;
  scheduledDate?: Date;
  milestone?: {
    type: 'birthday' | 'graduation' | 'wedding' | 'achievement' | 'anniversary';
    targetPerson: string;
    description: string;
  };
  isActive: boolean;
  hasTriggered: boolean;
}

interface VideoRecordingStudioProps {
  onVideoRecorded?: (video: VideoRecording) => Promise<void>;
  onVideoSaved?: (videoId: string) => void;
  familyMembers?: Array<{ id: string; name: string; relationship: string }>;
  existingVideos?: VideoRecording[];
}

const recordingPresets = [
  {
    id: 'birthday_message',
    title: 'Birthday Message',
    icon: '🎂',
    description: 'Record a special birthday message for future delivery',
    suggestedDuration: '2-5 minutes',
    mood: 'happy' as const,
    importance: 'high' as const,
    triggers: ['date', 'milestone']
  },
  {
    id: 'wisdom_sharing',
    title: 'Life Wisdom',
    icon: '💡',
    description: 'Share important life lessons and advice',
    suggestedDuration: '5-15 minutes',
    mood: 'serious' as const,
    importance: 'critical' as const,
    triggers: ['milestone', 'manual']
  },
  {
    id: 'family_story',
    title: 'Family Story',
    icon: '📖',
    description: 'Tell important family stories and memories',
    suggestedDuration: '10-30 minutes',
    mood: 'nostalgic' as const,
    importance: 'high' as const,
    triggers: ['date', 'milestone']
  },
  {
    id: 'love_letter',
    title: 'Love Letter Video',
    icon: '💕',
    description: 'Express your love and feelings',
    suggestedDuration: '3-10 minutes',
    mood: 'loving' as const,
    importance: 'high' as const,
    triggers: ['milestone', 'date']
  },
  {
    id: 'emergency_message',
    title: 'Emergency Message',
    icon: '🚨',
    description: 'Important message for emergency situations',
    suggestedDuration: '2-8 minutes',
    mood: 'serious' as const,
    importance: 'critical' as const,
    triggers: ['emergency', 'conditional']
  },
  {
    id: 'achievement_celebration',
    title: 'Achievement Celebration',
    icon: '🏆',
    description: 'Celebrate future achievements and milestones',
    suggestedDuration: '3-7 minutes',
    mood: 'hopeful' as const,
    importance: 'medium' as const,
    triggers: ['milestone', 'conditional']
  }
];

const milestoneTypes = [
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'graduation', label: 'Graduation', icon: '🎓' },
  { value: 'wedding', label: 'Wedding', icon: '💒' },
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'anniversary', label: 'Anniversary', icon: '💕' }
];

export default function VideoRecordingStudio({
  onVideoRecorded,
  onVideoSaved,
  familyMembers = [],
  existingVideos = []
}: VideoRecordingStudioProps) {
  const [currentView, setCurrentView] = useState<'setup' | 'recording' | 'preview' | 'library'>('setup');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<VideoRecording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Recording form state
  const [recordingForm, setRecordingForm] = useState({
    title: '',
    description: '',
    recipients: [] as string[],
    triggers: [] as VideoTrigger[],
    isPublic: false,
    requiresApproval: true
  });

  // Media refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Initialize Sofia personality for video guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.nurturingUser);

  useEffect(() => {
    adaptToContext('creating');
    checkMediaDevices();
  }, [adaptToContext]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const checkMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setHasCamera(devices.some(device => device.kind === 'videoinput'));
      setHasMicrophone(devices.some(device => device.kind === 'audioinput'));
    } catch (error) {
      console.error('Error checking media devices:', error);
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('Failed to access camera and microphone');
    }
  };

  const startRecording = async () => {
    try {
      const stream = streamRef.current || await startCamera();
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Record in 1-second chunks

      setIsRecording(true);
      setRecordingTime(0);

      learnFromInteraction({
        type: 'video_recording_start',
        duration: 0,
        context: 'creating'
      });

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      learnFromInteraction({
        type: 'video_recording_stop',
        duration: recordingTime,
        context: 'creating'
      });
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);

    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);

      // Create video recording object
      const preset = recordingPresets.find(p => p.id === selectedPreset);
      const newVideo: VideoRecording = {
        id: `video_${Date.now()}`,
        title: recordingForm.title || preset?.title || 'Untitled Video',
        description: recordingForm.description,
        duration: recordingTime,
        createdAt: new Date(),
        recordedBy: 'current_user',
        status: 'processing',
        metadata: {
          resolution: '1920x1080',
          bitrate: 2500000,
          format: 'webm',
          size: blob.size,
          thumbnail: await generateThumbnail(videoUrl)
        },
        triggers: recordingForm.triggers,
        accessControl: {
          recipients: recordingForm.recipients,
          releaseConditions: recordingForm.triggers.map(t => t.condition),
          isPublic: recordingForm.isPublic,
          requiresApproval: recordingForm.requiresApproval
        },
        emotionalContext: {
          occasion: preset?.title || 'Custom Message',
          mood: preset?.mood || 'loving',
          importance: preset?.importance || 'medium',
          tags: [preset?.id || 'custom']
        }
      };

      setRecordedVideo(newVideo);
      setCurrentView('preview');

      // Simulate processing
      setTimeout(() => {
        setRecordedVideo(prev => prev ? { ...prev, status: 'ready' } : null);
        setIsProcessing(false);
      }, 2000);

      onVideoRecorded?.(newVideo);

    } catch (error) {
      console.error('Error processing recording:', error);
      setIsProcessing(false);
    }
  };

  const generateThumbnail = async (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = 320;
        canvas.height = 180;
        video.currentTime = recordingTime / 2; // Middle frame
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      };

      video.src = videoUrl;
    });
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = recordingPresets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setRecordingForm(prev => ({
        ...prev,
        title: preset.title,
        description: preset.description
      }));
    }
  };

  const addTrigger = (triggerType: VideoTrigger['type']) => {
    const newTrigger: VideoTrigger = {
      id: `trigger_${Date.now()}`,
      type: triggerType,
      condition: `${triggerType} trigger`,
      isActive: true,
      hasTriggered: false
    };

    setRecordingForm(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger]
    }));
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <PersonalityAwareAnimation personality={personality} context="creating">
      <div className="w-full space-y-6">
        {/* Header */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                🎬 Video Recording Studio
                <motion.div
                  className="text-sm px-3 py-1 rounded-full bg-purple-500 text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Time Capsules
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create meaningful video messages for your family to be delivered at special moments or future dates.
              </p>

              {/* Device Status */}
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 ${hasCamera ? 'text-green-600' : 'text-red-600'}`}>
                  {hasCamera ? '📹' : '❌'} Camera {hasCamera ? 'Available' : 'Not Found'}
                </div>
                <div className={`flex items-center gap-2 ${hasMicrophone ? 'text-green-600' : 'text-red-600'}`}>
                  {hasMicrophone ? '🎤' : '❌'} Microphone {hasMicrophone ? 'Available' : 'Not Found'}
                </div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* View Navigation */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {[
              { key: 'setup', label: 'Setup & Record', icon: '🎬' },
              { key: 'library', label: `Video Library (${existingVideos.length})`, icon: '📚' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={currentView === tab.key ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setCurrentView(tab.key as typeof currentView)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </LiquidMotion.ScaleIn>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentView === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recording Presets */}
                <LiquidMotion.ScaleIn delay={0.3}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🎯 Recording Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recordingPresets.map((preset, index) => (
                          <motion.div
                            key={preset.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedPreset === preset.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-border hover:border-purple-300'
                            }`}
                            onClick={() => handlePresetSelect(preset.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{preset.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-medium">{preset.title}</h3>
                                <p className="text-sm text-muted-foreground">{preset.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>⏱️ {preset.suggestedDuration}</span>
                                  <span className={`px-2 py-1 rounded ${
                                    preset.importance === 'critical' ? 'bg-red-100 text-red-800' :
                                    preset.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                                    preset.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {preset.importance} importance
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </LiquidMotion.ScaleIn>

                {/* Recording Setup */}
                <LiquidMotion.ScaleIn delay={0.4}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        ⚙️ Recording Setup
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Basic Info */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Video Title *</label>
                          <Input
                            value={recordingForm.title}
                            onChange={(e) => setRecordingForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter a meaningful title..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Textarea
                            value={recordingForm.description}
                            onChange={(e) => setRecordingForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the purpose or context of this video..."
                            rows={3}
                          />
                        </div>

                        {/* Recipients */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Recipients</label>
                          <div className="space-y-2">
                            {familyMembers.map(member => (
                              <label key={member.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={recordingForm.recipients.includes(member.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setRecordingForm(prev => ({
                                        ...prev,
                                        recipients: [...prev.recipients, member.id]
                                      }));
                                    } else {
                                      setRecordingForm(prev => ({
                                        ...prev,
                                        recipients: prev.recipients.filter(id => id !== member.id)
                                      }));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">{member.name} ({member.relationship})</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Triggers */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Delivery Triggers</label>
                          <div className="space-y-2">
                            {recordingForm.triggers.map((trigger, idx) => (
                              <div key={trigger.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                <span className="text-sm capitalize">{trigger.type}: {trigger.condition}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setRecordingForm(prev => ({
                                    ...prev,
                                    triggers: prev.triggers.filter(t => t.id !== trigger.id)
                                  }))}
                                >
                                  ❌
                                </Button>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addTrigger('date')}
                              >
                                📅 Date
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addTrigger('milestone')}
                              >
                                🎯 Milestone
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addTrigger('emergency')}
                              >
                                🚨 Emergency
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Access Control */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={recordingForm.requiresApproval}
                              onChange={(e) => setRecordingForm(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                              className="rounded"
                            />
                            <span className="text-sm">Require approval before delivery</span>
                          </label>
                        </div>

                        {/* Start Recording Button */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => setCurrentView('recording')}
                            disabled={!recordingForm.title || !hasCamera || !hasMicrophone}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                            size="lg"
                          >
                            {!hasCamera || !hasMicrophone ? '❌ Media Access Required' : '🎬 Start Recording'}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </LiquidMotion.ScaleIn>
              </div>
            </motion.div>
          )}

          {currentView === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        🎬 Recording: {recordingForm.title}
                      </CardTitle>
                      <Button
                        variant="outline"
                        onClick={() => {
                          stopCamera();
                          setCurrentView('setup');
                        }}
                      >
                        ← Back to Setup
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Video Preview */}
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-96 object-cover"
                          onLoadedMetadata={() => {
                            if (!streamRef.current) startCamera();
                          }}
                        />

                        {/* Recording Indicator */}
                        {isRecording && (
                          <motion.div
                            className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-full"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <div className="w-3 h-3 bg-white rounded-full" />
                            <span className="font-medium">REC {formatTime(recordingTime)}</span>
                          </motion.div>
                        )}

                        {/* Recording Controls Overlay */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex items-center gap-4">
                            {!isRecording ? (
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  onClick={startRecording}
                                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
                                  disabled={!streamRef.current}
                                >
                                  ⚫
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  onClick={stopRecording}
                                  className="w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-800 text-white"
                                >
                                  ⏹️
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Recording Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{formatTime(recordingTime)}</div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{recordingForm.recipients.length}</div>
                          <div className="text-sm text-muted-foreground">Recipients</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{recordingForm.triggers.length}</div>
                          <div className="text-sm text-muted-foreground">Triggers</div>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 mb-2">🎯 Recording Tips</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Look directly into the camera for better connection</li>
                          <li>• Speak clearly and at a comfortable pace</li>
                          <li>• Consider your lighting - face the light source if possible</li>
                          <li>• Share specific memories, advice, or feelings</li>
                          <li>• Take your time - this message will be treasured</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {currentView === 'preview' && recordedVideo && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      👀 Video Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Video Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-2">{recordedVideo.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{recordedVideo.description}</p>

                          <div className="space-y-2 text-sm">
                            <div>Duration: {formatTime(recordedVideo.duration)}</div>
                            <div>Status: {isProcessing ? '🔄 Processing...' : '✅ Ready'}</div>
                            <div>Resolution: {recordedVideo.metadata.resolution}</div>
                            <div>Size: {(recordedVideo.metadata.size / 1024 / 1024).toFixed(1)} MB</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Recipients ({recordedVideo.accessControl.recipients.length})</h4>
                          <div className="space-y-1 text-sm">
                            {recordedVideo.accessControl.recipients.map(recipientId => {
                              const member = familyMembers.find(m => m.id === recipientId);
                              return member ? (
                                <div key={recipientId} className="flex items-center gap-2">
                                  <span>👤</span>
                                  <span>{member.name} ({member.relationship})</span>
                                </div>
                              ) : null;
                            })}
                          </div>

                          <h4 className="font-medium mb-2 mt-4">Delivery Triggers ({recordedVideo.triggers.length})</h4>
                          <div className="space-y-1 text-sm">
                            {recordedVideo.triggers.map(trigger => (
                              <div key={trigger.id} className="flex items-center gap-2">
                                <span>
                                  {trigger.type === 'date' ? '📅' :
                                   trigger.type === 'milestone' ? '🎯' :
                                   trigger.type === 'emergency' ? '🚨' : '⚙️'}
                                </span>
                                <span>{trigger.condition}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <Button
                          onClick={() => {
                            onVideoSaved?.(recordedVideo.id);
                            setCurrentView('library');
                          }}
                          disabled={isProcessing}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          💾 Save Video
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRecordedVideo(null);
                            setCurrentView('recording');
                          }}
                          disabled={isProcessing}
                        >
                          🔄 Record Again
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentView('setup')}
                        >
                          ← Back to Setup
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {currentView === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📚 Video Library ({existingVideos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {existingVideos.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">🎬</div>
                        <p>No videos recorded yet</p>
                        <p className="text-sm">Create your first time capsule video!</p>
                        <Button
                          onClick={() => setCurrentView('setup')}
                          className="mt-4"
                        >
                          🎬 Start Recording
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingVideos.map((video, index) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                          >
                            <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                              {video.metadata.thumbnail ? (
                                <img src={video.metadata.thumbnail} alt={video.title} className="w-full h-full object-cover rounded" />
                              ) : (
                                <span className="text-4xl">🎬</span>
                              )}
                            </div>

                            <h3 className="font-medium mb-1">{video.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {formatTime(video.duration)} • {video.createdAt.toLocaleDateString()}
                            </p>

                            <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-1 rounded ${
                                video.status === 'ready' ? 'bg-green-100 text-green-800' :
                                video.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                video.status === 'recording' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {video.status}
                              </span>
                              <span className={`px-2 py-1 rounded ${
                                video.emotionalContext.importance === 'critical' ? 'bg-red-100 text-red-800' :
                                video.emotionalContext.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                                video.emotionalContext.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {video.emotionalContext.importance}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.5}>
          <motion.div
            className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(168, 85, 247, 0.1)',
                '0 0 25px rgba(168, 85, 247, 0.15)',
                '0 0 15px rgba(168, 85, 247, 0.1)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-purple-700 text-sm font-medium">
                ✨ Sofia: "{currentView === 'setup'
                  ? 'Video messages are incredibly powerful. Choose a template that matches your heart\'s intention, and speak from your soul.'
                  : currentView === 'recording'
                    ? 'Take your time and speak naturally. Your family will treasure these moments forever. Remember to smile and let your love shine through!'
                    : currentView === 'preview'
                      ? 'Beautiful work! Review your message and make sure the delivery triggers align with your intentions. This gift will mean the world to them.'
                      : 'Your video library is growing! Each message is a precious gift waiting for the perfect moment to touch someone\'s heart.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}