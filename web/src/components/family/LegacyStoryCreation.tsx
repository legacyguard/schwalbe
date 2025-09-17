
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  Archive,
  BookOpen,
  Calendar,
  Edit3,
  FileText,
  Heart,
  Image,
  Mic,
  Play,
  Plus,
  Share2,
  Square,
  Star,
  Trash2,
  Users,
  Video,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface StoryContent {
  caption?: string;
  content: File | string;
  duration?: number;
  id: string;
  timestamp: Date;
  type: 'audio' | 'image' | 'text' | 'video';
}

interface LegacyStory {
  category:
    | 'achievements'
    | 'family-traditions'
    | 'life-events'
    | 'memories'
    | 'values'
    | 'wisdom';
  contents: StoryContent[];
  coverImage?: string;
  createdAt: Date;
  description: string;
  estimatedDuration: number;
  id: string;
  isComplete: boolean;
  lastUpdated: Date;
  tags: string[];
  targetAudience: string[];
  title: string;
}

interface StoryTemplate {
  category: string;
  description: string;
  icon: React.ReactNode;
  id: string;
  name: string;
  prompts: string[];
  suggestedContent: string[];
}

const storyTemplates: StoryTemplate[] = [
  {
    id: 'childhood-memories',
    name: 'Childhood Memories',
    description: 'Share stories from your childhood that shaped who you are',
    category: 'memories',
    prompts: [
      'What was your favorite childhood game or activity?',
      'Tell me about your childhood home and neighborhood',
      'What family traditions do you remember most fondly?',
      'Who was your childhood hero or role model?',
    ],
    suggestedContent: ['photos', 'audio', 'written stories'],
    icon: <Heart className='h-4 w-4' />,
  },
  {
    id: 'life-lessons',
    name: 'Life Lessons',
    description: 'Important wisdom and lessons learned throughout your life',
    category: 'wisdom',
    prompts: [
      'What is the most valuable lesson life has taught you?',
      'What advice would you give to your younger self?',
      'How did you overcome your biggest challenge?',
      'What values are most important to pass on?',
    ],
    suggestedContent: [
      'video messages',
      'written reflections',
      'audio recordings',
    ],
    icon: <BookOpen className='h-4 w-4' />,
  },
  {
    id: 'family-traditions',
    name: 'Family Traditions',
    description: 'Preserve family customs, recipes, and special celebrations',
    category: 'family-traditions',
    prompts: [
      'What family recipes have been passed down through generations?',
      'How does your family celebrate special occasions?',
      'What traditions would you like to continue?',
      'What stories do these traditions carry?',
    ],
    suggestedContent: [
      'recipe cards',
      'celebration photos',
      'tradition videos',
    ],
    icon: <Users className='h-4 w-4' />,
  },
  {
    id: 'achievements',
    name: 'Life Achievements',
    description: 'Document your proudest moments and accomplishments',
    category: 'achievements',
    prompts: [
      'What achievement are you most proud of?',
      'How did you reach your goals?',
      'What obstacles did you overcome?',
      'What would you like to be remembered for?',
    ],
    suggestedContent: ['certificates', 'photos', 'accomplishment stories'],
    icon: <Star className='h-4 w-4' />,
  },
];

interface LegacyStoryCreationProps {
  existingStories?: LegacyStory[];
  onStoryCreated?: (story: LegacyStory) => void;
}

export const LegacyStoryCreation: React.FC<LegacyStoryCreationProps> = ({
  onStoryCreated,
  existingStories = [],
}) => {
  const [stories, setStories] = useState<LegacyStory[]>(existingStories);
  const [activeStory, setActiveStory] = useState<LegacyStory | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<null | StoryTemplate>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>(
    'audio'
  );
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordingProgress, setRecordingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const constraints =
        type === 'video' ? { video: true, audio: true } : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: type === 'video' ? 'video/webm' : 'audio/webm',
        });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: blob.type,
        });

        if (activeStory) {
          const newContent: StoryContent = {
            id: `content-${Date.now()}`,
            type: type,
            content: file,
            timestamp: new Date(),
          };

          setActiveStory({
            ...activeStory,
            contents: [...activeStory.contents, newContent],
          });
        }

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingType(type);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setRecordingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      setRecordingProgress(0);
    }
  };

  const createNewStory = (template?: StoryTemplate) => {
    const newStory: LegacyStory = {
      id: `story-${Date.now()}`,
      title: template ? template.name : 'New Legacy Story',
      description: template ? template.description : '',
      category: (template?.category as LegacyStory['category']) || 'memories',
      targetAudience: [],
      contents: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      isComplete: false,
      estimatedDuration: 0,
      tags: [],
    };

    setActiveStory(newStory);
    setSelectedTemplate(template || null);
    setIsCreating(true);
  };

  const saveStory = () => {
    if (activeStory) {
      const updatedStory = {
        ...activeStory,
        lastUpdated: new Date(),
        estimatedDuration: calculateDuration(activeStory.contents),
      };

      const existingIndex = stories.findIndex(s => s.id === activeStory.id);
      if (existingIndex >= 0) {
        const updatedStories = [...stories];
        updatedStories[existingIndex] = updatedStory;
        setStories(updatedStories);
      } else {
        setStories([...stories, updatedStory]);
      }

      onStoryCreated?.(updatedStory);
      setIsCreating(false);
      setActiveStory(null);
      setSelectedTemplate(null);
    }
  };

  const calculateDuration = (contents: StoryContent[]): number => {
    return contents.reduce((total, content) => {
      if (content.type === 'text')
        return total + Math.ceil(content.content.toString().length / 200);
      if (content.duration) return total + content.duration;
      return total + 30; // Default 30 seconds for media without duration
    }, 0);
  };

  const addTextContent = (text: string) => {
    if (activeStory && text.trim()) {
      const newContent: StoryContent = {
        id: `content-${Date.now()}`,
        type: 'text',
        content: text,
        timestamp: new Date(),
      };

      setActiveStory({
        ...activeStory,
        contents: [...activeStory.contents, newContent],
      });
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !activeStory) return;

    Array.from(files).forEach(file => {
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
            ? 'audio'
            : 'text';

      const newContent: StoryContent = {
        id: `content-${Date.now()}-${Math.random()}`,
        type,
        content: file,
        timestamp: new Date(),
      };

      setActiveStory({
        ...activeStory,
        contents: [...activeStory.contents, newContent],
      });
    });
  };

  const removeContent = (contentId: string) => {
    if (activeStory) {
      setActiveStory({
        ...activeStory,
        contents: activeStory.contents.filter(c => c.id !== contentId),
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'memories':
        return <Heart className='h-4 w-4' />;
      case 'wisdom':
        return <BookOpen className='h-4 w-4' />;
      case 'family-traditions':
        return <Users className='h-4 w-4' />;
      case 'achievements':
        return <Star className='h-4 w-4' />;
      case 'life-events':
        return <Calendar className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Legacy Story Creation
          </h2>
          <p className='text-gray-600'>
            Create meaningful stories to preserve your family's legacy
          </p>
        </div>
        <Dialog open={!isCreating} onOpenChange={() => setIsCreating(false)}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreating(true)} className='gap-2'>
              <Plus className='h-4 w-4' />
              Create Story
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-4xl'>
            <DialogHeader>
              <DialogTitle>Choose a Story Template</DialogTitle>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-4 mt-4'>
              {storyTemplates.map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className='cursor-pointer hover:border-blue-300 transition-colors'
                    onClick={() => createNewStory(template)}
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-start gap-3'>
                        <div className='p-2 bg-blue-50 rounded-lg'>
                          {template.icon}
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900'>
                            {template.name}
                          </h3>
                          <p className='text-sm text-gray-600 mt-1'>
                            {template.description}
                          </p>
                          <div className='flex flex-wrap gap-1 mt-2'>
                            {template.suggestedContent.map(content => (
                              <Badge
                                key={content}
                                variant='secondary'
                                className='text-xs'
                              >
                                {content}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className='flex justify-end gap-2 mt-4'>
              <Button variant='outline' onClick={() => createNewStory()}>
                Start from Scratch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Story Creation Interface */}
      {isCreating && activeStory && (
        <Card className='border-2 border-blue-200'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                {getCategoryIcon(activeStory.category)}
                <div>
                  <Input
                    value={activeStory.title}
                    onChange={e =>
                      setActiveStory({ ...activeStory, title: e.target.value })
                    }
                    className='text-xl font-bold border-0 p-0 h-auto'
                    placeholder='Story Title'
                  />
                  <Textarea
                    value={activeStory.description}
                    onChange={e =>
                      setActiveStory({
                        ...activeStory,
                        description: e.target.value,
                      })
                    }
                    className='text-sm text-gray-600 border-0 p-0 resize-none mt-1'
                    placeholder='Story description...'
                    rows={2}
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={saveStory}>Save Story</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='content' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='content'>Content</TabsTrigger>
                <TabsTrigger value='prompts'>Prompts</TabsTrigger>
                <TabsTrigger value='settings'>Settings</TabsTrigger>
              </TabsList>

              <TabsContent value='content' className='space-y-4'>
                {/* Content Creation Tools */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  <Button
                    variant='outline'
                    className='gap-2'
                    onClick={() => {
                      const text = prompt('Enter your story text:');
                      if (text) addTextContent(text);
                    }}
                  >
                    <Edit3 className='h-4 w-4' />
                    Add Text
                  </Button>

                  <Button
                    variant='outline'
                    className='gap-2'
                    onClick={() => startRecording('audio')}
                    disabled={isRecording}
                  >
                    <Mic className='h-4 w-4' />
                    Record Audio
                  </Button>

                  <Button
                    variant='outline'
                    className='gap-2'
                    onClick={() => startRecording('video')}
                    disabled={isRecording}
                  >
                    <Video className='h-4 w-4' />
                    Record Video
                  </Button>

                  <Button
                    variant='outline'
                    className='gap-2'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className='h-4 w-4' />
                    Add Media
                  </Button>
                </div>

                {/* Recording Interface */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-red-50 border border-red-200 rounded-lg p-4'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='animate-pulse bg-red-500 rounded-full w-3 h-3'></div>
                        <span className='text-red-700 font-medium'>
                          Recording {recordingType}... (
                          {Math.floor(recordingProgress)}s)
                        </span>
                      </div>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={stopRecording}
                        className='gap-2'
                      >
                        <Square className='h-3 w-3' />
                        Stop
                      </Button>
                    </div>
                    <Progress value={recordingProgress} className='mt-2' />
                  </motion.div>
                )}

                {/* Content List */}
                <div className='space-y-2'>
                  <AnimatePresence>
                    {activeStory.contents.map(content => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className='bg-gray-50 rounded-lg p-3 flex items-center justify-between'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='p-1 bg-white rounded'>
                            {content.type === 'text' && (
                              <FileText className='h-4 w-4' />
                            )}
                            {content.type === 'audio' && (
                              <Mic className='h-4 w-4' />
                            )}
                            {content.type === 'video' && (
                              <Video className='h-4 w-4' />
                            )}
                            {content.type === 'image' && (
                              <Image className='h-4 w-4' />
                            )}
                          </div>
                          <div>
                            <div className='font-medium'>
                              {content.type === 'text'
                                ? `Text (${content.content.toString().slice(0, 50)}...)`
                                : `${content.type} content`}
                            </div>
                            <div className='text-xs text-gray-500'>
                              Added {content.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => removeContent(content.id)}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*,video/*,audio/*'
                  onChange={e => handleFileUpload(e.target.files)}
                  className='hidden'
                />
              </TabsContent>

              <TabsContent value='prompts' className='space-y-4'>
                {selectedTemplate && (
                  <div>
                    <h3 className='font-medium text-gray-900 mb-3'>
                      Story Prompts
                    </h3>
                    <div className='space-y-2'>
                      {selectedTemplate.prompts.map((storyPrompt, index) => (
                        <div key={index} className='bg-blue-50 rounded-lg p-4'>
                          <p className='text-gray-700'>{storyPrompt}</p>
                          <Button
                            size='sm'
                            variant='link'
                            className='p-0 h-auto mt-2'
                            onClick={() => {
                              const response = prompt('Your response:');
                              if (response)
                                addTextContent(
                                  `Q: ${storyPrompt}\nA: ${response}`
                                );
                            }}
                          >
                            Answer this prompt →
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='settings' className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-700'>
                      Category
                    </label>
                    <Select
                      value={activeStory.category}
                      onValueChange={(value: LegacyStory['category']) =>
                        setActiveStory({ ...activeStory, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='memories'>Memories</SelectItem>
                        <SelectItem value='wisdom'>Wisdom</SelectItem>
                        <SelectItem value='family-traditions'>
                          Family Traditions
                        </SelectItem>
                        <SelectItem value='achievements'>
                          Achievements
                        </SelectItem>
                        <SelectItem value='life-events'>Life Events</SelectItem>
                        <SelectItem value='values'>Values</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-700'>
                      Target Audience
                    </label>
                    <Input
                      placeholder='e.g., children, grandchildren, family'
                      value={activeStory.targetAudience.join(', ')}
                      onChange={e =>
                        setActiveStory({
                          ...activeStory,
                          targetAudience: e.target.value
                            .split(',')
                            .map(s => s.trim()),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Tags
                  </label>
                  <Input
                    placeholder='Add tags separated by commas'
                    value={activeStory.tags.join(', ')}
                    onChange={e =>
                      setActiveStory({
                        ...activeStory,
                        tags: e.target.value.split(',').map(s => s.trim()),
                      })
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Existing Stories */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {stories.map(story => (
          <motion.div
            key={story.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {getCategoryIcon(story.category)}
                    <CardTitle className='text-lg'>{story.title}</CardTitle>
                  </div>
                  <Badge variant={story.isComplete ? 'default' : 'secondary'}>
                    {story.isComplete ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600 mb-3'>
                  {story.description}
                </p>

                <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
                  <span>{story.contents.length} content items</span>
                  <span>~{story.estimatedDuration}min</span>
                </div>

                <div className='flex flex-wrap gap-1 mb-3'>
                  {story.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                  {story.tags.length > 3 && (
                    <Badge variant='outline' className='text-xs'>
                      +{story.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setActiveStory(story)}
                    className='gap-1'
                  >
                    <Edit3 className='h-3 w-3' />
                    Edit
                  </Button>
                  <Button size='sm' variant='outline' className='gap-1'>
                    <Play className='h-3 w-3' />
                    View
                  </Button>
                  <Button size='sm' variant='outline' className='gap-1'>
                    <Share2 className='h-3 w-3' />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {stories.length === 0 && !isCreating && (
        <div className='text-center py-12'>
          <Archive className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Stories Yet
          </h3>
          <p className='text-gray-600 mb-4'>
            Create your first legacy story to preserve your family's memories
          </p>
          <Button onClick={() => setIsCreating(true)} className='gap-2'>
            <Plus className='h-4 w-4' />
            Create Your First Story
          </Button>
        </div>
      )}
    </div>
  );
};
