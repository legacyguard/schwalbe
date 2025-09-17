
import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Calendar } from '../ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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
import { Checkbox } from '../ui/checkbox';
import {
  AlertTriangle,
  Bell,
  Calendar as CalendarIcon,
  Clock,
  Gift,
  Heart,
  Plus,
  Repeat,
  Star,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FamilyCalendarEvent, FamilyMember } from '@/types/family';
import { familyService } from '@/services/familyService';
import {
  addDays,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isToday,
  startOfMonth,
} from 'date-fns';
import { useToast } from '../ui/use-toast';
import { mapFrontendToDatabaseType } from '@/lib/types/event-type-mapping';

interface SharedFamilyCalendarProps {
  familyMembers: FamilyMember[];
  userId: string;
}

interface NewEventForm {
  attendees?: any;
  date: Date;
  description: string;
  durationMinutes?: number;
  location?: string;
  meetingUrl?: string;
  notifyMembers: string[];
  priority: FamilyCalendarEvent['priority'];
  recurring?: {
    endDate?: Date;
    frequency: 'monthly' | 'weekly' | 'yearly';
  };
  relatedMemberId?: string;
  title: string;
  type: FamilyCalendarEvent['type'];
}

const defaultForm: NewEventForm = {
  title: '',
  description: '',
  date: new Date(),
  type: 'custom',
  notifyMembers: [],
  priority: 'medium',
  durationMinutes: 60,
  location: '',
  meetingUrl: '',
  attendees: {},
};

const eventTypeConfig = {
  birthday: {
    icon: Gift,
    color: 'bg-accent/10 text-accent border-accent/20',
    label: 'Birthday',
  },
  anniversary: {
    icon: Heart,
    color: 'bg-secondary/10 text-secondary border-secondary/20',
    label: 'Anniversary',
  },
  document_expiry: {
    icon: AlertTriangle,
    color: 'bg-warning/10 text-warning border-warning/20',
    label: 'Document Expiry',
  },
  appointment: {
    icon: Clock,
    color: 'bg-primary/10 text-primary border-primary/20',
    label: 'Appointment',
  },
  milestone: {
    icon: Star,
    color: 'bg-accent/10 text-accent border-accent/20',
    label: 'Milestone',
  },
  custom: {
    icon: CalendarIcon,
    color: 'bg-background text-text-main border-border',
    label: 'Custom Event',
  },
};

const priorityColors = {
  low: 'border-blue-400',
  medium: 'border-yellow-400',
  high: 'border-orange-400',
  critical: 'border-red-400',
};
export function SharedFamilyCalendar({
  userId,
  familyMembers,
}: SharedFamilyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<FamilyCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [newEventForm, setNewEventForm] = useState<NewEventForm>(defaultForm);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<
    'all' | 'birthdays' | 'documents' | 'upcoming'
  >('all');
  const { toast } = useToast();

  const loadCalendarEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);
      const calendarEvents = await familyService.getCalendarEvents(
        userId,
        startDate.toISOString(),
        endDate.toISOString()
      );
      // Map database results to application interface
      const mappedEvents = calendarEvents.map(event => ({
        ...event,
        description: event.description || undefined, // Convert null to undefined
      }));
      setEvents(mappedEvents as any);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    loadCalendarEvents();
  }, [loadCalendarEvents]);

  const handleCreateEvent = async () => {
    setIsLoading(true);
    try {
      const { databaseType } = mapFrontendToDatabaseType(newEventForm.type);

      const eventData: any = {
        title: newEventForm.title,
        description: newEventForm.description,
        eventType: databaseType,
        scheduledAt: newEventForm.date.toISOString(),
        durationMinutes: newEventForm.durationMinutes || 60,
        isRecurring: !!newEventForm.recurring,
      };

      // Only add optional properties if they have values
      if (newEventForm.location) {
        eventData.location = newEventForm.location;
      }
      if (newEventForm.meetingUrl) {
        eventData.meetingUrl = newEventForm.meetingUrl;
      }
      if (newEventForm.attendees && newEventForm.attendees.length > 0) {
        eventData.attendees = newEventForm.attendees;
      }
      if (newEventForm.recurring?.frequency) {
        eventData.recurrencePattern = newEventForm.recurring.frequency;
      }
      if (newEventForm.recurring?.endDate) {
        eventData.recurrenceEndDate =
          newEventForm.recurring.endDate.toISOString();
      }

      const event = await familyService.createCalendarEvent(userId, eventData);

      // Convert database event to frontend format
      let recurring:
        | undefined
        | { endDate?: Date; frequency: 'monthly' | 'weekly' | 'yearly' } =
        undefined;

      if ((event as any).is_recurring && (event as any).recurrence_pattern) {
        const r: {
          endDate?: Date;
          frequency: 'monthly' | 'weekly' | 'yearly';
        } = {
          frequency: (event as any).recurrence_pattern as
            | 'monthly'
            | 'weekly'
            | 'yearly',
        };
        if ((event as any).recurrence_end_date) {
          r.endDate = new Date((event as any).recurrence_end_date);
        }
        recurring = r;
      }

      const frontendEvent: FamilyCalendarEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        type: newEventForm.type, // Use original frontend type
        date: new Date((event as any).scheduled_at),
        priority: 'medium', // Default priority
        createdBy: userId, // Set to current user
        notifyMembers: [], // Default empty array
        ...(recurring && { recurring }),
      };

      setEvents(prev => [...prev, frontendEvent]);
      setNewEventForm(defaultForm);
      setShowNewEventDialog(false);
      toast({
        title: 'Success',
        description: 'Event created successfully!',
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredEvents = () => {
    switch (filter) {
      case 'upcoming':
        return getUpcomingEvents();
      case 'birthdays':
        return events
          .filter(e => e.type === 'birthday')
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      case 'documents':
        return events
          .filter(e => e.type === 'document_expiry')
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      default:
        return events.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }
  };

  const getMemberById = (memberId: string) => {
    return familyMembers.find(m => m.id === memberId);
  };

  return (
    <div className='space-y-6'>
      {/* Calendar Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Family Calendar</h2>
          <p className='text-muted-foreground'>
            Keep track of important dates and events for your family
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Select
            value={view}
            onValueChange={(v: 'calendar' | 'list') => setView(v)}
          >
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='calendar'>Calendar</SelectItem>
              <SelectItem value='list'>List</SelectItem>
            </SelectContent>
          </Select>

          <Dialog
            open={showNewEventDialog}
            onOpenChange={setShowNewEventDialog}
          >
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='h-4 w-4' />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Create Family Event</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>Event Title</Label>
                  <Input
                    id='title'
                    value={newEventForm.title}
                    onChange={e =>
                      setNewEventForm(prev => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder='Enter event title...'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Event Type</Label>
                    <Select
                      value={newEventForm.type}
                      onValueChange={(value: FamilyCalendarEvent['type']) =>
                        setNewEventForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeConfig).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className='flex items-center gap-2'>
                                <config.icon className='h-4 w-4' />
                                {config.label}
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label>Priority</Label>
                    <Select
                      value={newEventForm.priority}
                      onValueChange={(value: FamilyCalendarEvent['priority']) =>
                        setNewEventForm(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='high'>High</SelectItem>
                        <SelectItem value='medium'>Medium</SelectItem>
                        <SelectItem value='low'>Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='date'>Date</Label>
                  <Input
                    id='date'
                    type='date'
                    value={format(newEventForm.date, 'yyyy-MM-dd')}
                    onChange={e =>
                      setNewEventForm(prev => ({
                        ...prev,
                        date: new Date(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description (Optional)</Label>
                  <Textarea
                    id='description'
                    value={newEventForm.description}
                    onChange={e =>
                      setNewEventForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder='Add event details...'
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Notify Family Members</Label>
                  <div className='space-y-2 max-h-32 overflow-y-auto'>
                    {familyMembers
                      .filter(m => m.status === 'active')
                      .map(member => (
                        <div
                          key={member.id}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={`notify-${member.id}`}
                            checked={newEventForm.notifyMembers.includes(
                              member.id
                            )}
                            onCheckedChange={checked => {
                              if (checked) {
                                setNewEventForm(prev => ({
                                  ...prev,
                                  notifyMembers: [
                                    ...prev.notifyMembers,
                                    member.id,
                                  ],
                                }));
                              } else {
                                setNewEventForm(prev => ({
                                  ...prev,
                                  notifyMembers: prev.notifyMembers.filter(
                                    id => id !== member.id
                                  ),
                                }));
                              }
                            }}
                          />
                          <Label
                            htmlFor={`notify-${member.id}`}
                            className='text-sm font-normal'
                          >
                            {member.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>

                <div className='flex items-center justify-end space-x-2 pt-4'>
                  <Button
                    variant='outline'
                    onClick={() => setShowNewEventDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    disabled={
                      !newEventForm.title || !newEventForm.date || isLoading
                    }
                  >
                    {isLoading ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  This Month
                </p>
                <p className='text-2xl font-bold'>{events.length}</p>
              </div>
              <CalendarIcon className='h-6 w-6 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Upcoming
                </p>
                <p className='text-2xl font-bold'>
                  {getUpcomingEvents().length}
                </p>
              </div>
              <Bell className='h-6 w-6 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Birthdays
                </p>
                <p className='text-2xl font-bold'>
                  {events.filter(e => e.type === 'birthday').length}
                </p>
              </div>
              <Gift className='h-6 w-6 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Expiring Docs
                </p>
                <p className='text-2xl font-bold'>
                  {events.filter(e => e.type === 'document_expiry').length}
                </p>
              </div>
              <AlertTriangle className='h-6 w-6 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar View */}
      {view === 'calendar' ? (
        <div className='grid gap-6 md:grid-cols-3'>
          {/* Calendar */}
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle>{format(selectedDate, 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                modifiers={{
                  hasEvents: date => getEventsForDate(date).length > 0,
                  today: isToday,
                }}
                modifiersClassNames={{
                  hasEvents: 'bg-blue-50 font-semibold',
                  today: 'bg-accent text-accent-foreground',
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                {format(selectedDate, 'EEEE, MMMM d')}
              </CardTitle>
              <CardDescription>
                {getEventsForDate(selectedDate).length} events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <AnimatePresence>
                  {getEventsForDate(selectedDate).map((event, index) => {
                    const config = eventTypeConfig[event.type];
                    const member = event.relatedMemberId
                      ? getMemberById(event.relatedMemberId)
                      : null;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border-l-4 ${priorityColors[event.priority]} bg-gray-50`}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <config.icon className='h-4 w-4' />
                              <h4 className='font-medium text-sm'>
                                {event.title}
                              </h4>
                            </div>
                            {event.description && (
                              <p className='text-xs text-muted-foreground mb-2'>
                                {event.description}
                              </p>
                            )}
                            <div className='flex items-center gap-2'>
                              <Badge className={config.color} variant='outline'>
                                {config.label}
                              </Badge>
                              {member && (
                                <div className='flex items-center gap-1'>
                                  <Avatar className='h-4 w-4'>
                                    <AvatarFallback className='text-xs'>
                                      {member.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className='text-xs text-muted-foreground'>
                                    {member.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {getEventsForDate(selectedDate).length === 0 && (
                  <div className='text-center py-6 text-muted-foreground'>
                    <CalendarIcon className='h-8 w-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>No events on this date</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>All Events</CardTitle>
              <Select
                value={filter}
                onValueChange={(
                  v: 'all' | 'birthdays' | 'documents' | 'upcoming'
                ) => setFilter(v)}
              >
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Events</SelectItem>
                  <SelectItem value='upcoming'>Upcoming</SelectItem>
                  <SelectItem value='birthdays'>Birthdays</SelectItem>
                  <SelectItem value='documents'>Document Expiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <AnimatePresence>
                {filteredEvents().map((event, index) => {
                  const config = eventTypeConfig[event.type];
                  const member = event.relatedMemberId
                    ? getMemberById(event.relatedMemberId)
                    : null;
                  const eventDate = new Date(event.date);
                  const isOverdue =
                    isBefore(eventDate, new Date()) && !isToday(eventDate);

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border-l-4 ${priorityColors[event.priority]} bg-white border ${isOverdue ? 'bg-red-50 border-red-200' : 'border-gray-200'}`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <config.icon className='h-5 w-5' />
                            <h3 className='font-semibold'>{event.title}</h3>
                            <Badge className={config.color} variant='outline'>
                              {config.label}
                            </Badge>
                            {isOverdue && (
                              <Badge variant='destructive'>Overdue</Badge>
                            )}
                            {event.recurring && (
                              <Badge variant='secondary' className='gap-1'>
                                <Repeat className='h-3 w-3' />
                                {event.recurring.frequency}
                              </Badge>
                            )}
                          </div>

                          {event.description && (
                            <p className='text-sm text-muted-foreground mb-2'>
                              {event.description}
                            </p>
                          )}

                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <CalendarIcon className='h-4 w-4' />
                              {format(eventDate, 'PPP')}
                            </span>
                            {member && (
                              <span className='flex items-center gap-1'>
                                <Avatar className='h-4 w-4'>
                                  <AvatarFallback className='text-xs'>
                                    {member.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {member.name}
                              </span>
                            )}
                            {event.notifyMembers.length > 0 && (
                              <span className='flex items-center gap-1'>
                                <Bell className='h-4 w-4' />
                                {event.notifyMembers.length} notified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredEvents().length === 0 && (
                <div className='text-center py-12'>
                  <CalendarIcon className='h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50' />
                  <h3 className='text-lg font-medium mb-2'>No events found</h3>
                  <p className='text-muted-foreground mb-4'>
                    {filter === 'all'
                      ? 'Start creating family events to keep everyone in sync!'
                      : `No ${filter} events to display.`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
