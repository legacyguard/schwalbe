/**
 * Mobile-Optimized Family Collaboration
 * Touch-friendly interface for family member interactions and document sharing
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Share,
  Users,
} from 'lucide-react';
import {
  mobileOptimized,
  useBreakpoint,
} from '@/lib/performance/mobile-optimization';
import { cn } from '@/lib/utils';

interface FamilyMember {
  avatar?: string;
  completedTasks: number;
  documentsCount: number;
  email?: string;
  id: string;
  isOnline?: boolean;
  lastActive?: Date;
  name: string;
  pendingTasks: number;
  phone?: string;
  role: 'child' | 'guardian' | 'head' | 'spouse';
}

interface MobileFamilyCollaborationProps {
  currentUserId: string;
  familyId: string;
  onNavigate?: (section: string, params?: any) => void;
}

export const MobileFamilyCollaboration: React.FC<
  MobileFamilyCollaborationProps
> = ({ familyId: _familyId, currentUserId: _currentUserId, onNavigate }) => {
  const { isSmall } = useBreakpoint();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    'activity' | 'documents' | 'members'
  >('members');

  // Mock family members data
  const familyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'head',
      avatar: undefined,
      email: 'sarah@example.com',
      phone: '+1234567890',
      lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isOnline: true,
      documentsCount: 12,
      pendingTasks: 2,
      completedTasks: 8,
    },
    {
      id: '2',
      name: 'Mike Johnson',
      role: 'spouse',
      avatar: undefined,
      email: 'mike@example.com',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isOnline: false,
      documentsCount: 8,
      pendingTasks: 1,
      completedTasks: 5,
    },
    {
      id: '3',
      name: 'Emma Johnson',
      role: 'child',
      avatar: undefined,
      email: 'emma@example.com',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isOnline: false,
      documentsCount: 3,
      pendingTasks: 0,
      completedTasks: 2,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'document',
      user: 'Sarah Johnson',
      action: 'shared will document',
      time: '1 hour ago',
    },
    {
      id: 2,
      type: 'task',
      user: 'Mike Johnson',
      action: 'completed insurance review',
      time: '3 hours ago',
    },
    {
      id: 3,
      type: 'message',
      user: 'Emma Johnson',
      action: 'added comment on family calendar',
      time: '1 day ago',
    },
  ];

  const getRoleColor = (role: FamilyMember['role']) => {
    switch (role) {
      case 'head':
        return 'bg-blue-100 text-blue-800';
      case 'spouse':
        return 'bg-green-100 text-green-800';
      case 'child':
        return 'bg-purple-100 text-purple-800';
      case 'guardian':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastActive = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isSmall) {
    return null; // Return desktop version for larger screens
  }

  const renderMemberCard = (member: FamilyMember) => (
    <Card
      key={member.id}
      {...mobileOptimized.card(true)}
      className='hover:shadow-md transition-shadow'
      onClick={() => setSelectedMember(member)}
    >
      <CardContent className='p-4'>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={member.avatar} />
              <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-500 text-white'>
                {member.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            {member.isOnline && (
              <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center space-x-2 mb-1'>
              <h3 className='font-medium text-gray-900 truncate'>
                {member.name}
              </h3>
              <Badge className={`${getRoleColor(member.role)} text-xs`}>
                {member.role}
              </Badge>
            </div>

            <div className='flex items-center space-x-4 text-sm text-gray-500'>
              <div className='flex items-center'>
                <FileText className='w-3 h-3 mr-1' />
                {member.documentsCount}
              </div>
              <div className='flex items-center'>
                <Clock className='w-3 h-3 mr-1' />
                {formatLastActive(member.lastActive!)}
              </div>
            </div>

            {member.pendingTasks > 0 && (
              <div className='flex items-center mt-2'>
                <AlertCircle className='w-3 h-3 mr-1 text-orange-500' />
                <span className='text-xs text-orange-600'>
                  {member.pendingTasks} pending task
                  {member.pendingTasks > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className='flex flex-col items-center space-y-1'>
            <Button
              size='sm'
              variant='ghost'
              {...mobileOptimized.button('sm')}
              onClick={e => {
                e.stopPropagation();
                onNavigate?.('message', { memberId: member.id });
              }}
            >
              <MessageCircle className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Mobile Header */}
      <div className='bg-white shadow-sm p-4 sticky top-0 z-10'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-bold text-gray-900'>
              Family Collaboration
            </h1>
            <p className='text-sm text-gray-600'>
              {familyMembers.length} family members
            </p>
          </div>
          <Button
            size='sm'
            {...mobileOptimized.button('md')}
            onClick={() => onNavigate?.('invite')}
          >
            <Plus className='w-4 h-4 mr-1' />
            Invite
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className='flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1'>
          {[
            { id: 'members', label: 'Members', icon: Users },
            { id: 'activity', label: 'Activity', icon: Clock },
            { id: 'documents', label: 'Shared', icon: Share },
          ].map(tab => (
            <button
              key={tab.id}
              {...mobileOptimized.button('md')}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors text-sm',
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              )}
            >
              <tab.icon className='w-4 h-4' />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className='p-4'>
        <AnimatePresence mode='wait'>
          {activeTab === 'members' && (
            <motion.div
              key='members'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='space-y-3'
            >
              {familyMembers.map(renderMemberCard)}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key='activity'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='space-y-3'
            >
              {recentActivity.map(activity => (
                <Card key={activity.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-start space-x-3'>
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                        {activity.type === 'document' && (
                          <FileText className='w-4 h-4 text-blue-600' />
                        )}
                        {activity.type === 'task' && (
                          <CheckCircle className='w-4 h-4 text-green-600' />
                        )}
                        {activity.type === 'message' && (
                          <MessageCircle className='w-4 h-4 text-purple-600' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm text-gray-900'>
                          <span className='font-medium'>{activity.user}</span>{' '}
                          {activity.action}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key='documents'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='space-y-3'
            >
              <Card>
                <CardContent className='p-8 text-center'>
                  <Share className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='font-medium text-gray-900 mb-2'>
                    No shared documents yet
                  </h3>
                  <p className='text-sm text-gray-500 mb-4'>
                    Share documents with family members to collaborate on legacy
                    planning
                  </p>
                  <Button {...mobileOptimized.button('md')}>
                    <Plus className='w-4 h-4 mr-2' />
                    Share Document
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Member Detail Sheet */}
      <Sheet
        open={!!selectedMember}
        onOpenChange={() => setSelectedMember(null)}
      >
        <SheetContent side='bottom' className='max-h-[80vh]'>
          <SheetHeader>
            <SheetTitle className='flex items-center space-x-3'>
              {selectedMember && (
                <>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={selectedMember.avatar} />
                    <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm'>
                      {selectedMember.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='text-left'>{selectedMember.name}</div>
                    <Badge
                      className={`${getRoleColor(selectedMember.role)} text-xs`}
                    >
                      {selectedMember.role}
                    </Badge>
                  </div>
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          {selectedMember && (
            <div className='space-y-4 mt-6'>
              {/* Contact Actions */}
              <div className='grid grid-cols-3 gap-3'>
                <Button
                  variant='outline'
                  {...mobileOptimized.button('lg')}
                  onClick={() =>
                    onNavigate?.('message', { memberId: selectedMember.id })
                  }
                >
                  <MessageCircle className='w-4 h-4 mb-1' />
                  <span className='text-xs'>Message</span>
                </Button>
                <Button
                  variant='outline'
                  {...mobileOptimized.button('lg')}
                  onClick={() => window.open(`tel:${selectedMember.phone}`)}
                >
                  <Phone className='w-4 h-4 mb-1' />
                  <span className='text-xs'>Call</span>
                </Button>
                <Button
                  variant='outline'
                  {...mobileOptimized.button('lg')}
                  onClick={() => window.open(`mailto:${selectedMember.email}`)}
                >
                  <Mail className='w-4 h-4 mb-1' />
                  <span className='text-xs'>Email</span>
                </Button>
              </div>

              {/* Statistics */}
              <Card>
                <CardContent className='p-4'>
                  <div className='grid grid-cols-3 divide-x'>
                    <div className='text-center'>
                      <div className='text-lg font-bold text-blue-600'>
                        {selectedMember.documentsCount}
                      </div>
                      <div className='text-xs text-gray-500'>Documents</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-lg font-bold text-green-600'>
                        {selectedMember.completedTasks}
                      </div>
                      <div className='text-xs text-gray-500'>Completed</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-lg font-bold text-orange-600'>
                        {selectedMember.pendingTasks}
                      </div>
                      <div className='text-xs text-gray-500'>Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className='space-y-2'>
                <Button
                  variant='outline'
                  {...mobileOptimized.button('lg')}
                  className='w-full justify-start'
                  onClick={() =>
                    onNavigate?.('share', { memberId: selectedMember.id })
                  }
                >
                  <Share className='w-4 h-4 mr-3' />
                  Share Documents
                </Button>
                <Button
                  variant='outline'
                  {...mobileOptimized.button('lg')}
                  className='w-full justify-start'
                  onClick={() =>
                    onNavigate?.('calendar', { memberId: selectedMember.id })
                  }
                >
                  <Calendar className='w-4 h-4 mr-3' />
                  View Shared Calendar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
