import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  H2,
  H3,
  Input,
  Label,
  Paragraph,
  RadioGroup,
  Row,
  ScrollContainer,
  SegmentedProgress,
  Stack,
  // CheckboxGroup,
  TextArea,
  useMedia,
  useTheme,
  // Grid
} from '@legacyguard/ui';
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gift,
  Heart,
  Home,
  Lock,
  MessageSquare,
  User,
  Users,
} from 'lucide-react-native';
import { Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native' // Uncomment when navigation is implemented
// import { useAuth } from '@/hooks/useAuth' // Uncomment when user auth is needed

// Will wizard steps
const WILL_STEPS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'executor', label: 'Executor', icon: Users },
  { id: 'guardians', label: 'Guardians', icon: Heart },
  { id: 'gifts', label: 'Specific Gifts', icon: Gift },
  { id: 'residue', label: 'Residue', icon: Home },
  { id: 'wishes', label: 'Final Wishes', icon: MessageSquare },
  { id: 'review', label: 'Review', icon: CheckCircle },
];

interface WillData {
  executor: {
    alternativeName?: string;
    email: string;
    name: string;
    phone: string;
    relationship: string;
  };
  gifts: Array<{
    beneficiary: string;
    fallback?: string;
    item: string;
  }>;
  guardians: Array<{
    childName: string;
    guardianName: string;
    relationship: string;
  }>;
  personal: {
    address: string;
    dateOfBirth: string;
    fullName: string;
    maritalStatus: string;
  };
  residue: {
    alternativeBeneficiary?: string;
    percentage: number;
    primaryBeneficiary: string;
  };
  wishes: {
    burial: string;
    funeral: string;
    specialRequests?: string;
  };
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const WillScreen = () => {
  // const navigation = useNavigation() // Uncomment when navigation is implemented
  const theme = useTheme();
  const media = useMedia();
  // const { user } = useAuth() // Uncomment when user data is needed

  const [currentStep, setCurrentStep] = useState(0);
  const [willData, setWillData] = useState<DeepPartial<WillData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Check premium status
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = () => {
    // TODO: Check actual premium status from user metadata
    setIsPremium(false); // For now, assume free user
  };

  const handleNext = () => {
    if (currentStep < WILL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveProgress = async () => {
    try {
      // TODO: Save to localStorage or API
      console.log('Saving will progress:', willData);
      Alert.alert('Progress Saved', 'Your will progress has been saved.');
    } catch (_error) {
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    }
  };

  const handleGenerateWill = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Generating a complete will document is a premium feature. Upgrade to access this and other premium features.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => {
              // Navigate to web for upgrade
              console.log('Navigate to upgrade page');
            },
          },
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Generate will document
      console.log('Generating will with data:', willData);
      Alert.alert('Success', 'Your will has been generated successfully!');
    } catch (_error) {
      Alert.alert('Error', 'Failed to generate will. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = WILL_STEPS[currentStep];

    switch (step.id) {
      case 'personal':
        return (
          <Stack space='medium'>
            <H3>Personal Information</H3>
            <Paragraph color='muted'>
              Let's start with your basic information
            </Paragraph>

            <Input
              label='Full Legal Name'
              placeholder='Enter your full name'
              value={willData.personal?.fullName || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, fullName: text },
                }))
              }
            />

            <Input
              label='Date of Birth'
              placeholder='DD/MM/YYYY'
              value={willData.personal?.dateOfBirth || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, dateOfBirth: text },
                }))
              }
            />

            <TextArea
              label='Current Address'
              placeholder='Enter your full address'
              value={willData.personal?.address || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, address: text },
                }))
              }
              numberOfLines={3}
            />

            <RadioGroup
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' },
              ]}
              value={willData.personal?.maritalStatus || ''}
              onValueChange={(value: string) =>
                setWillData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, maritalStatus: value },
                }))
              }
              orientation={media.gtSm ? 'horizontal' : 'vertical'}
            />
          </Stack>
        );

      case 'executor':
        return (
          <Stack space='medium'>
            <H3>Appoint Your Executor</H3>
            <Paragraph color='muted'>
              Choose someone you trust to carry out your wishes
            </Paragraph>

            <Input
              label="Executor's Name"
              placeholder="Enter executor's full name"
              value={willData.executor?.name || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  executor: { ...prev.executor, name: text },
                }))
              }
            />

            <Input
              label='Relationship'
              placeholder='e.g., Spouse, Friend, Lawyer'
              value={willData.executor?.relationship || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  executor: { ...prev.executor, relationship: text },
                }))
              }
            />

            <Input
              label='Email Address'
              placeholder='executor@example.com'
              value={willData.executor?.email || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  executor: { ...prev.executor, email: text },
                }))
              }
              keyboardType='email-address'
            />

            <Input
              label='Phone Number'
              placeholder='+421 900 000 000'
              value={willData.executor?.phone || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  executor: { ...prev.executor, phone: text },
                }))
              }
              keyboardType='phone-pad'
            />

            <Divider />

            <Input
              label='Alternative Executor (Optional)'
              placeholder="Enter alternative executor's name"
              value={willData.executor?.alternativeName || ''}
              onChangeText={(text: string) =>
                setWillData(prev => ({
                  ...prev,
                  executor: { ...prev.executor, alternativeName: text },
                }))
              }
            />
          </Stack>
        );

      case 'review':
        return (
          <Stack space='medium'>
            <H3>Review Your Will</H3>
            <Paragraph color='muted'>
              Please review all the information before generating your will
            </Paragraph>

            {/* Summary Cards */}
            <Card>
              <CardContent>
                <Label style={{ marginBottom: 8 }}>Personal Information</Label>
                <Paragraph>{willData.personal?.fullName ?? ''}</Paragraph>
                <Paragraph size='small' color='muted'>
                  {willData.personal?.maritalStatus}, born{' '}
                  {willData.personal?.dateOfBirth}
                </Paragraph>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Label style={{ marginBottom: 8 }}>Executor</Label>
                <Paragraph>{willData.executor?.name ?? ''}</Paragraph>
                <Paragraph size='small' color='muted'>
                  {willData.executor?.relationship ?? ''}
                </Paragraph>
              </CardContent>
            </Card>

            {!isPremium && (
              <Card variant='premium' padding='medium' style={{ opacity: 0.9 }}>
                <CardContent>
                  <Row align='center' space='small'>
                    <Lock size={24} color={'#fff'} />
                    <Stack flex={1}>
                      <Paragraph weight='bold' style={{ color: '#fff' }}>
                        Premium Feature
                      </Paragraph>
                      <Paragraph size='small' style={{ color: '#fff' }}>
                        Generate and download your complete will document
                      </Paragraph>
                    </Stack>
                  </Row>
                </CardContent>
              </Card>
            )}
          </Stack>
        );

      default:
        return (
          <Stack
            alignItems='center'
            justifyContent='center'
            style={{ padding: 32 }}
          >
            <AlertCircle size={48} color={theme.warning.val} />
            <Paragraph style={{ marginTop: 12 }}>
              This section is coming soon
            </Paragraph>
          </Stack>
        );
    }
  };

  return (
    <Container>
      <ScrollContainer>
        <Stack
          space='medium'
          style={{ padding: 16 }}
          maxWidth={media.gtMd ? 1200 : media.gtSm ? 800 : '100%'}
          marginHorizontal='auto'
          width='100%'
        >
          {/* Header */}
          <Row justifyContent='space-between' alignItems='center'>
            <H2>Will Generator</H2>
            <Button size='small' variant='ghost' onPress={handleSaveProgress}>
              Save Progress
            </Button>
          </Row>

          {/* Progress */}
          <SegmentedProgress
            segments={WILL_STEPS.length}
            currentSegment={currentStep + 1}
            labels={WILL_STEPS.map(s => s.label)}
          />

          {/* Premium Banner for Free Users */}
          {!isPremium && (
            <Card variant='premium' padding='large'>
              <CardContent>
                <Row align='center' space='small'>
                  <FileText size={24} color={'#fff'} />
                  <Stack flex={1}>
                    <H3 style={{ color: '#fff' }}>
                      Unlock Full Will Generator
                    </H3>
                    <Paragraph size='small' style={{ color: '#fff' }}>
                      Create a legally valid will document
                    </Paragraph>
                  </Stack>
                  <Button
                    variant='ghost'
                    onPress={() => console.log('Navigate to upgrade')}
                  >
                    Upgrade to Premium
                  </Button>
                </Row>
              </CardContent>
            </Card>
          )}

          {/* Step Content */}
          <Card>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Row
            justify='between'
            space='small'
            flexDirection={media.gtSm ? 'row' : 'column-reverse'}
          >
            <Button
              variant='secondary'
              icon={ChevronLeft}
              onPress={handlePrev}
              disabled={currentStep === 0}
              {...(media.gtSm ? { flex: 1 } : {})}
              fullWidth={!media.gtSm}
            >
              Previous
            </Button>

            {currentStep === WILL_STEPS.length - 1 ? (
              <Button
                variant={isPremium ? 'primary' : 'premium'}
                icon={isPremium ? CheckCircle : Lock}
                onPress={handleGenerateWill}
                loading={isLoading}
                {...(media.gtSm ? { flex: 1 } : {})}
                fullWidth={!media.gtSm}
              >
                {isPremium ? 'Generate Will' : 'Upgrade'}
              </Button>
            ) : (
              <Button
                variant='primary'
                iconAfter={ChevronRight}
                onPress={handleNext}
                {...(media.gtSm ? { flex: 1 } : {})}
                fullWidth={!media.gtSm}
              >
                Next
              </Button>
            )}
          </Row>
        </Stack>
      </ScrollContainer>
    </Container>
  );
};

export default WillScreen;
