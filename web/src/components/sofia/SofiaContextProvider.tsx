
import React, { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useSofiaStore } from '@/stores/sofiaStore';
import type { SofiaContext } from '@/lib/sofia-types';
import { useLocation } from 'react-router-dom';
import { calculateUnlockedMilestones } from '@/lib/path-of-serenity';
import { useLocalization } from '@/contexts/LocalizationContext';
import { AdaptivePersonalityManager } from '@/lib/sofia-personality';
import { textManager } from '@/lib/text-manager';

interface SofiaContextProviderProps {
  children: React.ReactNode;
}

/**
 * Sofia Context Provider
 *
 * This component automatically tracks user context and updates Sofia's
 * understanding of the user's situation, progress, and needs.
 */
const SofiaContextProvider: React.FC<SofiaContextProviderProps> = ({
  children,
}) => {
  const { userId } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const { setContext, updateContext } = useSofiaStore();
  const { languageCode } = useLocalization();

  // Personality manager instance (persists across re-renders)
  const personalityManagerRef = useRef<AdaptivePersonalityManager | null>(null);

  // Initialize personality manager when userId is available
  useEffect(() => {
    if (!userId) {
      personalityManagerRef.current = null;
      return;
    }

    if (!personalityManagerRef.current) {
      personalityManagerRef.current = new AdaptivePersonalityManager(userId);
      // Register personality manager with text manager for integrated text adaptation
      textManager.registerPersonalityManager(
        userId,
        personalityManagerRef.current
      );
    }
  }, [userId]);

  // Initialize Sofia context when user data is available
  useEffect(() => {
    if (!userId || !user) return;

    // Get stored user progress data
    // Get stored user progress data
    const documentsKey = `documents_${userId}`;
    const guardiansKey = `guardians_${userId}`;

    let documentCount = 0;
    let guardianCount = 0;

    try {
      const storedDocs = localStorage.getItem(documentsKey);
      if (storedDocs) {
        const parsed = JSON.parse(storedDocs);
        documentCount = Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (error) {
      console.error('Failed to parse documents from localStorage:', error);
    }

    try {
      const storedGuardians = localStorage.getItem(guardiansKey);
      if (storedGuardians) {
        const parsed = JSON.parse(storedGuardians);
        guardianCount = Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (error) {
      console.error('Failed to parse guardians from localStorage:', error);
    }

    // Calculate completion percentage based on key milestones
    let completionPercentage = 0;

    // Documents: 0-40%
    completionPercentage += Math.min(documentCount * 8, 40); // Max 40% for 5+ docs

    // Guardians: 0-30%
    completionPercentage += Math.min(guardianCount * 15, 30); // Max 30% for 2+ guardians

    // Other milestones (will, video messages, etc.) - to be implemented
    // This leaves 30% for future features

    // Get recent activity
    const recentActivity: string[] = [];
    if (documentCount > 0) {
      recentActivity.push(`${documentCount} documents uploaded`);
    }
    if (guardianCount > 0) {
      recentActivity.push(`${guardianCount} guardians added`);
    }

    // Determine family status from user metadata or onboarding data
    // Determine family status from user metadata or onboarding data
    let familyStatus: SofiaContext['familyStatus'] = 'single';

    try {
      const onboardingData = localStorage.getItem(`onboarding_${userId}`);
      if (onboardingData) {
        const parsed = JSON.parse(onboardingData);
        familyStatus = parsed.familyStatus || 'single';
      }
    } catch (error) {
      console.error(
        'Failed to parse onboarding data from localStorage:',
        error
      );
    }

    // Calculate milestone progress for Path of Serenity
    const userStats = {
      documentsCount: documentCount,
      guardiansCount: guardianCount,
      categoriesWithDocuments: [], // This would need to come from actual document data
      hasExpiryTracking: false, // This would need to come from actual document data
      legacyItemsCount: 0, // This would need to come from legacy features
    };

    const milestoneResult = calculateUnlockedMilestones(userStats);
    const milestoneProgress = {
      unlockedCount: milestoneResult.milestones.filter(m => m.isUnlocked)
        .length,
      totalMilestones: milestoneResult.milestones.length,
      nextMilestone: milestoneResult.milestones.find(m => !m.isUnlocked)?.name,
      hasExpiryTracking: userStats.hasExpiryTracking,
      categoriesWithDocuments: userStats.categoriesWithDocuments,
    };

    // Get personality data from manager
    const personalityManager = personalityManagerRef.current;
    const personality = personalityManager?.getPersonality();

    // Create comprehensive context
    const context: SofiaContext = {
      userId,
      userName: user.firstName || user.fullName || undefined,
      documentCount,
      guardianCount,
      completionPercentage: Math.min(completionPercentage, 100),
      recentActivity,
      familyStatus,
      language: languageCode,
      milestoneProgress,
      personality,
    };

    setContext(context);
  }, [userId, user, languageCode, setContext]);

  // Update context when location changes (for contextual help)
  useEffect(() => {
    if (!userId) return;

    const currentPage = location.pathname.split('/')[1] || 'dashboard';
    const personalityManager = personalityManagerRef.current;

    // Track page navigation for personality learning
    if (personalityManager) {
      personalityManager.recordInteraction({
        timestamp: new Date(),
        action: `navigate_${currentPage}`,
        duration: 0, // Will be updated when user leaves the page
        context: currentPage,
        responseTime: 0, // Navigation is immediate
      });
    }

    updateContext({
      currentPage,
    });
  }, [location, userId, updateContext]);

  // Listen for document uploads and other events to update context
  useEffect(() => {
    const handleDocumentUploaded = () => {
      if (!userId) return;

      const personalityManager = personalityManagerRef.current;

      // Track document upload action for personality learning
      if (personalityManager) {
        personalityManager.recordInteraction({
          timestamp: new Date(),
          action: 'upload_document',
          duration: 5000, // Estimate 5 seconds for upload action
          context: 'document_management',
          responseTime: 2000, // Estimate 2 seconds response time
        });
      }

      // Refetch document count
      const documentsKey = `documents_${userId}`;
      const storedDocs = localStorage.getItem(documentsKey);
      const documentCount = storedDocs ? JSON.parse(storedDocs).length : 0;

      // Recalculate completion percentage
      const guardiansKey = `guardians_${userId}`;
      const storedGuardians = localStorage.getItem(guardiansKey);
      const guardianCount = storedGuardians
        ? JSON.parse(storedGuardians).length
        : 0;

      let completionPercentage = 0;
      completionPercentage += Math.min(documentCount * 8, 40);
      completionPercentage += Math.min(guardianCount * 15, 30);

      updateContext({
        documentCount,
        completionPercentage: Math.min(completionPercentage, 100),
        recentActivity: [
          `${documentCount} documents uploaded`,
          guardianCount > 0 ? `${guardianCount} guardians added` : '',
        ].filter(Boolean),
        personality: personalityManager?.getPersonality(),
      });
    };

    const handleGuardianAdded = () => {
      if (!userId) return;

      const personalityManager = personalityManagerRef.current;

      // Track guardian addition for personality learning
      if (personalityManager) {
        personalityManager.recordInteraction({
          timestamp: new Date(),
          action: 'add_guardian',
          duration: 10000, // Estimate 10 seconds for guardian addition
          context: 'guardian_management',
          responseTime: 3000, // Estimate 3 seconds response time
        });
      }

      // Similar logic for guardian updates
      const guardiansKey = `guardians_${userId}`;
      const storedGuardians = localStorage.getItem(guardiansKey);
      const guardianCount = storedGuardians
        ? JSON.parse(storedGuardians).length
        : 0;

      const documentsKey = `documents_${userId}`;
      const storedDocs = localStorage.getItem(documentsKey);
      const documentCount = storedDocs ? JSON.parse(storedDocs).length : 0;

      let completionPercentage = 0;
      completionPercentage += Math.min(documentCount * 8, 40);
      completionPercentage += Math.min(guardianCount * 15, 30);

      updateContext({
        guardianCount,
        completionPercentage: Math.min(completionPercentage, 100),
        recentActivity: [
          documentCount > 0 ? `${documentCount} documents uploaded` : '',
          `${guardianCount} guardians added`,
        ].filter(Boolean),
        personality: personalityManager?.getPersonality(),
      });
    };

    // Listen for custom events
    window.addEventListener('documentUploaded', handleDocumentUploaded);
    window.addEventListener('guardianAdded', handleGuardianAdded);

    return () => {
      window.removeEventListener('documentUploaded', handleDocumentUploaded);
      window.removeEventListener('guardianAdded', handleGuardianAdded);
    };
  }, [userId, updateContext]);

  return <>{children}</>;
};

// Export a way to access the personality manager from other components
export const usePersonalityManager = (): AdaptivePersonalityManager | null => {
  const { userId } = useAuth();
  const personalityManagerRef = useRef<AdaptivePersonalityManager | null>(null);

  useEffect(() => {
    if (!userId) {
      personalityManagerRef.current = null;
      return;
    }

    if (!personalityManagerRef.current) {
      personalityManagerRef.current = new AdaptivePersonalityManager(userId);
      // Register personality manager with text manager for integrated text adaptation
      textManager.registerPersonalityManager(
        userId,
        personalityManagerRef.current
      );
    }
  }, [userId]);

  return personalityManagerRef.current;
};

export default SofiaContextProvider;
