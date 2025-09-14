# Sofia AI System - Data Model

## Core Sofia AI Entities

### SofiaAI

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `personalityMode: 'empathetic' | 'pragmatic' | 'adaptive'` - Current personality mode
- `adaptationLevel: number` - Learning progress (0-1)
- `lastInteractionAt: timestamp` - Last user interaction
- `totalInteractions: number` - Total interaction count
- `preferences: SofiaPreferences` - User preferences
- `createdAt: timestamp` - Creation time
- `updatedAt: timestamp` - Last update time

### SofiaPreferences

- `communicationStyle: 'formal' | 'casual' | 'friendly'` - Preferred communication style
- `responseLength: 'brief' | 'detailed' | 'adaptive'` - Preferred response length
- `animationIntensity: 'subtle' | 'moderate' | 'dynamic'` - Animation preference
- `proactiveSuggestions: boolean` - Enable proactive suggestions
- `celebrationAnimations: boolean` - Enable celebration animations
- `soundEffects: boolean` - Enable sound effects
- `hapticFeedback: boolean` - Enable haptic feedback

### SofiaMemory

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `conversationHistory: ConversationEntry[]` - Chat history
- `userPatterns: UserPattern[]` - Learned user patterns
- `contextData: ContextData` - Current context information
- `emotionalState: EmotionalState` - Current emotional state
- `lastUpdatedAt: timestamp` - Last memory update

### ConversationEntry

- `id: string` - Unique identifier
- `timestamp: timestamp` - Message time
- `type: 'user' | 'sofia'` - Message sender
- `content: string` - Message content
- `context: string` - Context when sent
- `emotionalTone: string` - Detected emotional tone
- `responseTime: number` - Response time in ms
- `satisfactionScore: number` - User satisfaction (0-1)

### UserPattern

- `id: string` - Unique identifier
- `patternType: 'interaction' | 'preference' | 'behavior'` - Pattern category
- `patternData: object` - Pattern-specific data
- `confidence: number` - Pattern confidence (0-1)
- `lastObservedAt: timestamp` - Last observation
- `frequency: number` - Observed frequency

### ContextData

- `currentPage: string` - Current app page/route
- `userAction: string` - Last user action
- `emotionalState: string` - Current emotional state
- `milestoneProgress: number` - Current milestone progress
- `recentInteractions: string[]` - Recent interaction types
- `timeOfDay: string` - Time of day context
- `userEngagement: number` - Engagement level (0-1)

### EmotionalState

- `currentMood: 'happy' | 'neutral' | 'frustrated' | 'excited' | 'worried'` - Current mood
- `energyLevel: number` - Energy level (0-1)
- `stressLevel: number` - Stress level (0-1)
- `confidenceLevel: number` - Confidence level (0-1)
- `lastUpdatedAt: timestamp` - Last emotional state update

## Animation System Entities

### FireflyAnimation

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `animationType: 'idle' | 'happy' | 'sad' | 'excited' | 'thinking'` - Animation type
- `intensity: number` - Animation intensity (0-1)
- `duration: number` - Animation duration in ms
- `trigger: string` - Animation trigger
- `customization: FireflyCustomization` - User customizations

### FireflyCustomization

- `color: string` - Firefly color
- `size: number` - Firefly size multiplier
- `speed: number` - Movement speed multiplier
- `particleCount: number` - Particle count
- `soundEnabled: boolean` - Sound effects enabled
- `hapticEnabled: boolean` - Haptic feedback enabled

### CelebrationAnimation

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `celebrationType: 'milestone' | 'achievement' | 'completion' | 'success'` - Celebration type
- `intensity: number` - Celebration intensity (0-1)
- `duration: number` - Animation duration in ms
- `trigger: string` - Celebration trigger
- `customization: CelebrationCustomization` - User customizations

### CelebrationCustomization

- `confettiEnabled: boolean` - Confetti effects enabled
- `sparkleEnabled: boolean` - Sparkle effects enabled
- `soundEnabled: boolean` - Sound effects enabled
- `hapticEnabled: boolean` - Haptic feedback enabled
- `colorScheme: string` - Celebration color scheme

## Proactive System Entities

### ProactiveSuggestion

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `suggestionType: 'guidance' | 'reminder' | 'encouragement' | 'tip'` - Suggestion type
- `content: string` - Suggestion content
- `context: string` - Suggestion context
- `priority: 'low' | 'medium' | 'high'` - Suggestion priority
- `timing: SuggestionTiming` - When to show suggestion
- `status: 'pending' | 'shown' | 'dismissed' | 'accepted'` - Suggestion status
- `createdAt: timestamp` - Creation time
- `shownAt: timestamp` - When shown
- `dismissedAt: timestamp` - When dismissed

### SuggestionTiming

- `trigger: string` - Trigger condition
- `delay: number` - Delay in seconds
- `frequency: 'once' | 'daily' | 'weekly' | 'monthly'` - Frequency
- `timeOfDay: string` - Preferred time of day
- `conditions: string[]` - Additional conditions

### GuidanceFlow

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `flowType: 'onboarding' | 'feature' | 'troubleshooting'` - Flow type
- `steps: GuidanceStep[]` - Flow steps
- `currentStep: number` - Current step index
- `status: 'active' | 'completed' | 'paused' | 'cancelled'` - Flow status
- `startedAt: timestamp` - Flow start time
- `completedAt: timestamp` - Flow completion time

### GuidanceStep

- `id: string` - Unique identifier
- `stepNumber: number` - Step order
- `title: string` - Step title
- `content: string` - Step content
- `action: string` - Required action
- `validation: string` - Validation criteria
- `hint: string` - Step hint
- `completed: boolean` - Completion status
- `completedAt: timestamp` - Completion time

## Analytics & Monitoring Entities

### SofiaAnalytics

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `metricType: 'response_time' | 'satisfaction' | 'engagement' | 'accuracy'` - Metric type
- `value: number` - Metric value
- `context: string` - Metric context
- `timestamp: timestamp` - Metric timestamp
- `metadata: object` - Additional metric data

### SofiaPerformance

- `id: string` - Unique identifier
- `userId: string` - Associated user
- `responseTime: number` - AI response time in ms
- `animationFPS: number` - Animation frame rate
- `memoryUsage: number` - Memory usage in MB
- `errorCount: number` - Error count
- `timestamp: timestamp` - Performance measurement time

## Relations

- SofiaAI 1—1 SofiaPreferences
- SofiaAI 1—1 SofiaMemory
- SofiaMemory 1—N ConversationEntry
- SofiaMemory 1—N UserPattern
- SofiaMemory 1—1 ContextData
- SofiaMemory 1—1 EmotionalState
- SofiaAI 1—N FireflyAnimation
- SofiaAI 1—N CelebrationAnimation
- SofiaAI 1—N ProactiveSuggestion
- SofiaAI 1—N GuidanceFlow
- SofiaAI 1—N SofiaAnalytics
- SofiaAI 1—N SofiaPerformance
- GuidanceFlow 1—N GuidanceStep
