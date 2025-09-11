import { useEffect } from 'react';
import { useFireflyCelebration } from '../contexts/FireflyContext';
import type {
  MilestoneEventDetail,
  DocumentEventDetail,
  GuardianEventDetail,
} from '@schwalbe/shared/types/animations';

export const useFireflyEvents = () => {
  const { celebrateMilestone, celebrateUpload, celebrateGuardian } =
    useFireflyCelebration();

  useEffect(() => {
    // Handle milestone unlocked events
    const handleMilestoneUnlocked = (
      _event: CustomEvent<MilestoneEventDetail>
    ) => {
      celebrateMilestone();
    };

    // Handle document uploaded events
    const handleDocumentUploaded = (
      _event: CustomEvent<DocumentEventDetail>
    ) => {
      celebrateUpload();
    };

    // Handle guardian added events
    const handleGuardianAdded = (_event: CustomEvent<GuardianEventDetail>) => {
      celebrateGuardian();
    };

    // Add event listeners
    window.addEventListener(
      'milestoneUnlocked',
      handleMilestoneUnlocked as EventListener
    );
    window.addEventListener(
      'documentUploaded',
      handleDocumentUploaded as EventListener
    );
    window.addEventListener(
      'guardianAdded',
      handleGuardianAdded as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        'milestoneUnlocked',
        handleMilestoneUnlocked as EventListener
      );
      window.removeEventListener(
        'documentUploaded',
        handleDocumentUploaded as EventListener
      );
      window.removeEventListener(
        'guardianAdded',
        handleGuardianAdded as EventListener
      );
    };
  }, [celebrateMilestone, celebrateUpload, celebrateGuardian]);
};

export default useFireflyEvents;