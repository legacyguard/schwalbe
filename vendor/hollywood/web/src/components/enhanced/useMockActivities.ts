
import type { ActivityItem } from './activityFeedTypes';

export function useMockActivities(): ActivityItem[] {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return [
    {
      id: '1',
      type: 'document',
      action: 'uploaded',
      description: 'Last Will and Testament uploaded',
      timestamp: oneHourAgo,
      icon: 'file-text',
      color: 'success',
      user: {
        name: 'John Doe',
        avatar: '/avatars/john.jpg',
      },
    },
    {
      id: '2',
      type: 'family',
      action: 'added',
      description: 'New family member added: Sarah Doe',
      timestamp: twoHoursAgo,
      icon: 'users',
      color: 'primary',
      user: {
        name: 'John Doe',
        avatar: '/avatars/john.jpg',
      },
    },
    {
      id: '3',
      type: 'guardian',
      action: 'assigned',
      description: 'Guardian assigned to minor children',
      timestamp: oneDayAgo,
      icon: 'shield',
      color: 'warning',
      user: {
        name: 'John Doe',
        avatar: '/avatars/john.jpg',
      },
    },
    {
      id: '4',
      type: 'security',
      action: 'enabled',
      description: 'Two-factor authentication enabled',
      timestamp: oneDayAgo,
      icon: 'lock',
      color: 'info',
      user: {
        name: 'John Doe',
        avatar: '/avatars/john.jpg',
      },
    },
  ];
}
