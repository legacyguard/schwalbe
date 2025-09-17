
import React, { useEffect, useRef, useState } from 'react';
// Card components import removed as unused
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
// Tabs components import removed as unused
// Separator import removed as unused
import { ScrollArea } from '../ui/scroll-area';
import {
  Bell,
  Calendar,
  Check,
  CheckCheck,
  Image,
  MessageCircle,
  Mic,
  Paperclip,
  Phone,
  Pin,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  Smile,
  Users,
  Video,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FamilyMember {
  avatar?: string;
  email: string;
  id: string;
  isOnline: boolean;
  lastSeen?: Date;
  name: string;
  role: 'child' | 'guardian' | 'head' | 'parent';
  timezone: string;
}

interface Message {
  content: string;
  id: string;
  isEdited: boolean;
  isRead: boolean;
  metadata?: {
    duration?: number; // for voice messages
    fileName?: string;
    fileSize?: number;
  };
  reactions: Reaction[];
  readBy: string[];
  replies: Message[];
  senderAvatar?: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'file' | 'image' | 'system' | 'text' | 'voice';
}

interface Reaction {
  emoji: string;
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

interface Channel {
  createdAt: Date;
  createdBy: string;
  description: string;
  id: string;
  isArchived: boolean;
  isPinned: boolean;
  lastActivity: Date;
  messages: Message[];
  name: string;
  participants: string[];
  settings: {
    allowAllMembers: boolean;
    muteNotifications: boolean;
    requireApproval: boolean;
  };
  type: 'announcements' | 'emergency' | 'general' | 'planning' | 'private';
  unreadCount: number;
}

interface Announcement {
  authorId: string;
  authorName: string;
  category: 'family-event' | 'financial' | 'general' | 'health' | 'legal';
  content: string;
  expiresAt?: Date;
  id: string;
  isPinned: boolean;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  readBy: string[];
  timestamp: Date;
  title: string;
}

interface FamilyCommunicationCenterProps {
  existingAnnouncements?: Announcement[];
  existingChannels?: Channel[];
  familyMembers?: FamilyMember[];
  onMessageSent?: (message: Message, channelId: string) => void;
}

export const FamilyCommunicationCenter: React.FC<
  FamilyCommunicationCenterProps
> = ({
  familyMembers = [],
  onMessageSent,
  existingChannels = [],
  existingAnnouncements = [],
}) => {
  const [channels, setChannels] = useState<Channel[]>(existingChannels);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    existingAnnouncements
  );
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [replyingTo, setReplyingTo] = useState<null | string>(null);
  const [currentUserId] = useState('current-user-id');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock current user
  const currentUser: FamilyMember = {
    id: currentUserId,
    name: 'You',
    email: 'user@example.com',
    role: 'parent',
    isOnline: true,
    timezone: 'UTC',
  };

  const allMembers = [currentUser, ...familyMembers];

  // Initialize with default channels if none exist
  useEffect(() => {
    if (channels.length === 0) {
      const defaultChannels: Channel[] = [
        {
          id: 'general',
          name: 'General',
          description: 'General family discussions',
          type: 'general',
          participants: allMembers.map(m => m.id),
          createdBy: currentUserId,
          createdAt: new Date(),
          lastActivity: new Date(),
          isPinned: true,
          isArchived: false,
          unreadCount: 0,
          messages: [],
          settings: {
            allowAllMembers: true,
            requireApproval: false,
            muteNotifications: false,
          },
        },
        {
          id: 'announcements',
          name: 'Announcements',
          description: 'Important family announcements',
          type: 'announcements',
          participants: allMembers.map(m => m.id),
          createdBy: currentUserId,
          createdAt: new Date(),
          lastActivity: new Date(),
          isPinned: true,
          isArchived: false,
          unreadCount: 0,
          messages: [],
          settings: {
            allowAllMembers: false,
            requireApproval: true,
            muteNotifications: false,
          },
        },
      ];

      setChannels(defaultChannels);
      setActiveChannel(defaultChannels[0] || null);
    }
  }, [allMembers, currentUserId, channels.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel?.messages]);

  const sendMessage = (content: string, type: Message['type'] = 'text') => {
    if (!activeChannel || !content.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '',
      content,
      type,
      timestamp: new Date(),
      isEdited: false,
      reactions: [],
      replies: [],
      isRead: true,
      readBy: [currentUserId],
    };

    const updatedChannel = {
      ...activeChannel,
      messages: [...activeChannel.messages, newMsg],
      lastActivity: new Date(),
    };

    setChannels(
      channels.map(c => (c.id === activeChannel.id ? updatedChannel : c))
    );
    setActiveChannel(updatedChannel);
    setNewMessage('');
    setReplyingTo(null);

    onMessageSent?.(newMsg, activeChannel.id);
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!activeChannel) return;

    const updatedMessages = activeChannel.messages.map(msg => {
      if (msg.id === messageId) {
        // Check if user already reacted with this emoji
        const existingReaction = msg.reactions.find(
          r => r.userId === currentUserId && r.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction
          return {
            ...msg,
            reactions: msg.reactions.filter(r => r.id !== existingReaction.id),
          };
        } else {
          // Add reaction
          const newReaction: Reaction = {
            id: `reaction-${Date.now()}`,
            userId: currentUserId,
            userName: currentUser.name,
            emoji,
            timestamp: new Date(),
          };
          return {
            ...msg,
            reactions: [...msg.reactions, newReaction],
          };
        }
      }
      return msg;
    });

    const updatedChannel = {
      ...activeChannel,
      messages: updatedMessages,
    };

    setChannels(
      channels.map(c => (c.id === activeChannel.id ? updatedChannel : c))
    );
    setActiveChannel(updatedChannel);
  };

  const createChannel = (
    name: string,
    description: string,
    type: Channel['type']
  ) => {
    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      name,
      description,
      type,
      participants:
        type === 'private' ? [currentUserId] : allMembers.map(m => m.id),
      createdBy: currentUserId,
      createdAt: new Date(),
      lastActivity: new Date(),
      isPinned: false,
      isArchived: false,
      unreadCount: 0,
      messages: [],
      settings: {
        allowAllMembers: type !== 'private',
        requireApproval: type === 'announcements',
        muteNotifications: false,
      },
    };

    setChannels([...channels, newChannel]);
    setActiveChannel(newChannel);
    setIsCreatingChannel(false);
  };

  const createAnnouncement = (
    title: string,
    content: string,
    priority: Announcement['priority']
  ) => {
    const announcement: Announcement = {
      id: `announcement-${Date.now()}`,
      title,
      content,
      authorId: currentUserId,
      authorName: currentUser.name,
      timestamp: new Date(),
      priority,
      category: 'general',
      readBy: [currentUserId],
      isPinned: priority === 'urgent',
    };

    setAnnouncements([announcement, ...announcements]);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        sendMessage(audioUrl, 'voice');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 60000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const fileUrl = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      sendMessage(fileUrl, type);
    });
  };

  const getChannelTypeIcon = (type: Channel['type']) => {
    switch (type) {
      case 'general':
        return <MessageCircle className='h-4 w-4' />;
      case 'announcements':
        return <Bell className='h-4 w-4' />;
      case 'emergency':
        return <Bell className='h-4 w-4 text-red-500' />;
      case 'planning':
        return <Calendar className='h-4 w-4' />;
      case 'private':
        return <Users className='h-4 w-4' />;
      default:
        return <MessageCircle className='h-4 w-4' />;
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const filteredMessages =
    activeChannel?.messages.filter(
      msg =>
        !searchQuery ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className='flex h-[800px] border rounded-lg overflow-hidden bg-white'>
      {/* Sidebar */}
      <div className='w-80 border-r bg-gray-50 flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-900'>
              Family Communication
            </h2>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className='h-4 w-4' />
              </Button>
              <Dialog
                open={isCreatingChannel}
                onOpenChange={setIsCreatingChannel}
              >
                <DialogTrigger asChild>
                  <Button size='sm' variant='ghost'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Channel</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <Input placeholder='Channel name' />
                    <Textarea placeholder='Channel description' rows={3} />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder='Channel type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='general'>General</SelectItem>
                        <SelectItem value='planning'>Planning</SelectItem>
                        <SelectItem value='private'>Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() =>
                        createChannel(
                          'New Channel',
                          'Channel description',
                          'general'
                        )
                      }
                      className='w-full'
                    >
                      Create Channel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {showSearch && (
            <Input
              placeholder='Search messages...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='mt-3'
            />
          )}
        </div>

        {/* Announcements Section */}
        <div className='p-4 border-b'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-medium text-gray-900'>Announcements</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size='sm' variant='ghost'>
                  <Plus className='h-3 w-3' />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <Input placeholder='Announcement title' />
                  <Textarea placeholder='Announcement content' rows={4} />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder='Priority' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                      <SelectItem value='urgent'>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      createAnnouncement(
                        'New Announcement',
                        'Announcement content',
                        'medium'
                      )
                    }
                    className='w-full'
                  >
                    Create Announcement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className='max-h-40'>
            <div className='space-y-2'>
              {announcements.slice(0, 3).map(announcement => (
                <div
                  key={announcement.id}
                  className={`p-2 rounded text-xs border ${getPriorityColor(announcement.priority)}`}
                >
                  <div className='font-medium'>{announcement.title}</div>
                  <div className='text-xs opacity-75 mt-1'>
                    {announcement.content.slice(0, 50)}...
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Channel List */}
        <div className='flex-1 overflow-y-auto'>
          <div className='p-4'>
            <h3 className='font-medium text-gray-900 mb-3'>Channels</h3>
            <div className='space-y-1'>
              {channels.map(channel => (
                <motion.div
                  key={channel.id}
                  whileHover={{ x: 2 }}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    activeChannel?.id === channel.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveChannel(channel)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      {getChannelTypeIcon(channel.type)}
                      <span className='font-medium'>{channel.name}</span>
                      {channel.isPinned && <Pin className='h-3 w-3' />}
                    </div>
                    {channel.unreadCount > 0 && (
                      <Badge variant='destructive' className='text-xs'>
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center justify-between mt-1'>
                    <span className='text-xs text-gray-500 truncate'>
                      {channel.description}
                    </span>
                    <span className='text-xs text-gray-400'>
                      {formatTime(channel.lastActivity)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Online Members */}
        <div className='p-4 border-t'>
          <h3 className='font-medium text-gray-900 mb-3'>Online</h3>
          <div className='space-y-2'>
            {allMembers
              .filter(m => m.isOnline)
              .map(member => (
                <div key={member.id} className='flex items-center gap-2'>
                  <div className='relative'>
                    <Avatar className='w-6 h-6'>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className='text-xs'>
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full' />
                  </div>
                  <span className='text-sm text-gray-700'>{member.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {activeChannel ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b bg-white flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                {getChannelTypeIcon(activeChannel.type)}
                <div>
                  <h3 className='font-bold text-gray-900'>
                    {activeChannel.name}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {activeChannel.description}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button size='sm' variant='ghost'>
                  <Phone className='h-4 w-4' />
                </Button>
                <Button size='sm' variant='ghost'>
                  <Video className='h-4 w-4' />
                </Button>
                <Button size='sm' variant='ghost'>
                  <Settings className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='flex-1 p-4'>
              <div className='space-y-4'>
                <AnimatePresence>
                  {filteredMessages.map((message, index) => {
                    const showAvatar =
                      index === 0 ||
                      filteredMessages[index - 1].senderId !==
                        message.senderId ||
                      message.timestamp.getTime() -
                        filteredMessages[index - 1].timestamp.getTime() >
                        300000; // 5 minutes

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex gap-3 group ${message.senderId === currentUserId ? 'justify-end' : ''}`}
                      >
                        {message.senderId !== currentUserId && showAvatar && (
                          <Avatar className='w-8 h-8'>
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback className='text-xs'>
                              {message.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {message.senderId !== currentUserId && !showAvatar && (
                          <div className='w-8' />
                        )}

                        <div
                          className={`flex-1 max-w-lg ${message.senderId === currentUserId ? 'flex justify-end' : ''}`}
                        >
                          {showAvatar && message.senderId !== currentUserId && (
                            <div className='flex items-center gap-2 mb-1'>
                              <span className='text-sm font-medium text-gray-900'>
                                {message.senderName}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`p-3 rounded-lg ${
                              message.senderId === currentUserId
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.type === 'text' && (
                              <p className='text-sm'>{message.content}</p>
                            )}
                            {message.type === 'image' && (
                              <img
                                src={message.content}
                                alt='Shared'
                                className='max-w-full rounded'
                              />
                            )}
                            {message.type === 'voice' && (
                              <div className='flex items-center gap-2'>
                                <Mic className='h-4 w-4' />
                                <span className='text-sm'>Voice message</span>
                                <audio
                                  controls
                                  src={message.content}
                                  className='max-w-full'
                                />
                              </div>
                            )}
                            {message.type === 'file' && (
                              <div className='flex items-center gap-2'>
                                <Paperclip className='h-4 w-4' />
                                <span className='text-sm'>
                                  {message.metadata?.fileName || 'File'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Reactions */}
                          {message.reactions.length > 0 && (
                            <div className='flex gap-1 mt-1'>
                              {Array.from(
                                new Set(message.reactions.map(r => r.emoji))
                              ).map(emoji => {
                                const count = message.reactions.filter(
                                  r => r.emoji === emoji
                                ).length;
                                const userReacted = message.reactions.some(
                                  r =>
                                    r.userId === currentUserId &&
                                    r.emoji === emoji
                                );

                                return (
                                  <button
                                    key={emoji}
                                    onClick={() =>
                                      addReaction(message.id, emoji)
                                    }
                                    className={`text-xs px-2 py-1 rounded-full border ${
                                      userReacted
                                        ? 'bg-blue-100 border-blue-300'
                                        : 'bg-white border-gray-200'
                                    }`}
                                  >
                                    {emoji} {count}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className='opacity-0 group-hover:opacity-100 transition-opacity mt-1'>
                            <div className='flex gap-1'>
                              <button
                                onClick={() => addReaction(message.id, '👍')}
                                className='text-xs p-1 hover:bg-gray-200 rounded'
                              >
                                👍
                              </button>
                              <button
                                onClick={() => addReaction(message.id, '❤️')}
                                className='text-xs p-1 hover:bg-gray-200 rounded'
                              >
                                ❤️
                              </button>
                              <button
                                onClick={() => setReplyingTo(message.id)}
                                className='text-xs p-1 hover:bg-gray-200 rounded'
                              >
                                <Reply className='h-3 w-3' />
                              </button>
                            </div>
                          </div>

                          {message.senderId === currentUserId && (
                            <div className='flex items-center justify-end gap-1 mt-1'>
                              <span className='text-xs text-gray-400'>
                                {formatTime(message.timestamp)}
                              </span>
                              {message.readBy.length > 1 ? (
                                <CheckCheck className='h-3 w-3 text-blue-500' />
                              ) : (
                                <Check className='h-3 w-3 text-gray-400' />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className='p-4 border-t bg-white'>
              {replyingTo && (
                <div className='mb-3 p-2 bg-gray-50 rounded text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>
                      Replying to{' '}
                      {
                        filteredMessages.find(m => m.id === replyingTo)
                          ?.senderName
                      }
                    </span>
                    <button onClick={() => setReplyingTo(null)}>
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              )}

              <div className='flex items-center gap-2'>
                <div className='flex-1 flex items-center gap-2 bg-gray-50 rounded-lg p-2'>
                  <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder='Type a message...'
                    className='border-0 bg-transparent focus-visible:ring-0'
                    onKeyPress={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(newMessage);
                      }
                    }}
                  />
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className='h-4 w-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image className='h-4 w-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={
                        isRecording ? stopVoiceRecording : startVoiceRecording
                      }
                      className={isRecording ? 'text-red-500' : ''}
                    >
                      <Mic className='h-4 w-4' />
                    </Button>
                    <Button size='sm' variant='ghost'>
                      <Smile className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => sendMessage(newMessage)}
                  disabled={!newMessage.trim()}
                  className='gap-2'
                >
                  <Send className='h-4 w-4' />
                  Send
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'
                onChange={e => handleFileUpload(e.target.files)}
                className='hidden'
              />
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-500'>
            <div className='text-center'>
              <MessageCircle className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                Select a Channel
              </h3>
              <p className='text-gray-600'>
                Choose a channel from the sidebar to start communicating
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
