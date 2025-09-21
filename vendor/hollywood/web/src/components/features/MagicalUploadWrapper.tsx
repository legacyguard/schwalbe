
/**
 * Magical Upload Wrapper
 * Enhances the existing DocumentUploader with magical animations
 */

'use client';

import React, { useState } from 'react';
import { DocumentUploader } from './DocumentUploader';
import { DocumentAnalysisAnimation } from './MagicalDocumentUpload';
import { usePersonalityManager } from '@/components/sofia/usePersonalityManager';
import type { PersonalityMode } from '@/lib/sofia-types';

interface MagicalUploadWrapperProps {
  className?: string;
  enableMagicalEnhancements?: boolean;
  personalityMode?: PersonalityMode;
}

/**
 * Wrapper component that can enhance any upload component with magical features
 */
export const MagicalUploadWrapper: React.FC<MagicalUploadWrapperProps> = ({
  enableMagicalEnhancements = true,
  personalityMode: propPersonalityMode,
  className = '',
}) => {
  const personalityManager = usePersonalityManager();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFileName, _setProcessingFileName] = useState<string>();

  // Get effective personality mode
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    propPersonalityMode ||
    (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  // For now, just render the enhanced uploader with magical features
  // In a real implementation, this could wrap any uploader component
  if (!enableMagicalEnhancements) {
    return <DocumentUploader />;
  }

  return (
    <div className={className}>
      {isProcessing ? (
        <DocumentAnalysisAnimation
          isAnalyzing={isProcessing}
          fileName={processingFileName}
          analysisProgress={75}
          personalityMode={effectiveMode}
          onAnimationComplete={() => setIsProcessing(false)}
        />
      ) : (
        <DocumentUploader />
      )}
    </div>
  );
};

export default MagicalUploadWrapper;
