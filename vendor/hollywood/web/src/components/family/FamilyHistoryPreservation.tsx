
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Archive,
  Book,
  Calendar,
  Camera,
  Edit3,
  FileText,
  Image as ImageIcon,
  MapPin,
  Mic,
  Music,
  Share2,
  Sparkles,
  Square,
  Trash2,
  Video,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { motion } from 'framer-motion';

export interface HistoryItem {
  author: string;
  category:
    | 'achievements'
    | 'career'
    | 'challenges'
    | 'childhood'
    | 'education'
    | 'family'
    | 'other'
    | 'traditions'
    | 'travel';
  content?: string;
  createdAt: string;
  dateOfEvent?: string;
  description?: string;
  id: string;
  importance: 'high' | 'low' | 'medium' | 'milestone';
  isPrivate: boolean;
  location?: {
    coordinates?: { lat: number; lng: number };
    name: string;
  };
  mediaUrl?: string;
  metadata?: {
    duration?: number; // for audio/video
    fileSize?: number;
    resolution?: string; // for video/photo
    transcription?: string; // for audio/video
  };
  relatedPeople: string[];
  tags: string[];
  thumbnailUrl?: string;
  title: string;
  type: 'audio' | 'document' | 'photo' | 'story' | 'timeline_event' | 'video';
  updatedAt: string;
}

export interface FamilyTimeline {
  collaborators: string[];
  description: string;
  endYear?: number;
  events: HistoryItem[];
  id: string;
  isPublic: boolean;
  name: string;
  startYear: number;
  theme: 'classic' | 'elegant' | 'modern' | 'vintage';
}

interface FamilyHistoryPreservationProps {
  currentUserId: string;
  familyMembers: Array<{ id: string; name: string; relationship: string }>;
  historyItems: HistoryItem[];
  onCreateTimeline?: (timeline: Omit<FamilyTimeline, 'id'>) => void;
  onDeleteHistoryItem?: (itemId: string) => void;
  onRecordAudio?: (audioBlob: Blob, metadata: Record<string, unknown>) => void;
  onRecordVideo?: (videoBlob: Blob, metadata: Record<string, unknown>) => void;
  onSaveHistoryItem?: (item: Omit<HistoryItem, 'id'>) => void;
  onUpdateHistoryItem?: (item: HistoryItem) => void;
  onUploadPhoto?: (file: File, metadata: Record<string, unknown>) => void;
  timelines: FamilyTimeline[];
}

export const FamilyHistoryPreservation: React.FC<
  FamilyHistoryPreservationProps
> = ({
  historyItems,
  timelines,
  familyMembers,
  currentUserId,
  onSaveHistoryItem,
  onUpdateHistoryItem: _onUpdateHistoryItem,
  onDeleteHistoryItem,
  onCreateTimeline,
  onRecordAudio,
  onRecordVideo,
  onUploadPhoto,
}) => {
  const { t } = useTranslation('ui/family-history-preservation');
  const [activeTab, setActiveTab] = useState('overview');
  const [_selectedItem, _setSelectedItem] = useState<HistoryItem | null>(null);
  const [isRecording, setIsRecording] = useState<'audio' | 'video' | null>(
    null
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [_editingItem, setEditingItem] = useState<HistoryItem | null>(null);

  // Recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<null | number>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // New item state
  const [newItem, setNewItem] = useState<Partial<HistoryItem>>({
    type: 'story',
    title: '',
    description: '',
    content: '',
    tags: [],
    relatedPeople: [],
    category: 'family',
    importance: 'medium',
    isPrivate: false,
  });

  // New timeline state
  const [newTimeline, setNewTimeline] = useState<Partial<FamilyTimeline>>({
    name: '',
    description: '',
    startYear: new Date().getFullYear(),
    theme: 'classic',
    isPublic: false,
    collaborators: [],
  });

  // Start recording
  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const constraints =
        type === 'video' ? { video: true, audio: true } : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: type === 'video' ? 'video/webm' : 'audio/webm',
        });

        const metadata = {
          duration: recordingTime,
          type: type,
          timestamp: new Date().toISOString(),
        };

        if (type === 'video') {
          onRecordVideo?.(blob, metadata);
        } else {
          onRecordAudio?.(blob, metadata);
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(type);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(t('recording.permissions'));
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsRecording(null);
    setRecordingTime(0);

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle file upload
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'document' | 'photo'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'photo' && file.type.startsWith('image/')) {
      const metadata = {
        originalName: file.name,
        size: file.size,
        type: file.type,
        timestamp: new Date().toISOString(),
      };
      onUploadPhoto?.(file, metadata);
    }
  };

  // Save new history item
  const handleSaveItem = () => {
    if (!newItem.title) return;

    const item: Omit<HistoryItem, 'id'> = {
      type: newItem.type as HistoryItem['type'],
      title: newItem.title,
      description: newItem.description,
      content: newItem.content,
      author: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: newItem.tags || [],
      relatedPeople: newItem.relatedPeople || [],
      category: newItem.category as HistoryItem['category'],
      importance: newItem.importance as HistoryItem['importance'],
      isPrivate: newItem.isPrivate || false,
      dateOfEvent: newItem.dateOfEvent,
    };

    onSaveHistoryItem?.(item);

    // Reset form
    setNewItem({
      type: 'story',
      title: '',
      description: '',
      content: '',
      tags: [],
      relatedPeople: [],
      category: 'family',
      importance: 'medium',
      isPrivate: false,
    });
    setShowCreateDialog(false);
  };

  // Create timeline
  const handleCreateTimeline = () => {
    if (!newTimeline.name) return;

    const timeline: Omit<FamilyTimeline, 'id'> = {
      name: newTimeline.name,
      description: newTimeline.description || '',
      startYear: newTimeline.startYear || new Date().getFullYear(),
      events: [],
      collaborators: newTimeline.collaborators || [],
      isPublic: newTimeline.isPublic || false,
      theme: newTimeline.theme as FamilyTimeline['theme'],
    };

    onCreateTimeline?.(timeline);

    // Reset form
    setNewTimeline({
      name: '',
      description: '',
      startYear: new Date().getFullYear(),
      theme: 'classic',
      isPublic: false,
      collaborators: [],
    });
    setShowTimelineDialog(false);
  };

  const HistoryItemCard = ({ item }: { item: HistoryItem }) => {
    const getTypeIcon = (type: string) => {
      const icons = {
        story: BookIcon,
        photo: ImageIcon,
        video: Video,
        audio: Music,
        document: FileText,
        timeline_event: Calendar,
      };
      return icons[type as keyof typeof icons] || BookIcon;
    };

    const TypeIcon = getTypeIcon(item.type);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='group'
      >
        <Card className='cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-102'>
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`p-2 rounded-full ${
                    item.importance === 'milestone'
                      ? 'bg-yellow-100'
                      : item.importance === 'high'
                        ? 'bg-red-100'
                        : item.importance === 'medium'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                  }`}
                >
                  <TypeIcon className='h-5 w-5' />
                </div>
                <div>
                  <CardTitle className='text-base font-medium line-clamp-1'>
                    {item.title}
                  </CardTitle>
                  <p className='text-sm text-gray-500'>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Badge
                  variant={
                    item.importance === 'milestone' ? 'default' : 'secondary'
                  }
                  className='text-xs'
                >
                  {t(`importance.${item.importance}`)}
                </Badge>
                {item.isPrivate && (
                  <Badge variant='outline' className='text-xs'>
                    {t('privacy.private')}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            <div className='space-y-3'>
              {item.description && (
                <p className='text-sm text-gray-600 line-clamp-2'>
                  {item.description}
                </p>
              )}

              {item.location && (
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                  <MapPin className='h-3 w-3' />
                  {item.location.name}
                </div>
              )}

              {item.tags.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {item.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant='outline' className='text-xs px-1'>
                      #{tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant='outline' className='text-xs px-1'>
                      {t('historyItem.addTags', { count: item.tags.length - 3 })}
                    </Badge>
                  )}
                </div>
              )}

              <div className='flex items-center gap-2'>
                <div className='flex -space-x-1'>
                  {item.relatedPeople.slice(0, 3).map(personId => {
                    const person = familyMembers.find(m => m.id === personId);
                    return person ? (
                      <div
                        key={personId}
                        className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white'
                        title={person.name}
                      >
                        {person.name.charAt(0)}
                      </div>
                    ) : null;
                  })}
                  {item.relatedPeople.length > 3 && (
                    <div className='w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white'>
                      {t('historyItem.addPeople', { count: item.relatedPeople.length - 3 })}
                    </div>
                  )}
                </div>

                <div className='flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit3 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={() => onDeleteHistoryItem?.(item.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <Share2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const RecordingInterface = () => {
    if (!isRecording) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className='fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-6 z-50 border'
      >
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-4 h-4 bg-red-500 rounded-full animate-pulse'></div>
              <span className='font-medium'>
                {t('recording.recording', {
                  type: isRecording === 'video' ? t('recording.video') : t('recording.audio')
                })}
              </span>
            </div>
            <div className='text-lg font-mono'>{formatTime(recordingTime)}</div>
          </div>

          {isRecording === 'video' && (
            <video
              ref={videoPreviewRef}
              className='w-64 h-48 bg-black rounded-lg'
              muted
              autoPlay
            />
          )}

          {isRecording === 'audio' && (
            <div className='w-64 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center'>
              <div className='flex space-x-1'>
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className='w-2 bg-white rounded-full animate-pulse'
                    style={{
                      height: `${Math.random() * 40 + 20}}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className='flex gap-2'>
            <Button
              variant='destructive'
              onClick={stopRecording}
              className='flex-1'
            >
              <Square className='h-4 w-4 mr-2' />
              {t('buttons.stopRecording')}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold flex items-center gap-2'>
            <Archive className='h-6 w-6' />
            {t('header.title')}
          </h2>
          <p className='text-gray-600'>
            {t('header.description')}
          </p>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => startRecording('audio')}
            disabled={!!isRecording}
          >
            <Mic className='h-4 w-4 mr-2' />
            {t('buttons.recordAudio')}
          </Button>

          <Button
            variant='outline'
            onClick={() => startRecording('video')}
            disabled={!!isRecording}
          >
            <Video className='h-4 w-4 mr-2' />
            {t('buttons.recordVideo')}
          </Button>

          <input
            type='file'
            accept='image/*'
            onChange={e => handleFileUpload(e, 'photo')}
            className='hidden'
            id='photo-upload'
          />
          <Button
            variant='outline'
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            <Camera className='h-4 w-4 mr-2' />
            {t('buttons.uploadPhoto')}
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <FileText className='h-4 w-4 mr-2' />
                {t('buttons.addStory')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>{t('dialogs.createHistoryItem.title')}</DialogTitle>
              </DialogHeader>

              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>{t('form.labels.type')}</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={value =>
                        setNewItem(prev => ({
                          ...prev,
                          type: value as HistoryItem['type'],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='story'>{t('types.story')}</SelectItem>
                        <SelectItem value='photo'>{t('types.photo')}</SelectItem>
                        <SelectItem value='document'>{t('types.document')}</SelectItem>
                        <SelectItem value='timeline_event'>
                          {t('types.timelineEvent')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('form.labels.category')}</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={value =>
                        setNewItem(prev => ({
                          ...prev,
                          category: value as HistoryItem['category'],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='childhood'>{t('categories.childhood')}</SelectItem>
                        <SelectItem value='education'>{t('categories.education')}</SelectItem>
                        <SelectItem value='career'>{t('categories.career')}</SelectItem>
                        <SelectItem value='family'>{t('categories.family')}</SelectItem>
                        <SelectItem value='travel'>{t('categories.travel')}</SelectItem>
                        <SelectItem value='traditions'>{t('categories.traditions')}</SelectItem>
                        <SelectItem value='achievements'>
                          {t('categories.achievements')}
                        </SelectItem>
                        <SelectItem value='challenges'>{t('categories.challenges')}</SelectItem>
                        <SelectItem value='other'>{t('categories.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t('form.labels.title')}</Label>
                  <Input
                    value={newItem.title || ''}
                    onChange={e =>
                      setNewItem(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder={t('form.placeholders.title')}
                  />
                </div>

                <div>
                  <Label>{t('form.labels.description')}</Label>
                  <Textarea
                    value={newItem.description || ''}
                    onChange={e =>
                      setNewItem(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder={t('form.placeholders.description')}
                    rows={2}
                  />
                </div>

                {newItem.type === 'story' && (
                  <div>
                    <Label>{t('form.labels.storyContent')}</Label>
                    <Textarea
                      value={newItem.content || ''}
                      onChange={e =>
                        setNewItem(prev => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder={t('form.placeholders.storyContent')}
                      rows={6}
                    />
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label>{t('form.labels.importance')}</Label>
                    <Select
                      value={newItem.importance}
                      onValueChange={value =>
                        setNewItem(prev => ({
                          ...prev,
                          importance: value as HistoryItem['importance'],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='low'>{t('importance.low')}</SelectItem>
                        <SelectItem value='medium'>{t('importance.medium')}</SelectItem>
                        <SelectItem value='high'>{t('importance.high')}</SelectItem>
                        <SelectItem value='milestone'>{t('importance.milestone')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('form.labels.dateOfEvent')}</Label>
                    <Input
                      type='date'
                      value={newItem.dateOfEvent || ''}
                      onChange={e =>
                        setNewItem(prev => ({
                          ...prev,
                          dateOfEvent: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowCreateDialog(false)}
                  >
                    {t('buttons.cancel')}
                  </Button>
                  <Button onClick={handleSaveItem}>{t('buttons.saveHistoryItem')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value='stories'>{t('tabs.stories')}</TabsTrigger>
          <TabsTrigger value='media'>{t('tabs.media')}</TabsTrigger>
          <TabsTrigger value='timelines'>{t('tabs.timelines')}</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-blue-100 rounded-full'>
                    <BookIcon className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-semibold'>
                      {
                        historyItems.filter(item => item.type === 'story')
                          .length
                      }
                    </p>
                    <p className='text-sm text-gray-600'>{t('stats.stories')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-100 rounded-full'>
                    <ImageIcon className='h-5 w-5 text-green-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-semibold'>
                      {
                        historyItems.filter(item => item.type === 'photo')
                          .length
                      }
                    </p>
                    <p className='text-sm text-gray-600'>{t('stats.photos')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-purple-100 rounded-full'>
                    <Video className='h-5 w-5 text-purple-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-semibold'>
                      {
                        historyItems.filter(item => item.type === 'video')
                          .length
                      }
                    </p>
                    <p className='text-sm text-gray-600'>{t('stats.videos')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-yellow-100 rounded-full'>
                    <Sparkles className='h-5 w-5 text-yellow-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-semibold'>
                      {
                        historyItems.filter(
                          item => item.importance === 'milestone'
                        ).length
                      }
                    </p>
                    <p className='text-sm text-gray-600'>{t('stats.milestones')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t('overview.recentHistoryItems')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {historyItems
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 6)
                  .map(item => (
                    <HistoryItemCard key={item.id} item={item} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='stories'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {historyItems
              .filter(item => item.type === 'story')
              .map(item => (
                <HistoryItemCard key={item.id} item={item} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value='media'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {historyItems
              .filter(item => ['photo', 'video', 'audio'].includes(item.type))
              .map(item => (
                <HistoryItemCard key={item.id} item={item} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value='timelines'>
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>{t('timeline.familyTimelines')}</h3>
              <Dialog
                open={showTimelineDialog}
                onOpenChange={setShowTimelineDialog}
              >
                <DialogTrigger asChild>
                  <Button>{t('buttons.createTimeline')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('dialogs.createTimeline.title')}</DialogTitle>
                  </DialogHeader>

                  <div className='space-y-4'>
                    <div>
                      <Label>{t('form.labels.timelineName')}</Label>
                      <Input
                        value={newTimeline.name || ''}
                        onChange={e =>
                          setNewTimeline(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder={t('form.placeholders.timelineName')}
                      />
                    </div>

                    <div>
                      <Label>{t('form.labels.description')}</Label>
                      <Textarea
                        value={newTimeline.description || ''}
                        onChange={e =>
                          setNewTimeline(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder={t('form.placeholders.timelineDescription')}
                        rows={3}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label>{t('form.labels.startYear')}</Label>
                        <Input
                          type='number'
                          value={newTimeline.startYear || ''}
                          onChange={e =>
                            setNewTimeline(prev => ({
                              ...prev,
                              startYear: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>

                      <div>
                        <Label>{t('form.labels.theme')}</Label>
                        <Select
                          value={newTimeline.theme}
                          onValueChange={value =>
                            setNewTimeline(prev => ({
                              ...prev,
                              theme: value as FamilyTimeline['theme'],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='classic'>{t('themes.classic')}</SelectItem>
                            <SelectItem value='modern'>{t('themes.modern')}</SelectItem>
                            <SelectItem value='vintage'>{t('themes.vintage')}</SelectItem>
                            <SelectItem value='elegant'>{t('themes.elegant')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        onClick={() => setShowTimelineDialog(false)}
                      >
                        {t('buttons.cancel')}
                      </Button>
                      <Button onClick={handleCreateTimeline}>
                        {t('buttons.createTimeline')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className='grid gap-4'>
              {timelines.map(timeline => (
                <Card key={timeline.id}>
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle>{timeline.name}</CardTitle>
                        <p className='text-sm text-gray-600'>
                          {timeline.description}
                        </p>
                      </div>
                      <Badge
                        variant={timeline.isPublic ? 'default' : 'secondary'}
                      >
                        {timeline.isPublic ? t('privacy.public') : t('privacy.private')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <span>
                          {timeline.startYear} - {timeline.endYear || t('timeline.present')}
                        </span>
                        <span>{timeline.events.length} {t('timeline.events')}</span>
                        <span>
                          {timeline.collaborators.length} {t('timeline.collaborators')}
                        </span>
                      </div>

                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm'>
                          <Edit3 className='h-4 w-4' />
                        </Button>
                        <Button variant='outline' size='sm'>
                          <Share2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recording Interface */}
      <RecordingInterface />
    </div>
  );
};

// Helper component for missing import
const BookIcon = Book;

export default FamilyHistoryPreservation;
