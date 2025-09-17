
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { TimeCapsule } from '@/types/timeCapsule';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';


interface TimeCapsuleListProps {
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  onTestPreview?: (id: string) => void;
  timeCapsules: TimeCapsule[];
}

export function TimeCapsuleList({
  timeCapsules,
  onDelete,
  onTestPreview,
}: TimeCapsuleListProps) {
  const { t } = useTranslation('ui/time-capsule-list');
  const defaultOnTestPreview = onTestPreview || (() => {});
  const [deleteConfirm, setDeleteConfirm] = useState<null | string>(null);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'clock';
      case 'DELIVERED':
        return 'check-circle';
      case 'FAILED':
        return 'alert-circle';
      case 'CANCELLED':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  };

  const handleDeleteConfirm = (capsuleId: string) => {
    onDelete(capsuleId);
    setDeleteConfirm(null);
  };

  // Group capsules by status
  const groupedCapsules = timeCapsules.reduce(
    (groups, capsule) => {
      const key = capsule.is_delivered
        ? 'delivered'
        : capsule.status === 'FAILED'
          ? 'failed'
          : 'pending';
      if (!groups[key]) groups[key] = [];
      groups[key].push(capsule);
      return groups;
    },
    {} as Record<string, TimeCapsule[]>
  );

  return (
    <div className='space-y-6'>
      {/* Pending Capsules */}
      {groupedCapsules['pending'] && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Icon name="clock" className='w-5 h-5 text-orange-600' />
            {t('sections.pendingDelivery', { count: groupedCapsules['pending'].length })}
          </h3>
          <div className='grid gap-4'>
            {groupedCapsules['pending'].map(capsule => (
              <TimeCapsuleCard
                key={capsule.id}
                capsule={capsule}
                onDelete={() => setDeleteConfirm(capsule.id)}
                onTestPreview={defaultOnTestPreview}
                getInitials={getInitials}
                formatDuration={formatDuration}
                formatFileSize={formatFileSize}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delivered Capsules */}
      {groupedCapsules['delivered'] && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Icon
              name="check-circle"
              className='w-5 h-5 text-green-600'
            />
            {t('sections.delivered', { count: groupedCapsules['delivered'].length })}
          </h3>
          <div className='grid gap-4'>
            {groupedCapsules['delivered'].map(capsule => (
              <TimeCapsuleCard
                key={capsule.id}
                capsule={capsule}
                onDelete={() => setDeleteConfirm(capsule.id)}
                onTestPreview={defaultOnTestPreview}
                getInitials={getInitials}
                formatDuration={formatDuration}
                formatFileSize={formatFileSize}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                isDelivered={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Failed Capsules */}
      {groupedCapsules['failed'] && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Icon
              name="alert-circle"
              className='w-5 h-5 text-red-600'
            />
            {t('sections.failedDelivery', { count: groupedCapsules['failed'].length })}
          </h3>
          <div className='grid gap-4'>
            {groupedCapsules['failed'].map(capsule => (
              <TimeCapsuleCard
                key={capsule.id}
                capsule={capsule}
                onDelete={() => setDeleteConfirm(capsule.id)}
                onTestPreview={defaultOnTestPreview}
                getInitials={getInitials}
                formatDuration={formatDuration}
                formatFileSize={formatFileSize}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                isFailed={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleDeleteConfirm(deleteConfirm)
              }
              className='bg-red-600 hover:bg-red-700'
            >
              {t('deleteDialog.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface TimeCapsuleCardProps {
  capsule: TimeCapsule;
  formatDuration: (seconds: number) => string;
  formatFileSize: (bytes: number) => string;
  getInitials: (name: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  isDelivered?: boolean;
  isFailed?: boolean;
  onDelete: () => void;
  onTestPreview?: (id: string) => void;
}

function TimeCapsuleCard({
  capsule,
  onDelete,
  onTestPreview,
  getInitials,
  formatDuration,
  formatFileSize,
  getStatusColor,
  getStatusIcon,
  isDelivered,
  isFailed,
}: TimeCapsuleCardProps) {
  const { t } = useTranslation('ui/time-capsule-list');
  const capsuleId = capsule.id.slice(-8).toUpperCase();

  return (
    <Card className='hover:shadow-md transition-all duration-300 relative overflow-hidden group'>
      {/* Elegant seal corner */}
      <div className='absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rotate-45 flex items-center justify-center'>
        <div className='rotate-[-45deg] text-white text-xs font-bold flex flex-col items-center'>
          <Icon name="shield-check" className='w-3 h-3 mb-0.5' />
          <span className='text-[8px] leading-none'>{t('card.sealed')}</span>
        </div>
      </div>

      {/* Premium gradient border for sealed capsules */}
      <div className='absolute inset-0 bg-gradient-to-r from-purple-200/20 via-pink-200/20 to-indigo-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

      <CardHeader className='pb-3 relative'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start space-x-3 flex-1'>
            {/* Enhanced avatar with gradient */}
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm opacity-30' />
              <Avatar className='relative border-2 border-white/50'>
                <AvatarFallback className='bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold'>
                  {getInitials(capsule.recipient_name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <h4 className='font-semibold text-lg truncate'>
                  {capsule.message_title}
                </h4>
                <div className='flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full'>
                  <Icon name="lock" className='w-3 h-3' />
                  <span>#{capsuleId}</span>
                </div>
              </div>
              <div className='flex items-center gap-2 text-sm text-muted-foreground mt-1'>
                <Icon name="user" className='w-3 h-3 flex-shrink-0' />
                <span className='truncate'>{t('card.recipient', { name: capsule.recipient_name })}</span>
                <span>•</span>
                <Icon name="mail" className='w-3 h-3 flex-shrink-0' />
                <span className='truncate'>{capsule.recipient_email}</span>
              </div>
              {capsule.message_preview && (
                <p className='text-sm text-muted-foreground mt-2 line-clamp-2 italic'>
                  "{capsule.message_preview}"
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <Icon name="more-horizontal" className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {isDelivered && (
                <>
                  <DropdownMenuItem>
                    <Icon
                      name="external-link"
                      className='w-4 h-4 mr-2'
                    />
                    {t('menu.viewDeliveredMessage')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {!isDelivered && (
                <>
                  <DropdownMenuItem>
                    <Icon name="eye" className='w-4 h-4 mr-2' />
                    {t('menu.previewRecording')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-blue-600 focus:text-blue-600'
                    onClick={() => onTestPreview?.(capsule.id)}
                  >
                    <Icon name="mail-check" className='w-4 h-4 mr-2' />
                    {t('menu.sendTestPreview')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className='text-red-600 focus:text-red-600'
              >
                <Icon name="trash-2" className='w-4 h-4 mr-2' />
                {t('menu.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='pt-0 space-y-3'>
        {/* Enhanced Delivery Information */}
        <div className='relative p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 rounded-lg border border-purple-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-white rounded-full shadow-sm'>
                <Icon
                  name={
                    capsule.delivery_condition === 'ON_DATE'
                      ? 'calendar'
                      : 'shield'
                  }
                  className='w-4 h-4 text-purple-600'
                />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-900'>
                  {capsule.delivery_condition === 'ON_DATE' &&
                  capsule.delivery_date
                    ? t('card.deliveryConditions.scheduledDelivery')
                    : t('card.deliveryConditions.familyShieldActivation')}
                </p>
                <p className='text-xs text-gray-600'>
                  {capsule.delivery_condition === 'ON_DATE' &&
                  capsule.delivery_date
                    ? t('card.deliveryConditions.scheduledDate', { date: format(new Date(capsule.delivery_date), 'MMMM d, yyyy') })
                    : t('card.deliveryConditions.activationMessage')}
                </p>
              </div>
            </div>

            <Badge className={`${getStatusColor(capsule.status)} shadow-sm`}>
              <Icon
                name={getStatusIcon(capsule.status) as any}
                className='w-3 h-3 mr-1'
              />
              {capsule.status === 'PENDING'
                ? t('card.status.sealed')
                : capsule.status === 'DELIVERED'
                  ? t('card.status.delivered')
                  : capsule.status === 'FAILED'
                    ? t('card.status.failed')
                    : capsule.status}
            </Badge>
          </div>
        </div>

        {/* Recording Details */}
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-1'>
              <Icon
                name={capsule.file_type === 'video' ? 'video' : 'mic'}
                className='w-3 h-3 text-muted-foreground'
              />
              <span className='capitalize'>{capsule.file_type}</span>
            </div>
            {capsule.duration_seconds && (
              <div className='flex items-center space-x-1'>
                <Icon
                  name="clock"
                  className='w-3 h-3 text-muted-foreground'
                />
                <span>{formatDuration(capsule.duration_seconds)}</span>
              </div>
            )}
            {capsule.file_size_bytes && (
              <div className='flex items-center space-x-1'>
                <Icon
                  name="hard-drive"
                  className='w-3 h-3 text-muted-foreground'
                />
                <span>{formatFileSize(capsule.file_size_bytes)}</span>
              </div>
            )}
          </div>

          <span className='text-muted-foreground'>
            {t('card.created', { date: format(new Date(capsule.created_at), 'MMM d, yyyy') })}
          </span>
        </div>

        {/* Delivery Status Details */}
        {isDelivered && capsule.delivered_at && (
          <div className='p-2 bg-green-50 border border-green-200 rounded text-sm'>
            <Icon
              name="check-circle"
              className='w-4 h-4 inline mr-2 text-green-600'
            />
            <span className='text-green-800'>
              {t('card.deliveryStatus.deliveredOn', {
                date: format(new Date(capsule.delivered_at), "MMMM d, yyyy 'at' h:mm a")
              })}
            </span>
          </div>
        )}

        {isFailed && capsule.delivery_error && (
          <div className='p-2 bg-red-50 border border-red-200 rounded text-sm'>
            <Icon
              name="alert-circle"
              className='w-4 h-4 inline mr-2 text-red-600'
            />
            <span className='text-red-800'>
              {t('card.deliveryStatus.deliveryFailed', { error: capsule.delivery_error })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
