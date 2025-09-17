
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  type EmotionalGuidanceSession,
  type LegacyMessage,
  legacyMessageBuilder,
  type MemoryPrompt,
  type MessageOccasion,
  type TimeCapsule,
} from '@/lib/legacy-message-builder';
import type { WillData } from './WillWizard';

interface EmotionalGuidanceSystemProps {
  className?: string;
  currentStage:
    | 'assets'
    | 'beneficiaries'
    | 'completing'
    | 'final_wishes'
    | 'starting';
  onMessagesCreated?: (messages: LegacyMessage[]) => void;
  onTimeCapsuleCreated?: (timeCapsule: TimeCapsule) => void;
  willData: WillData;
}

export const EmotionalGuidanceSystem: React.FC<
  EmotionalGuidanceSystemProps
> = ({
  willData,
  currentStage,
  onMessagesCreated,
  onTimeCapsuleCreated,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('support');
  const [currentSession, setCurrentSession] =
    useState<EmotionalGuidanceSession | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [legacyMessages, setLegacyMessages] = useState<LegacyMessage[]>([]);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');

  // Get emotional support for current stage
  const emotionalSupport =
    legacyMessageBuilder.getEmotionalSupport(currentStage);

  // Extract guidance content from the guidanceCards array
  const getGuidanceContent = (type: string): string => {
    const card = emotionalSupport?.guidanceCards.find(
      card => card.type === type
    );
    return card?.content || '';
  };

  // Extract family members from will data
  const familyMembers = React.useMemo(() => {
    const members: Array<{ name: string; relationship: string }> = [];

    // Add beneficiaries
    willData.beneficiaries.forEach(beneficiary => {
      members.push({
        name: beneficiary.name,
        relationship: beneficiary.relationship,
      });
    });

    // Add executor if different from beneficiaries
    if (
      willData.executor_data.primaryExecutor &&
      !members.some(
        m => m.name === willData.executor_data.primaryExecutor!.name
      )
    ) {
      members.push({
        name: willData.executor_data.primaryExecutor.name,
        relationship:
          willData.executor_data.primaryExecutor.relationship || 'friend',
      });
    }

    // Add guardians if different from above
    if (
      willData.guardianship_data.primaryGuardian &&
      !members.some(
        m => m.name === willData.guardianship_data.primaryGuardian!.name
      )
    ) {
      members.push({
        name: willData.guardianship_data.primaryGuardian.name,
        relationship:
          willData.guardianship_data.primaryGuardian.relationship || 'family',
      });
    }

    return members;
  }, [willData]);

  const handleStartGuidanceSession = () => {
    const session = legacyMessageBuilder.createGuidanceSession(
      'reflection',
      familyMembers
    );
    setCurrentSession(session);
    setSessionProgress(0);
    setActiveTab('reflection');
  };

  const handlePromptResponse = (promptId: string, response: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      responses: [
        ...currentSession.responses.filter(r => r.promptId !== promptId),
        {
          promptId,
          response,
          emotionalRating: 7, // Default rating
          timeSpent: 5, // Default time
        },
      ],
    };

    setCurrentSession(updatedSession);
    setSessionProgress(
      (updatedSession.responses.length / updatedSession.prompts.length) * 100
    );

    // Generate message suggestions when session is complete
    if (updatedSession.responses.length === updatedSession.prompts.length) {
      const suggestions =
        legacyMessageBuilder.generateMessageSuggestions(updatedSession);
      updatedSession.recommendedMessages = suggestions;
      toast.success(
        'Reflection session complete! Check out your personalized message suggestions.'
      );
    }
  };

  const handleCreateLegacyMessage = (
    recipientName: string,
    occasion: MessageOccasion,
    content: string,
    type: LegacyMessage['type'] = 'text'
  ) => {
    const relationship =
      familyMembers.find(m => m.name === recipientName)?.relationship ||
      'family';

    const message: LegacyMessage = {
      id: `msg_${Date.now()}_${recipientName.replace(/\s+/g, '_')}`,
      type,
      title: `${occasion.replace('_', ' ')} message for ${recipientName}`,
      recipientName,
      recipientRelationship: relationship,
      occasion,
      content,
      emotionalTone: 'loving',
      privacy: 'private',
      createdAt: new Date(),
      lastModified: new Date(),
      isEncrypted: false,
      metadata: {
        wordCount: content.split(' ').length,
        attachmentCount: 0,
      },
    };

    setLegacyMessages(prev => [...prev, message]);

    if (onMessagesCreated) {
      onMessagesCreated([message]);
    }

    toast.success(`Legacy message created for ${recipientName}`);
    setShowMessageComposer(false);
  };

  const handleCreateTimeCapsule = () => {
    if (legacyMessages.length === 0) {
      toast.warning('Create some legacy messages first');
      return;
    }

    const releaseDate = new Date();
    releaseDate.setFullYear(releaseDate.getFullYear() + 5); // 5 years from now

    const timeCapsule = legacyMessageBuilder.buildDigitalTimeCapsule(
      legacyMessages,
      releaseDate
    );

    if (onTimeCapsuleCreated) {
      onTimeCapsuleCreated(timeCapsule);
    }

    toast.success(
      'Time capsule created! Your messages will be delivered in the future.'
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='text-center'>
        <h3 className='text-lg font-semibold mb-2'>
          Legacy & Emotional Guidance
        </h3>
        <p className='text-sm text-muted-foreground'>
          Create meaningful messages and find emotional support during your will
          creation journey
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='support'>Support</TabsTrigger>
          <TabsTrigger value='reflection'>Reflection</TabsTrigger>
          <TabsTrigger value='messages'>Messages</TabsTrigger>
          <TabsTrigger value='timecapsule'>Time Capsule</TabsTrigger>
        </TabsList>

        <TabsContent value='support' className='space-y-4 mt-6'>
          <Card className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <Icon name='heart' className='w-6 h-6 text-blue-600' />
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold text-blue-900 mb-2'>
                  Emotional Support
                </h4>
                <p className='text-blue-800 mb-3'>
                  {getGuidanceContent('encouragement')}
                </p>
                <p className='text-sm text-blue-700 italic'>
                  {getGuidanceContent('normalizing')}
                </p>
              </div>
            </div>
          </Card>

          <Card className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <Icon name='lightbulb' className='w-6 h-6 text-green-600' />
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold text-green-900 mb-2'>
                  Practical Guidance
                </h4>
                <p className='text-green-800'>
                  {getGuidanceContent('practical')}
                </p>
              </div>
            </div>
          </Card>

          {familyMembers.length > 0 && (
            <Card className='p-6'>
              <h4 className='font-semibold mb-4'>
                Ready to Create Legacy Messages?
              </h4>
              <p className='text-muted-foreground mb-4'>
                Share your love, wisdom, and memories with the people who matter
                most to you.
              </p>
              <div className='flex gap-2'>
                <Button
                  onClick={handleStartGuidanceSession}
                  className='bg-primary hover:bg-primary-hover'
                >
                  <Icon name='heart' className='w-4 h-4 mr-2' />
                  Start Guided Reflection
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSelectedRecipient(familyMembers[0]?.name || '');
                    setShowMessageComposer(true);
                  }}
                >
                  <Icon name='edit' className='w-4 h-4 mr-2' />
                  Create Message Directly
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='reflection' className='space-y-4 mt-6'>
          {currentSession ? (
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h4 className='font-semibold'>Guided Reflection Session</h4>
                <div className='flex items-center gap-2'>
                  <Progress value={sessionProgress} className='w-32' />
                  <span className='text-sm text-muted-foreground'>
                    {currentSession.responses.length}/
                    {currentSession.prompts.length}
                  </span>
                </div>
              </div>

              {currentSession.prompts.map((prompt, index) => (
                <ReflectionPrompt
                  key={prompt.id}
                  prompt={prompt}
                  isActive={index === currentSession.responses.length}
                  response={
                    currentSession.responses.find(r => r.promptId === prompt.id)
                      ?.response || ''
                  }
                  onResponse={response =>
                    handlePromptResponse(prompt.id, response)
                  }
                />
              ))}

              {currentSession.responses.length ===
                currentSession.prompts.length && (
                <Card className='p-6 bg-green-50 border-green-200'>
                  <h4 className='font-semibold text-green-900 mb-2'>
                    Reflection Complete! 🎉
                  </h4>
                  <p className='text-green-800 mb-4'>
                    Your thoughtful responses have been captured. You can now
                    create personalized messages based on your reflections.
                  </p>
                  <Button onClick={() => setActiveTab('messages')}>
                    View Message Suggestions
                  </Button>
                </Card>
              )}
            </div>
          ) : (
            <Card className='p-8 text-center'>
              <Icon
                name='heart'
                className='w-12 h-12 text-muted-foreground mx-auto mb-4'
              />
              <h4 className='font-semibold mb-2'>
                Start Your Reflection Journey
              </h4>
              <p className='text-muted-foreground mb-4'>
                Take a few minutes to reflect on your relationships and create
                meaningful legacy messages.
              </p>
              <Button onClick={handleStartGuidanceSession}>
                Begin Reflection Session
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='messages' className='space-y-4 mt-6'>
          <div className='flex items-center justify-between'>
            <h4 className='font-semibold'>
              Legacy Messages ({legacyMessages.length})
            </h4>
            <Button
              onClick={() => setShowMessageComposer(true)}
              variant='outline'
              size='sm'
            >
              <Icon name='plus' className='w-4 h-4 mr-2' />
              Create Message
            </Button>
          </div>

          {/* Message suggestions from session */}
          {currentSession && currentSession.recommendedMessages.length > 0 && (
            <Card className='p-4 bg-blue-50 border-blue-200'>
              <h5 className='font-medium text-blue-900 mb-3'>
                Personalized Suggestions
              </h5>
              <div className='space-y-2'>
                {currentSession.recommendedMessages.map((suggestion, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-white rounded border'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-medium'>
                          {suggestion.recipient}
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {suggestion.occasion.replace('_', ' ')}
                        </Badge>
                        <Badge variant='secondary' className='text-xs'>
                          {Math.round(suggestion?.confidence * 100)}% match
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {suggestion.suggestedContent.substring(0, 100)}...
                      </p>
                    </div>
                    <Button
                      size='sm'
                      onClick={() => {
                        handleCreateLegacyMessage(
                          suggestion.recipient,
                          suggestion.occasion,
                          suggestion.suggestedContent
                        );
                      }}
                    >
                      Use This
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Created messages */}
          {legacyMessages.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {legacyMessages.map(message => (
                <LegacyMessageCard key={message.id} message={message} />
              ))}
            </div>
          ) : (
            <Card className='p-8 text-center'>
              <Icon
                name='message-circle'
                className='w-12 h-12 text-muted-foreground mx-auto mb-4'
              />
              <h5 className='font-semibold mb-2'>No Messages Yet</h5>
              <p className='text-muted-foreground mb-4'>
                Create heartfelt messages for your loved ones to receive in the
                future.
              </p>
              <Button onClick={() => setShowMessageComposer(true)}>
                Create First Message
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='timecapsule' className='space-y-4 mt-6'>
          <Card className='p-6'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <Icon name='clock' className='w-6 h-6 text-purple-600' />
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold mb-2'>Digital Time Capsule</h4>
                <p className='text-muted-foreground mb-4'>
                  Bundle your legacy messages into a time capsule that will be
                  delivered to your family at a specific date or after certain
                  milestones.
                </p>

                {legacyMessages.length > 0 ? (
                  <div className='space-y-4'>
                    <div className='text-sm'>
                      <span className='font-medium'>Ready to include:</span>
                      <span className='ml-2'>
                        {legacyMessages.length} message
                        {legacyMessages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Button onClick={handleCreateTimeCapsule}>
                      <Icon name="package" className='w-4 h-4 mr-2' />
                      Create Time Capsule
                    </Button>
                  </div>
                ) : (
                  <div className='text-muted-foreground text-sm'>
                    Create some legacy messages first to build your time
                    capsule.
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'>
            <h4 className='font-semibold text-purple-900 mb-3'>
              Time Capsule Ideas
            </h4>
            <div className='space-y-3 text-sm'>
              <div className='flex items-start gap-2'>
                <Icon
                  name="gift"
                  className='w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5'
                />
                <div>
                  <span className='font-medium'>Anniversary Messages:</span>
                  <span className='text-purple-800 ml-2'>
                    Messages to be delivered on wedding anniversaries
                  </span>
                </div>
              </div>
              <div className='flex items-start gap-2'>
                <Icon
                  name="graduation-cap"
                  className='w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5'
                />
                <div>
                  <span className='font-medium'>Milestone Birthdays:</span>
                  <span className='text-purple-800 ml-2'>
                    Special messages for 18th, 21st, 30th birthdays
                  </span>
                </div>
              </div>
              <div className='flex items-start gap-2'>
                <Icon
                  name="baby"
                  className='w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5'
                />
                <div>
                  <span className='font-medium'>Future Grandchildren:</span>
                  <span className='text-purple-800 ml-2'>
                    Messages for grandchildren not yet born
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Composer Dialog */}
      <Dialog open={showMessageComposer} onOpenChange={setShowMessageComposer}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create Legacy Message</DialogTitle>
          </DialogHeader>
          <MessageComposer
            familyMembers={familyMembers}
            selectedRecipient={selectedRecipient}
            onMessageCreate={handleCreateLegacyMessage}
            onCancel={() => setShowMessageComposer(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Reflection Prompt Component
interface ReflectionPromptProps {
  isActive: boolean;
  onResponse: (response: string) => void;
  prompt: MemoryPrompt;
  response: string;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({
  prompt,
  isActive,
  response,
  onResponse,
}) => {
  const [currentResponse, setCurrentResponse] = useState(response);

  const handleSubmit = () => {
    if (currentResponse.trim()) {
      onResponse(currentResponse);
    }
  };

  return (
    <Card
      className={`p-6 ${isActive ? 'border-primary bg-primary/5' : response ? 'border-green-200 bg-green-50' : 'opacity-50'}`}
    >
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0'>
          {response ? (
            <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
              <Icon name="check" className='w-5 h-5 text-white' />
            </div>
          ) : isActive ? (
            <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
              <span className='text-white text-sm font-medium'>?</span>
            </div>
          ) : (
            <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
              <span className='text-gray-400 text-sm'>○</span>
            </div>
          )}
        </div>

        <div className='flex-1 space-y-4'>
          <div>
            <h5 className='font-semibold mb-2'>{prompt.question}</h5>
            <p className='text-sm text-muted-foreground'>{prompt.context}</p>
            <div className='flex items-center gap-2 mt-2'>
              <Badge variant='outline' className='text-xs'>
                {prompt.category.replace('_', ' ')}
              </Badge>
              <Badge variant='outline' className='text-xs'>
                ~{prompt.timeToReflect} min
              </Badge>
              <Badge
                variant='outline'
                className={`text-xs ${
                  prompt.emotionalWeight === 'deep'
                    ? 'bg-red-100 text-red-700'
                    : prompt.emotionalWeight === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}
              >
                {prompt.emotionalWeight}
              </Badge>
            </div>
          </div>

          {isActive && (
            <div className='space-y-3'>
              <Textarea
                placeholder='Take your time to reflect and share your thoughts...'
                value={currentResponse}
                onChange={e => setCurrentResponse(e.target.value)}
                rows={4}
                className='resize-none'
              />
              <div className='flex justify-end'>
                <Button
                  onClick={handleSubmit}
                  disabled={!currentResponse.trim()}
                  size='sm'
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {response && !isActive && (
            <div className='p-3 bg-white rounded border text-sm'>
              <span className='font-medium'>Your reflection:</span>
              <p className='mt-1 text-muted-foreground'>{response}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Legacy Message Card Component
interface LegacyMessageCardProps {
  message: LegacyMessage;
}

const LegacyMessageCard: React.FC<LegacyMessageCardProps> = ({ message }) => {
  return (
    <Card className='p-4 hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Icon name='message-circle' className='w-4 h-4 text-primary' />
          <span className='font-medium text-sm'>{message.recipientName}</span>
        </div>
        <Badge variant='outline' className='text-xs'>
          {message.occasion.replace('_', ' ')}
        </Badge>
      </div>

      <p className='text-sm text-muted-foreground line-clamp-3 mb-3'>
        {message.content}
      </p>

      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-xs'>
            {message.emotionalTone}
          </Badge>
          <span>{message.metadata.wordCount} words</span>
        </div>
        <span>{message.createdAt.toLocaleDateString()}</span>
      </div>
    </Card>
  );
};

// Message Composer Component
interface MessageComposerProps {
  familyMembers: Array<{ name: string; relationship: string }>;
  onCancel: () => void;
  onMessageCreate: (
    recipient: string,
    occasion: MessageOccasion,
    content: string,
    type: LegacyMessage['type']
  ) => void;
  selectedRecipient: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  familyMembers,
  selectedRecipient,
  onMessageCreate,
  onCancel,
}) => {
  const [recipient, setRecipient] = useState(selectedRecipient);
  const [occasion, setOccasion] = useState<MessageOccasion>('general_love');
  const [content, setContent] = useState('');
  const [messageType] = useState<LegacyMessage['type']>('text');

  const occasions: Array<{ label: string; value: MessageOccasion }> = [
    { value: 'general_love', label: 'General Love & Support' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'wedding', label: 'Wedding Day' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'first_child', label: 'First Child Born' },
    { value: 'milestone_birthday', label: 'Milestone Birthday' },
    { value: 'achievement', label: 'Achievement' },
    { value: 'difficult_time', label: 'Difficult Times' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'life_wisdom', label: 'Life Wisdom' },
    { value: 'family_history', label: 'Family History' },
  ];

  const handleCreate = () => {
    if (!recipient || !content.trim()) {
      toast.warning('Please select a recipient and write a message');
      return;
    }

    onMessageCreate(recipient, occasion, content, messageType);
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium'>Recipient</label>
          <Select value={recipient} onValueChange={setRecipient}>
            <SelectTrigger>
              <SelectValue placeholder='Select recipient' />
            </SelectTrigger>
            <SelectContent>
              {familyMembers.map(member => (
                <SelectItem key={member.name} value={member.name}>
                  {member.name} ({member.relationship})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className='text-sm font-medium'>Occasion</label>
          <Select
            value={occasion}
            onValueChange={value => setOccasion(value as MessageOccasion)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {occasions.map(occ => (
                <SelectItem key={occ.value} value={occ.value}>
                  {occ.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className='text-sm font-medium'>Message</label>
        <Textarea
          placeholder='Write your heartfelt message here...'
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          className='resize-none'
        />
        <div className='text-xs text-muted-foreground mt-1'>
          {content.split(' ').length} words
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCreate}>
          <Icon name='heart' className='w-4 h-4 mr-2' />
          Create Message
        </Button>
      </div>
    </div>
  );
};
