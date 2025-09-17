
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { cn } from '@/lib/utils';
import { Calendar, Mail, MapPin, MoreVertical, Phone } from 'lucide-react';

export interface ProfileData {
  address?: string;
  avatar?: string;
  completionPercentage?: number;
  dateOfBirth?: string;
  email?: string;
  id: string;
  metadata?: Record<string, unknown>;
  name: string;
  phone?: string;
  relationship?: string;
  roles?: string[];
  status?: 'active' | 'inactive' | 'pending';
}

interface ProfileCardProps {
  className?: string;
  onDelete?: (profile: ProfileData) => void;
  onEdit?: (profile: ProfileData) => void;
  onMessage?: (profile: ProfileData) => void;
  onViewDetails?: (profile: ProfileData) => void;
  profile: ProfileData;
  showActions?: boolean;
  variant?: 'compact' | 'default' | 'detailed';
}

export function ProfileCard({
  profile,
  variant = 'default',
  showActions = true,
  onEdit,
  onDelete,
  onViewDetails,
  onMessage,
  className,
}: ProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getRoleBadgeVariant = (
    role: string
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    const roleMap: Record<
      string,
      'default' | 'destructive' | 'outline' | 'secondary'
    > = {
      executor: 'default',
      guardian: 'secondary',
      beneficiary: 'outline',
      admin: 'destructive',
    };
    return roleMap[role.toLowerCase()] || 'outline';
  };

  if (variant === 'compact') {
    return (
      <FadeIn duration={0.5}>
        <Card
          className={cn(
            'hover:shadow-lg transition-all duration-300 cursor-pointer',
            className
          )}
        >
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-card-foreground truncate'>
                  {profile.name}
                </p>
                {profile.relationship && (
                  <p className='text-xs text-muted-foreground'>
                    {profile.relationship}
                  </p>
                )}
              </div>
              {profile.status && (
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    getStatusColor(profile.status)
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <FadeIn duration={0.5}>
      <Card
        className={cn('hover:shadow-lg transition-all duration-300', className)}
      >
        <CardHeader className='pb-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                {profile.status && (
                  <div
                    className={cn(
                      'absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white',
                      getStatusColor(profile.status)
                    )}
                  />
                )}
              </div>
              <div>
                <h3 className='text-lg font-semibold text-card-foreground'>
                  {profile.name}
                </h3>
                {profile.relationship && (
                  <p className='text-sm text-muted-foreground'>
                    {profile.relationship}
                  </p>
                )}
              </div>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {onViewDetails && (
                    <DropdownMenuItem onClick={() => onViewDetails(profile)}>
                      <Icon name='eye' className='mr-2 h-4 w-4' />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onMessage && (
                    <DropdownMenuItem onClick={() => onMessage(profile)}>
                      <Mail className='mr-2 h-4 w-4' />
                      Send Message
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(profile)}>
                      <Icon name='edit' className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(profile)}
                        className='text-red-600'
                      >
                        <Icon name='trash' className='mr-2 h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Roles */}
          {profile.roles && profile.roles.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {profile.roles.map((role, index) => (
                <Badge key={index} variant={getRoleBadgeVariant(role)}>
                  {role}
                </Badge>
              ))}
            </div>
          )}

          {/* Contact Information */}
          <div className='space-y-2'>
            {profile.email && (
              <div className='flex items-center text-sm text-muted-foreground'>
                <Mail className='mr-2 h-4 w-4' />
                <span className='truncate'>{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className='flex items-center text-sm text-muted-foreground'>
                <Phone className='mr-2 h-4 w-4' />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.dateOfBirth && (
              <div className='flex items-center text-sm text-muted-foreground'>
                <Calendar className='mr-2 h-4 w-4' />
                <span>{profile.dateOfBirth}</span>
              </div>
            )}
            {profile.address && (
              <div className='flex items-center text-sm text-muted-foreground'>
                <MapPin className='mr-2 h-4 w-4' />
                <span className='truncate'>{profile.address}</span>
              </div>
            )}
          </div>

          {/* Completion Progress */}
          {profile.completionPercentage !== undefined && (
            <div className='pt-2'>
              <div className='flex justify-between text-sm mb-1'>
                <span className='text-muted-foreground'>
                  Profile Completion
                </span>
                <span className='font-medium'>
                  {profile.completionPercentage}%
                </span>
              </div>
              <div className='w-full bg-muted rounded-full h-2'>
                <div
                  className='bg-primary h-2 rounded-full transition-all duration-500'
                  style={{ width: `${profile.completionPercentage}}%` }}
                />
              </div>
            </div>
          )}

          {/* Additional Metadata */}
          {variant === 'detailed' && profile.metadata && (
            <div className='pt-2 border-t'>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                {Object.entries(profile.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className='text-muted-foreground'>{key}:</span>
                    <span className='ml-1 font-medium'>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}

// Grid layout for multiple profile cards
interface ProfileGridProps {
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  onDelete?: (profile: ProfileData) => void;
  onEdit?: (profile: ProfileData) => void;
  onMessage?: (profile: ProfileData) => void;
  onViewDetails?: (profile: ProfileData) => void;
  profiles: ProfileData[];
  showActions?: boolean;
  variant?: 'compact' | 'default' | 'detailed';
}

export function ProfileGrid({
  profiles,
  variant = 'default',
  columns = 3,
  showActions = true,
  onEdit,
  onDelete,
  onViewDetails,
  onMessage,
  className,
}: ProfileGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {profiles.map(profile => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          variant={variant}
          showActions={showActions}
          onEdit={onEdit || (() => {})}
          onDelete={onDelete || (() => {})}
          onViewDetails={onViewDetails || (() => {})}
          onMessage={onMessage || (() => {})}
        />
      ))}
    </div>
  );
}
