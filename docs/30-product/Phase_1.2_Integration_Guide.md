# Phase 1.2 Implementation Integration Guide

## Overview

This guide covers the integration of the newly implemented Phase 1.2 components for **User State Detection** and **Onboarding Flow Logic** in the LegacyGuard application.

## Implementation Summary

### ✅ Completed Components

1. **UserStateDetection Component** (`packages/onboarding/src/components/UserStateDetection.tsx`)
   - Life situation questionnaire (single/married/parent/retired)
   - Confidence level assessment (1-5 scale)
   - Goal setting (immediate vs. comprehensive)
   - Preference capture (pace, communication style)

2. **AdaptiveOnboardingFlow Component** (`packages/onboarding/src/components/AdaptiveOnboardingFlow.tsx`)
   - Skip/resume functionality
   - Adaptive branching based on user responses
   - Progress persistence in Supabase
   - Completion acknowledgement with milestone unlock

3. **Enhanced OnboardingService** (`packages/shared/src/services/onboarding/onboarding.service.ts`)
   - Extended data model for user state and flow control
   - Remote persistence with Supabase integration
   - Resume detection and management
   - Skip tracking and analytics

4. **Supabase Schema Enhancement** (`supabase/migrations/001_enhanced_onboarding_progress.sql`)
   - Extended onboarding_progress table
   - New fields for user state and flow control
   - Proper indexing and RLS policies

## Integration Steps

### 1. Database Migration

Run the Supabase migration to add the new fields:

```bash
# In your Supabase project
supabase db push

# Or apply the migration directly
psql -h your-db-host -U postgres -d your-db -f supabase/migrations/001_enhanced_onboarding_progress.sql
```

### 2. Component Usage

#### Basic Usage

```tsx
import { AdaptiveOnboardingFlow } from '@schwalbe/onboarding';

function OnboardingPage() {
  const handleComplete = (plan: Plan, userState: UserState) => {
    console.log('Onboarding completed:', { plan, userState });
    // Navigate to dashboard or next step
  };

  const handleSceneTransition = (fromScene: string, toScene: string) => {
    // Track analytics or update UI
    console.log(`Transitioning from ${fromScene} to ${toScene}`);
  };

  return (
    <AdaptiveOnboardingFlow
      onComplete={handleComplete}
      onSceneTransition={handleSceneTransition}
      allowSkip={true}
      autoSave={true}
    />
  );
}
```

#### Advanced Usage with Custom Flow

```tsx
import { UserStateDetection, OnboardingQuestionnaire } from '@schwalbe/onboarding';

function CustomOnboardingPage() {
  const [phase, setPhase] = useState<'state' | 'questionnaire' | 'scenes'>('state');
  const [userState, setUserState] = useState<UserState>();

  const handleUserStateComplete = (state: UserState, responses: QuestionnaireResponse) => {
    setUserState(state);
    // Adaptive branching logic
    if (state.pace === 'fast' && state.confidenceLevel >= 4) {
      setPhase('scenes'); // Skip questionnaire for confident fast users
    } else {
      setPhase('questionnaire');
    }
  };

  return (
    <div>
      {phase === 'state' && (
        <UserStateDetection
          onComplete={handleUserStateComplete}
          onSkip={() => setPhase('scenes')}
        />
      )}
      {phase === 'questionnaire' && (
        <OnboardingQuestionnaire
          onComplete={(responses) => {
            // Process responses and move to scenes
            setPhase('scenes');
          }}
        />
      )}
      {/* Scene components would go here */}
    </div>
  );
}
```

### 3. Service Integration

#### Tracking User Progress

```tsx
import { OnboardingService } from '@schwalbe/shared';

// Save user state after detection phase
const userState = {
  lifeSituation: 'parent',
  confidenceLevel: 3,
  goalType: 'comprehensive',
  pace: 'moderate',
  communicationStyle: 'guided'
};
OnboardingService.saveUserState(userState);

// Check if user can resume
const resumeInfo = OnboardingService.getResumeInfo();
if (resumeInfo.canResume) {
  console.log(`User can resume from ${resumeInfo.currentPhase}`);
  console.log(`Last activity: ${resumeInfo.timeAgo}`);
}

// Mark specific phase as skipped
OnboardingService.markSkipped('questionnaire');

// Update current phase
OnboardingService.updateCurrentPhase('scene-2');
```

### 4. Sofia AI Integration

The user state information should be passed to Sofia for personalized interactions:

```tsx
import { SofiaPersonality } from '@schwalbe/ai-assistant';

// Use user state for Sofia personality adaptation
const userState = OnboardingService.getProgress().userState;
if (userState) {
  SofiaPersonality.updateUserContext({
    confidenceLevel: userState.confidenceLevel,
    communicationStyle: userState.communicationStyle,
    pace: userState.pace,
    familyStatus: userState.lifeSituation
  });
}
```

### 5. Dashboard Integration

Update the dashboard to reflect onboarding completion and user preferences:

```tsx
import { useDashboardStore } from '@schwalbe/shared';

function Dashboard() {
  const { userProgress, updateUserProgress } = useDashboardStore();

  useEffect(() => {
    const onboardingData = OnboardingService.getProgress();
    if (onboardingData.completedAt) {
      updateUserProgress({
        onboardingCompleted: true,
        userPersonalization: {
          name: onboardingData.trustedName || '',
          commitmentLevel: onboardingData.userState?.goalType === 'immediate' ? 'immediate' : 'comprehensive',
          keyStyle: 'elegant' // Based on user preferences
        }
      });
    }
  }, []);

  return (
    <div>
      {/* Dashboard content */}
    </div>
  );
}
```

## Data Flow

### User State Detection Flow

```
User starts onboarding
    ↓
UserStateDetection component
    ↓ (collects 5 key pieces of info)
Life situation + Confidence + Goals + Pace + Communication style
    ↓
OnboardingService.saveUserState()
    ↓
Adaptive branching decision
    ↓
Next phase (questionnaire or scenes)
```

### Resume Flow

```
User returns to app
    ↓
OnboardingService.getResumeInfo()
    ↓
If canResume = true
    ↓
Show resume dialog
    ↓
User chooses continue or restart
    ↓
AdaptiveOnboardingFlow loads from saved phase
```

## Testing

### Unit Tests

Test files should be created for:
- `UserStateDetection.test.tsx`
- `AdaptiveOnboardingFlow.test.tsx`
- `OnboardingService.test.ts`

### Integration Tests

1. **Complete flow test**: User goes through entire onboarding
2. **Skip functionality test**: User skips phases and can resume
3. **Adaptive branching test**: Different user types get different flows
4. **Persistence test**: Progress saves and loads correctly

### Example Test

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { UserStateDetection } from '@schwalbe/onboarding';

describe('UserStateDetection', () => {
  it('should complete user state detection flow', async () => {
    const mockOnComplete = jest.fn();

    const { getByText, getByLabelText } = render(
      <UserStateDetection onComplete={mockOnComplete} />
    );

    // Select life situation
    fireEvent.click(getByLabelText('Rodič s deťmi'));
    fireEvent.click(getByText('Ďalej'));

    // Set confidence level
    fireEvent.click(getByText('3'));
    fireEvent.click(getByText('Ďalej'));

    // Continue through all steps...

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          lifeSituation: 'parent',
          confidenceLevel: 3
        }),
        expect.any(Object)
      );
    });
  });
});
```

## Analytics and Monitoring

### Key Metrics to Track

1. **Completion Rates**
   - User state detection completion: `userState.completionRate`
   - Full onboarding completion: `onboarding.completionRate`
   - Skip rates by phase: `onboarding.skipRate.byPhase`

2. **User Behavior**
   - Time spent per phase: `onboarding.timeSpent.byPhase`
   - Resume usage: `onboarding.resumeRate`
   - Adaptive branching outcomes: `onboarding.branchingPaths`

3. **Engagement**
   - Return rates after partial completion: `onboarding.returnRate`
   - User satisfaction by persona type: `onboarding.satisfaction.byPersona`

### Implementation

```tsx
// Track analytics events
OnboardingService.trackStepCompletion('user-state-detection', timeSpent);

// Custom analytics for adaptive branching
gtag('event', 'onboarding_branch_taken', {
  user_type: userState.lifeSituation,
  confidence_level: userState.confidenceLevel,
  branch_path: nextPhase,
  timestamp: new Date().toISOString()
});
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Ensure Supabase connection and proper permissions
2. **Resume not working**: Check localStorage and Supabase RLS policies
3. **Adaptive branching not triggering**: Verify user state data structure
4. **Progress not saving**: Check network connectivity and auth state

### Debug Mode

Enable debug logging in development:

```tsx
// In development
if (process.env.NODE_ENV === 'development') {
  OnboardingService.enableDebugLogging();
}
```

## Next Steps

After integration:

1. **Update roadmap**: Mark Phase 1.2 as completed ✅
2. **User testing**: Conduct usability tests with the new flow
3. **Performance monitoring**: Set up monitoring for completion rates
4. **Sofia integration**: Enhance Sofia responses based on user state
5. **Analytics dashboard**: Create monitoring dashboard for onboarding metrics

## Code Quality

Run these commands to ensure code quality:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint:fix

# Tests
npm run test

# Build verification
npm run build
```

## Migration Checklist

- [ ] Database migration applied
- [ ] Components exported properly
- [ ] Sofia AI integration updated
- [ ] Dashboard integration completed
- [ ] Analytics tracking implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Phase 1.2 marked as completed in roadmap