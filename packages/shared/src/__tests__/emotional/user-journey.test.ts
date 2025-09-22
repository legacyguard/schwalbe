import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserJourneyTracker } from '../../analytics/userJourneyTracker'
import { EmotionalStateManager } from '../../analytics/emotionalStateManager'
import { OnboardingExperience } from '../../ui/components/onboarding/OnboardingExperience'
import { Dashboard } from '../../ui/components/dashboard/Dashboard'
import { UserProvider } from '../../ui/contexts/UserContext'

const mockUserJourneyData = {
  firstTimeUser: {
    id: 'user_001',
    isFirstTime: true,
    sessionCount: 1,
    totalTimeSpent: 0,
    completedOnboarding: false,
    emotionalProfile: {
      confidence: 0.2,
      anxiety: 0.7,
      motivation: 0.8,
      satisfaction: 0.0
    },
    preferredPace: 'slow',
    touchpoints: []
  },

  returningUser: {
    id: 'user_002',
    isFirstTime: false,
    sessionCount: 8,
    totalTimeSpent: 420,
    completedOnboarding: true,
    emotionalProfile: {
      confidence: 0.6,
      anxiety: 0.3,
      motivation: 0.7,
      satisfaction: 0.8
    },
    preferredPace: 'moderate',
    touchpoints: [
      { type: 'onboarding_completed', timestamp: '2024-01-01', satisfaction: 0.9 },
      { type: 'first_document_upload', timestamp: '2024-01-02', satisfaction: 0.8 },
      { type: 'category_completion', timestamp: '2024-01-05', satisfaction: 0.9 }
    ]
  },

  longTermUser: {
    id: 'user_003',
    isFirstTime: false,
    sessionCount: 45,
    totalTimeSpent: 1800,
    completedOnboarding: true,
    emotionalProfile: {
      confidence: 0.9,
      anxiety: 0.1,
      motivation: 0.6,
      satisfaction: 0.8
    },
    preferredPace: 'fast',
    touchpoints: [
      { type: 'onboarding_completed', timestamp: '2023-12-01', satisfaction: 0.9 },
      { type: 'expert_level_reached', timestamp: '2024-01-15', satisfaction: 0.9 },
      { type: 'will_generation_completed', timestamp: '2024-01-20', satisfaction: 1.0 },
      { type: 'family_sharing_setup', timestamp: '2024-01-25', satisfaction: 0.8 }
    ]
  }
}

describe('User Journey Testing Framework', () => {
  let journeyTracker: UserJourneyTracker
  let emotionalStateManager: EmotionalStateManager

  beforeEach(() => {
    journeyTracker = new UserJourneyTracker()
    emotionalStateManager = new EmotionalStateManager()
    vi.clearAllMocks()

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })
  })

  describe('First-Time User Experience Tests', () => {
    it('should track emotional state progression during onboarding', async () => {
      const emotionalStates: any[] = []

      render(
        <UserProvider initialUser={mockUserJourneyData.firstTimeUser}>
          <OnboardingExperience
            onEmotionalStateChange={(state) => emotionalStates.push(state)}
          />
        </UserProvider>
      )

      // Step 1: Sofia Introduction
      const sofiaIntro = screen.getByTestId('sofia-introduction')
      expect(sofiaIntro).toBeInTheDocument()

      await waitFor(() => {
        expect(emotionalStates[0]).toMatchObject({
          stage: 'introduction',
          anxiety: expect.any(Number),
          confidence: expect.any(Number)
        })
      })

      // Step 2: Trust Box Interaction
      const trustBox = screen.getByTestId('trust-box-3d')
      fireEvent.click(trustBox)

      await waitFor(() => {
        expect(emotionalStates.length).toBeGreaterThan(1)
        expect(emotionalStates[1].confidence).toBeGreaterThan(emotionalStates[0].confidence)
      })

      // Step 3: Key Graving
      const keyGraving = screen.getByTestId('key-graving')
      fireEvent.click(keyGraving)

      await waitFor(() => {
        expect(emotionalStates.length).toBeGreaterThan(2)
        expect(emotionalStates[2].engagement).toBeGreaterThan(0.7)
      })

      // Verify emotional progression
      expect(emotionalStates[emotionalStates.length - 1].satisfaction).toBeGreaterThan(0.6)
    })

    it('should measure onboarding completion rates', async () => {
      const completionEvents: any[] = []

      render(
        <UserProvider initialUser={mockUserJourneyData.firstTimeUser}>
          <OnboardingExperience
            onStepComplete={(step) => completionEvents.push(step)}
          />
        </UserProvider>
      )

      // Complete each onboarding step
      const steps = ['introduction', 'trust-box', 'key-graving', 'journey-path']

      for (const stepId of steps) {
        const stepElement = screen.getByTestId(`onboarding-${stepId}`)
        fireEvent.click(stepElement)

        await waitFor(() => {
          expect(screen.getByTestId(`${stepId}-completed`)).toBeInTheDocument()
        })
      }

      expect(completionEvents).toHaveLength(4)
      expect(completionEvents.every(event => event.completed)).toBe(true)
    })

    it('should track time-to-first-value metrics', async () => {
      const timeMetrics: any[] = []
      const startTime = Date.now()

      render(
        <UserProvider initialUser={mockUserJourneyData.firstTimeUser}>
          <OnboardingExperience
            onValueRealized={(value) => {
              timeMetrics.push({
                ...value,
                timeToValue: Date.now() - startTime
              })
            }}
          />
        </UserProvider>
      )

      // Simulate reaching first value milestone
      const uploadButton = screen.getByTestId('first-document-upload')
      fireEvent.click(uploadButton)

      await waitFor(() => {
        expect(timeMetrics).toHaveLength(1)
        expect(timeMetrics[0].timeToValue).toBeLessThan(300000) // 5 minutes
        expect(timeMetrics[0].valueType).toBe('first_document_upload')
      })
    })

    it('should identify common dropout points in onboarding', async () => {
      const dropoutEvents: any[] = []

      // Simulate multiple user sessions with different dropout patterns
      const dropoutScenarios = [
        { dropoutAt: 'introduction', reason: 'complexity' },
        { dropoutAt: 'trust-box', reason: 'technical_difficulty' },
        { dropoutAt: 'key-graving', reason: 'time_constraint' }
      ]

      for (const scenario of dropoutScenarios) {
        render(
          <UserProvider initialUser={{...mockUserJourneyData.firstTimeUser, id: Math.random().toString()}}>
            <OnboardingExperience
              onDropout={(event) => dropoutEvents.push(event)}
              simulateDropoutAt={scenario.dropoutAt}
              dropoutReason={scenario.reason}
            />
          </UserProvider>
        )

        // Simulate user leaving at specific step
        fireEvent.click(screen.getByTestId('simulate-dropout'))
      }

      expect(dropoutEvents).toHaveLength(3)
      expect(dropoutEvents.map(e => e.step)).toEqual(['introduction', 'trust-box', 'key-graving'])
    })

    it('should measure emotional satisfaction after first document upload', async () => {
      const satisfactionScores: number[] = []

      render(
        <UserProvider initialUser={mockUserJourneyData.firstTimeUser}>
          <Dashboard
            onSatisfactionSurvey={(score) => satisfactionScores.push(score)}
          />
        </UserProvider>
      )

      // Simulate first document upload completion
      const uploadComplete = screen.getByTestId('upload-completion-celebration')
      fireEvent.click(uploadComplete)

      await waitFor(() => {
        expect(screen.getByTestId('satisfaction-survey')).toBeInTheDocument()
      })

      // User rates satisfaction
      const satisfactionRating = screen.getByTestId('satisfaction-rating-5')
      fireEvent.click(satisfactionRating)

      await waitFor(() => {
        expect(satisfactionScores).toContain(5)
      })
    })
  })

  describe('Returning User Experience Tests', () => {
    it('should track engagement patterns across sessions', async () => {
      const engagementData: any[] = []

      // Simulate multiple sessions
      for (let session = 1; session <= 5; session++) {
        const sessionUser = {
          ...mockUserJourneyData.returningUser,
          sessionCount: session,
          currentSession: session
        }

        render(
          <UserProvider initialUser={sessionUser}>
            <Dashboard
              onEngagementMetric={(metric) => engagementData.push({...metric, session})}
            />
          </UserProvider>
        )

        // Simulate various user actions
        const actions = ['document_view', 'category_browse', 'sofia_interaction']
        for (const action of actions) {
          const actionElement = screen.getByTestId(`action-${action}`)
          fireEvent.click(actionElement)
        }

        await waitFor(() => {
          expect(engagementData.filter(d => d.session === session)).toHaveLength(3)
        })
      }

      // Analyze engagement trends
      const sessionEngagement = engagementData.reduce((acc, curr) => {
        acc[curr.session] = (acc[curr.session] || 0) + curr.engagementScore
        return acc
      }, {})

      expect(Object.keys(sessionEngagement)).toHaveLength(5)
    })

    it('should measure feature adoption rates over time', async () => {
      const featureAdoption: any[] = []

      render(
        <UserProvider initialUser={mockUserJourneyData.returningUser}>
          <Dashboard
            onFeatureAdoption={(adoption) => featureAdoption.push(adoption)}
          />
        </UserProvider>
      )

      // Simulate progressive feature discovery
      const features = [
        { id: 'advanced_search', complexity: 'medium' },
        { id: 'will_generator', complexity: 'high' },
        { id: 'time_capsule', complexity: 'high' },
        { id: 'family_sharing', complexity: 'medium' }
      ]

      for (const feature of features) {
        const featureElement = screen.getByTestId(`feature-${feature.id}`)
        fireEvent.click(featureElement)

        await waitFor(() => {
          expect(featureAdoption.some(a => a.featureId === feature.id)).toBe(true)
        })
      }

      expect(featureAdoption).toHaveLength(4)
      expect(featureAdoption.every(a => a.adopted)).toBe(true)
    })

    it('should track user confidence growth', async () => {
      const confidenceMetrics: any[] = []

      // Simulate confidence progression over multiple interactions
      const interactions = [
        { type: 'successful_upload', confidenceImpact: 0.1 },
        { type: 'category_completion', confidenceImpact: 0.15 },
        { type: 'will_creation', confidenceImpact: 0.2 },
        { type: 'family_sharing', confidenceImpact: 0.1 }
      ]

      for (const interaction of interactions) {
        await journeyTracker.recordInteraction(
          mockUserJourneyData.returningUser.id,
          interaction.type,
          { confidenceImpact: interaction.confidenceImpact }
        )

        const currentConfidence = await journeyTracker.getConfidenceLevel(
          mockUserJourneyData.returningUser.id
        )

        confidenceMetrics.push({
          interaction: interaction.type,
          confidence: currentConfidence
        })
      }

      // Verify confidence growth trend
      for (let i = 1; i < confidenceMetrics.length; i++) {
        expect(confidenceMetrics[i].confidence).toBeGreaterThanOrEqual(
          confidenceMetrics[i - 1].confidence
        )
      }
    })

    it('should measure task completion efficiency improvement', async () => {
      const efficiencyMetrics: any[] = []

      // Simulate the same task performed multiple times with improving efficiency
      const task = 'document_categorization'
      const attempts = [
        { sessionId: 1, timeSpent: 120, accuracy: 0.7 },
        { sessionId: 2, timeSpent: 90, accuracy: 0.8 },
        { sessionId: 3, timeSpent: 60, accuracy: 0.9 },
        { sessionId: 4, timeSpent: 45, accuracy: 0.95 }
      ]

      for (const attempt of attempts) {
        const efficiency = await journeyTracker.measureTaskEfficiency(
          mockUserJourneyData.returningUser.id,
          task,
          attempt
        )
        efficiencyMetrics.push(efficiency)
      }

      // Verify efficiency improvements
      expect(efficiencyMetrics[3].timeSpent).toBeLessThan(efficiencyMetrics[0].timeSpent)
      expect(efficiencyMetrics[3].accuracy).toBeGreaterThan(efficiencyMetrics[0].accuracy)
      expect(efficiencyMetrics[3].efficiencyScore).toBeGreaterThan(efficiencyMetrics[0].efficiencyScore)
    })
  })

  describe('Long-Term Engagement Pattern Tests', () => {
    it('should identify user lifecycle stages', async () => {
      const lifecycleStages: any[] = []

      // Simulate user progression through different lifecycle stages
      const progressionData = [
        { documentsCount: 1, stage: 'newbie' },
        { documentsCount: 5, stage: 'active' },
        { documentsCount: 15, stage: 'experienced' },
        { documentsCount: 30, stage: 'expert' },
        { documentsCount: 50, stage: 'advocate' }
      ]

      for (const data of progressionData) {
        const stage = await journeyTracker.identifyLifecycleStage({
          ...mockUserJourneyData.longTermUser,
          documentsCount: data.documentsCount
        })

        lifecycleStages.push({
          documentsCount: data.documentsCount,
          identifiedStage: stage,
          expectedStage: data.stage
        })
      }

      lifecycleStages.forEach(stage => {
        expect(stage.identifiedStage).toBe(stage.expectedStage)
      })
    })

    it('should track retention and churn indicators', async () => {
      const retentionMetrics: any[] = []

      // Simulate user activity patterns that indicate retention risk
      const activityPatterns = [
        { lastActivity: 1, sessionFrequency: 0.8, riskLevel: 'low' },
        { lastActivity: 7, sessionFrequency: 0.4, riskLevel: 'medium' },
        { lastActivity: 14, sessionFrequency: 0.2, riskLevel: 'high' },
        { lastActivity: 30, sessionFrequency: 0.0, riskLevel: 'critical' }
      ]

      for (const pattern of activityPatterns) {
        const retentionRisk = await journeyTracker.assessRetentionRisk(
          mockUserJourneyData.longTermUser.id,
          pattern
        )

        retentionMetrics.push({
          pattern,
          riskLevel: retentionRisk.level,
          recommendations: retentionRisk.recommendations
        })
      }

      retentionMetrics.forEach(metric => {
        expect(metric.riskLevel).toBe(metric.pattern.riskLevel)
        expect(metric.recommendations).toBeDefined()
      })
    })

    it('should measure lifetime value progression', async () => {
      const lifetimeValueMetrics: any[] = []

      // Simulate value-generating activities over time
      const valueActivities = [
        { activity: 'document_upload', value: 10, timestamp: '2024-01-01' },
        { activity: 'category_completion', value: 25, timestamp: '2024-01-05' },
        { activity: 'will_creation', value: 100, timestamp: '2024-01-10' },
        { activity: 'family_sharing', value: 50, timestamp: '2024-01-15' },
        { activity: 'referral', value: 75, timestamp: '2024-01-20' }
      ]

      let cumulativeValue = 0
      for (const activity of valueActivities) {
        cumulativeValue += activity.value

        const ltv = await journeyTracker.calculateLifetimeValue(
          mockUserJourneyData.longTermUser.id,
          { cumulativeValue, latestActivity: activity }
        )

        lifetimeValueMetrics.push({
          timestamp: activity.timestamp,
          activity: activity.activity,
          incrementalValue: activity.value,
          lifetimeValue: ltv
        })
      }

      // Verify LTV progression
      for (let i = 1; i < lifetimeValueMetrics.length; i++) {
        expect(lifetimeValueMetrics[i].lifetimeValue).toBeGreaterThan(
          lifetimeValueMetrics[i - 1].lifetimeValue
        )
      }
    })

    it('should identify advocacy and referral patterns', async () => {
      const advocacyMetrics: any[] = []

      // Simulate advocacy behaviors
      const advocacyBehaviors = [
        { type: 'positive_review', score: 5, platform: 'app_store' },
        { type: 'social_share', engagement: 15, platform: 'facebook' },
        { type: 'referral_sent', conversion: true, refereeId: 'user_004' },
        { type: 'feature_request', constructiveness: 0.9, implemented: true }
      ]

      for (const behavior of advocacyBehaviors) {
        const advocacyScore = await journeyTracker.measureAdvocacyBehavior(
          mockUserJourneyData.longTermUser.id,
          behavior
        )

        advocacyMetrics.push({
          behavior: behavior.type,
          score: advocacyScore,
          isAdvocate: advocacyScore > 0.7
        })
      }

      const advocateCount = advocacyMetrics.filter(m => m.isAdvocate).length
      expect(advocateCount).toBeGreaterThan(0)
    })
  })

  describe('Emotional Satisfaction Survey Tests', () => {
    it('should trigger satisfaction surveys at appropriate moments', async () => {
      const surveyTriggers: any[] = []

      render(
        <UserProvider initialUser={mockUserJourneyData.returningUser}>
          <Dashboard
            onSurveyTriggered={(trigger) => surveyTriggers.push(trigger)}
          />
        </UserProvider>
      )

      // Simulate milestone events that should trigger surveys
      const milestoneEvents = [
        'first_document_upload',
        'category_completion',
        'will_generation_complete',
        'month_anniversary'
      ]

      for (const event of milestoneEvents) {
        fireEvent.click(screen.getByTestId(`trigger-${event}`))

        await waitFor(() => {
          expect(screen.getByTestId('satisfaction-survey-modal')).toBeInTheDocument()
        })

        // Close survey to test next trigger
        fireEvent.click(screen.getByTestId('survey-close'))
      }

      expect(surveyTriggers).toHaveLength(4)
    })

    it('should collect and analyze satisfaction scores', async () => {
      const satisfactionData: any[] = []

      // Simulate satisfaction survey responses
      const surveyResponses = [
        { category: 'ease_of_use', score: 4, feedback: 'Veľmi jednoduché na používanie' },
        { category: 'sofia_helpfulness', score: 5, feedback: 'Sofia je úžasná!' },
        { category: 'feature_completeness', score: 3, feedback: 'Chýbajú mi niektoré funkcie' },
        { category: 'emotional_comfort', score: 5, feedback: 'Cítim sa bezpečne' }
      ]

      for (const response of surveyResponses) {
        const analysis = await emotionalStateManager.analyzeSatisfactionResponse(
          mockUserJourneyData.returningUser.id,
          response
        )

        satisfactionData.push({
          ...response,
          sentiment: analysis.sentiment,
          actionItems: analysis.actionItems
        })
      }

      const averageScore = satisfactionData.reduce((sum, d) => sum + d.score, 0) / satisfactionData.length
      expect(averageScore).toBeGreaterThan(3.5)

      const positiveResponses = satisfactionData.filter(d => d.sentiment === 'positive')
      expect(positiveResponses.length).toBeGreaterThan(satisfactionData.length / 2)
    })

    it('should track satisfaction trends over time', async () => {
      const satisfactionTrends: any[] = []

      // Simulate satisfaction measurements over multiple time periods
      const timePoints = [
        { period: 'week1', score: 3.2, factors: ['learning_curve'] },
        { period: 'month1', score: 4.1, factors: ['feature_discovery'] },
        { period: 'month3', score: 4.5, factors: ['habit_formation'] },
        { period: 'month6', score: 4.8, factors: ['value_realization'] }
      ]

      for (const timePoint of timePoints) {
        const trend = await emotionalStateManager.trackSatisfactionTrend(
          mockUserJourneyData.returningUser.id,
          timePoint
        )

        satisfactionTrends.push({
          period: timePoint.period,
          score: trend.score,
          trajectory: trend.trajectory,
          factors: trend.influencingFactors
        })
      }

      // Verify positive satisfaction trend
      for (let i = 1; i < satisfactionTrends.length; i++) {
        expect(satisfactionTrends[i].score).toBeGreaterThanOrEqual(
          satisfactionTrends[i - 1].score
        )
      }
    })
  })

  describe('Onboarding Completion Rate Tracking', () => {
    it('should measure completion rates across different user segments', async () => {
      const completionRates: any[] = []

      // Test different user segments
      const userSegments = [
        { segment: 'tech_savvy', users: 100, expectedCompletion: 0.85 },
        { segment: 'seniors', users: 100, expectedCompletion: 0.65 },
        { segment: 'busy_professionals', users: 100, expectedCompletion: 0.70 },
        { segment: 'grief_support', users: 100, expectedCompletion: 0.75 }
      ]

      for (const segment of userSegments) {
        const rate = await journeyTracker.measureCompletionRate(segment.segment, {
          totalUsers: segment.users,
          timeframe: '30days'
        })

        completionRates.push({
          segment: segment.segment,
          actualRate: rate,
          expectedRate: segment.expectedCompletion,
          meetsExpectation: rate >= segment.expectedCompletion
        })
      }

      const successfulSegments = completionRates.filter(r => r.meetsExpectation)
      expect(successfulSegments.length).toBeGreaterThan(completionRates.length / 2)
    })

    it('should identify bottlenecks in onboarding flow', async () => {
      const bottleneckAnalysis: any[] = []

      // Analyze each onboarding step for completion rates
      const onboardingSteps = [
        'sofia_introduction',
        'trust_box_interaction',
        'key_graving',
        'journey_path',
        'first_document_prompt'
      ]

      for (const step of onboardingSteps) {
        const stepAnalysis = await journeyTracker.analyzeStepBottlenecks(step, {
          timeframe: '30days',
          userSegment: 'all'
        })

        bottleneckAnalysis.push({
          step,
          completionRate: stepAnalysis.completionRate,
          averageTimeSpent: stepAnalysis.averageTimeSpent,
          dropoffReasons: stepAnalysis.dropoffReasons,
          isBottleneck: stepAnalysis.completionRate < 0.8
        })
      }

      const bottleneckSteps = bottleneckAnalysis.filter(s => s.isBottleneck)
      expect(bottleneckSteps.length).toBeLessThan(onboardingSteps.length / 2)
    })

    it('should track completion rate improvements after optimizations', async () => {
      const improvementMetrics: any[] = []

      // Simulate A/B testing of onboarding improvements
      const optimizations = [
        {
          name: 'simplified_trust_box',
          beforeRate: 0.65,
          afterRate: 0.78,
          timeframe: '2weeks'
        },
        {
          name: 'interactive_sofia_intro',
          beforeRate: 0.72,
          afterRate: 0.85,
          timeframe: '2weeks'
        },
        {
          name: 'progress_indicators',
          beforeRate: 0.68,
          afterRate: 0.76,
          timeframe: '2weeks'
        }
      ]

      for (const optimization of optimizations) {
        const improvement = await journeyTracker.measureOptimizationImpact(
          optimization.name,
          {
            beforeRate: optimization.beforeRate,
            afterRate: optimization.afterRate,
            timeframe: optimization.timeframe
          }
        )

        improvementMetrics.push({
          optimization: optimization.name,
          improvement: improvement.percentageIncrease,
          significance: improvement.statisticalSignificance,
          isSuccessful: improvement.percentageIncrease > 0.1
        })
      }

      const successfulOptimizations = improvementMetrics.filter(m => m.isSuccessful)
      expect(successfulOptimizations.length).toBe(optimizations.length)
    })
  })
})