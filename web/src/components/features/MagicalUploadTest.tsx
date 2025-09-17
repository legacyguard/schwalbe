
/**
 * Magical Upload Test Component
 * Demonstrates the magical document upload enhancements
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DocumentAnalysisAnimation,
  MagicalDropZone,
  SofiaFireflyWelcome,
} from './MagicalDocumentUpload';
import type { PersonalityMode } from '@/lib/sofia-types';

interface MagicalUploadTestProps {
  className?: string;
}

export const MagicalUploadTest: React.FC<MagicalUploadTestProps> = ({
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [personalityMode, setPersonalityMode] =
    useState<PersonalityMode>('adaptive');
  const [showFireflyDemo, setShowFireflyDemo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
      startMagicalAnalysis();
    }
  };

  const startMagicalAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis phases
    const phases = [25, 60, 90, 100];
    let currentPhase = 0;

    const progressInterval = setInterval(() => {
      if (currentPhase < phases.length) {
        setAnalysisProgress(phases[currentPhase]);
        currentPhase++;
      } else {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisProgress(0);
          setSelectedFile(null);
        }, 1500);
      }
    }, 1200);
  };

  const testFireflyWelcome = () => {
    setShowFireflyDemo(true);
    setTimeout(() => setShowFireflyDemo(false), 4000);
  };

  const resetDemo = () => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setSelectedFile(null);
    setIsDragOver(false);
    setShowFireflyDemo(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Magical Document Upload Demo</CardTitle>
          <CardDescription>
            Experience the enhanced document upload with Sofia's magical
            assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className='space-y-4 mb-6'>
            <div className='flex gap-2 items-center'>
              <span className='text-sm font-medium'>Personality Mode:</span>
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

            <div className='flex gap-2 flex-wrap'>
              <Button onClick={testFireflyWelcome} variant='outline' size='sm'>
                Test Firefly Welcome
              </Button>
              <Button
                onClick={startMagicalAnalysis}
                variant='outline'
                size='sm'
              >
                Test Analysis Animation
              </Button>
              <Button onClick={resetDemo} variant='destructive' size='sm'>
                Reset Demo
              </Button>
            </div>
          </div>

          {/* Demo Area */}
          <div className='border rounded-lg bg-gradient-to-b from-sky-50 to-green-50 p-4 min-h-[400px]'>
            {isAnalyzing ? (
              <DocumentAnalysisAnimation
                isAnalyzing={isAnalyzing}
                fileName={selectedFile?.name || 'test-document.pdf'}
                analysisProgress={analysisProgress}
                personalityMode={personalityMode}
                onAnimationComplete={() => {
                  setIsAnalyzing(false);
                  setAnalysisProgress(0);
                }}
              />
            ) : (
              <div className='relative'>
                <MagicalDropZone
                  isDragOver={isDragOver || showFireflyDemo}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  personalityMode={personalityMode}
                  className='p-8 min-h-[300px]'
                >
                  <div className='text-center space-y-4'>
                    <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
                      <span className='text-2xl'>📄</span>
                    </div>
                    <div>
                      <p className='text-lg font-medium mb-2'>
                        Drop a file here to test magical upload
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Experience Sofia's welcoming firefly and document
                        analysis
                      </p>
                    </div>
                  </div>
                </MagicalDropZone>

                {/* Standalone firefly demo */}
                <SofiaFireflyWelcome
                  isVisible={showFireflyDemo}
                  personalityMode={personalityMode}
                  message={
                    personalityMode === 'empathetic'
                      ? "Welcome, dear friend! I'll lovingly help organize your precious documents! 💖"
                      : personalityMode === 'pragmatic'
                        ? 'Document processing interface ready. Initiating upload protocols.'
                        : 'Welcome! Let me work some magic on your document ✨'
                  }
                />
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className='mt-4 text-sm text-gray-500 space-y-2'>
            <p>
              <strong>Test the Magic:</strong>
            </p>
            <ul className='list-disc list-inside space-y-1 ml-4'>
              <li>
                Drag any file over the upload area to see Sofia's firefly
                welcome
              </li>
              <li>
                Drop a file to trigger the magical document analysis animation
              </li>
              <li>
                Try different personality modes to see animation variations
              </li>
              <li>Watch the document "break apart" into data particles</li>
              <li>
                See how Sofia guides the analysis with different personality
                styles
              </li>
            </ul>
            <p className='mt-4'>
              <strong>Current Features:</strong>
              <br />
              ✨ Firefly welcome animation when dragging files
              <br />
              📄 Document analysis with visual data extraction
              <br />
              🎨 Personality-aware animations and messages
              <br />♿ Full accessibility support with reduced motion compliance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MagicalUploadTest;
