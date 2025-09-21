
/**
 * Interactive Garden Test Component
 * Simple test harness for the new Living Garden enhancements
 */

import React, { useState } from 'react';
import { LegacyGardenVisualization } from './LegacyGardenVisualization';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InteractiveGardenTestProps {
  className?: string;
}

export const InteractiveGardenTest: React.FC<InteractiveGardenTestProps> = ({
  className = '',
}) => {
  // Test state
  const [documentsCount, setDocumentsCount] = useState(2);
  const [familyMembersCount, setFamilyMembersCount] = useState(1);
  const [emergencyContactsCount, setEmergencyContactsCount] = useState(1);
  const [willCompleted, setWillCompleted] = useState(false);
  const [trustScore, setTrustScore] = useState(45);
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([
    'first_document',
    'family_added',
  ]);
  const [recentlyCompletedMilestones, setRecentlyCompletedMilestones] =
    useState<string[]>([]);
  const [personalityMode, setPersonalityMode] = useState<
    'adaptive' | 'empathetic' | 'pragmatic'
  >('adaptive');

  // Test actions
  const addDocument = () => {
    setDocumentsCount(prev => prev + 1);
    const newMilestone = `document_${documentsCount + 1}`;
    setAchievedMilestones(prev => [...prev, newMilestone]);
    setRecentlyCompletedMilestones([newMilestone]);

    // Clear recent milestone after 2 seconds
    setTimeout(() => setRecentlyCompletedMilestones([]), 2000);
  };

  const addFamilyMember = () => {
    setFamilyMembersCount(prev => prev + 1);
    const newMilestone = `family_${familyMembersCount + 1}`;
    setAchievedMilestones(prev => [...prev, newMilestone]);
    setRecentlyCompletedMilestones([newMilestone]);

    setTimeout(() => setRecentlyCompletedMilestones([]), 2000);
  };

  const completeWill = () => {
    if (!willCompleted) {
      setWillCompleted(true);
      const newMilestone = 'will_completed';
      setAchievedMilestones(prev => [...prev, newMilestone]);
      setRecentlyCompletedMilestones([newMilestone]);
      setTrustScore(85);

      setTimeout(() => setRecentlyCompletedMilestones([]), 2000);
    }
  };

  const triggerCelebration = () => {
    const celebrationMilestone = `test_celebration_${Date.now()}`;
    setRecentlyCompletedMilestones([celebrationMilestone]);

    setTimeout(() => setRecentlyCompletedMilestones([]), 2000);
  };

  const resetGarden = () => {
    setDocumentsCount(0);
    setFamilyMembersCount(0);
    setEmergencyContactsCount(0);
    setWillCompleted(false);
    setTrustScore(15);
    setAchievedMilestones([]);
    setRecentlyCompletedMilestones([]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Interactive Living Garden Test</CardTitle>
          <CardDescription>
            Test the enhanced garden animations and celebrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className='space-y-4 mb-6'>
            <div className='flex flex-wrap gap-2'>
              <Button onClick={addDocument} variant='outline' size='sm'>
                Add Document ({documentsCount})
              </Button>
              <Button onClick={addFamilyMember} variant='outline' size='sm'>
                Add Family Member ({familyMembersCount})
              </Button>
              <Button
                onClick={completeWill}
                variant='outline'
                size='sm'
                disabled={willCompleted}
              >
                {willCompleted ? 'Will Completed ✓' : 'Complete Will'}
              </Button>
              <Button onClick={triggerCelebration} variant='outline' size='sm'>
                Test Celebration
              </Button>
              <Button onClick={resetGarden} variant='destructive' size='sm'>
                Reset Garden
              </Button>
            </div>

            {/* Personality Mode Toggle */}
            <div className='flex gap-2 items-center'>
              <span className='text-sm font-medium'>Personality:</span>
              {(['empathetic', 'pragmatic', 'adaptive'] as const).map(mode => (
                <Badge
                  key={mode}
                  variant={personalityMode === mode ? 'default' : 'secondary'}
                  className='cursor-pointer hover:bg-opacity-80 transition-colors'
                  onClick={() => setPersonalityMode(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>

            {/* Status Display */}
            <div className='text-sm text-gray-600 space-y-1'>
              <p>
                Documents: {documentsCount} | Family: {familyMembersCount} |
                Trust Score: {trustScore}
              </p>
              <p>Milestones: {achievedMilestones.length} achieved</p>
              {recentlyCompletedMilestones.length > 0 && (
                <p className='text-green-600 font-medium'>
                  🎉 Recent: {recentlyCompletedMilestones.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Interactive Garden */}
          <div className='border rounded-lg bg-gradient-to-b from-sky-50 to-green-50 p-4'>
            <LegacyGardenVisualization
              documentsCount={documentsCount}
              familyMembersCount={familyMembersCount}
              emergencyContactsCount={emergencyContactsCount}
              willCompleted={willCompleted}
              trustScore={trustScore}
              protectionDays={30}
              achievedMilestones={achievedMilestones}
              variant='full'
              animated={true}
              interactive={true}
              showWeather={true}
              personalityMode={personalityMode}
              showInteractiveEnhancements={true}
              recentlyCompletedMilestones={recentlyCompletedMilestones}
              onElementClick={element => {
                // Garden element clicked - could trigger detailed view
                if (element.milestone) {
                  console.warn('Garden element clicked:', element.milestone);
                }
              }}
              onSofiaFireflyClick={() => {
                console.warn('Sofia firefly clicked! ✨');
                // Could show a message or trigger some action
              }}
              className='min-h-[400px]'
            />
          </div>

          {/* Instructions */}
          <div className='mt-4 text-sm text-gray-500 space-y-2'>
            <p>
              <strong>Test Features:</strong>
            </p>
            <ul className='list-disc list-inside space-y-1 ml-4'>
              <li>Watch for subtle leaf movements on trees and sprouts</li>
              <li>Look for Sofia's firefly floating around the garden</li>
              <li>Click "Test Celebration" to see firefly swarm celebration</li>
              <li>Add elements to trigger milestone celebrations</li>
              <li>
                Try different personality modes to see animation variations
              </li>
              <li>Click Sofia's firefly for a small interaction surprise</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveGardenTest;
