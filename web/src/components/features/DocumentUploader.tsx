
'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { AnimatePresence, motion } from 'framer-motion';
import { useSecureEncryption } from '@/hooks/useSecureEncryption';
import { SecurePasswordPrompt } from '@/components/encryption/SecurePasswordPrompt';
import { toast } from 'sonner';
import { textManager } from '@/lib/text-manager';
import {
  defaultUserPreferences,
  type UserPreferences,
} from '@/types/user-preferences';
import { useFireflyCelebration } from '@/contexts/FireflyContext';
import {
  DocumentAnalysisAnimation,
  MagicalDropZone,
} from './MagicalDocumentUpload';
import { usePersonalityManager } from '@/components/sofia/usePersonalityManager';
import type { PersonalityMode } from '@/lib/sofia-types';
import { useTranslation } from '@/i18n/useTranslation';

export const DocumentUploader = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    defaultUserPreferences
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();
  const { isReady, encryptFile } = useSecureEncryption();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const { celebrateUpload } = useFireflyCelebration();
  const personalityManager = usePersonalityManager();

  // Load user preferences
  React.useEffect(() => {
    if (userId) {
      const savedPrefs = localStorage.getItem(`preferences_${userId}`);
      if (savedPrefs) {
        try {
          setUserPreferences(JSON.parse(savedPrefs));
        } catch {
          // Error loading user preferences - use defaults
        }
      }
    }
  }, [userId]);

  const [isDragOver, setIsDragOver] = useState(false);

  // Get personality mode for magical animations
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const personalityMode: PersonalityMode =
    detectedMode === 'balanced' ? 'adaptive' : detectedMode;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file size (max 10MB for MVP)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error(t('documents.uploader.fileSizeLimit'));
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) {
      toast.error(t('documents.uploader.selectFilePrompt'));
      return;
    }

    // Check if encryption is ready
    if (!isReady) {
      setShowPasswordPrompt(true);
      toast.info(t('documents.uploader.unlockEncryption'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Start magical analysis animation
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Create Supabase client with Clerk token
      const supabase = await createSupabaseClient();

      // Update progress
      setUploadProgress(20);
      setAnalysisProgress(25);

      // Encrypt the file using new encryption service
      const encryptionResult = await encryptFile(file);

      if (!encryptionResult) {
        throw new Error(t('documents.uploader.encryptionFailed'));
      }

      const { encryptedFile, metadata } = encryptionResult;

      setUploadProgress(50);
      setAnalysisProgress(60);

      // Use the encrypted blob directly
      const encryptedBlob = encryptedFile;

      // Generate unique file name
      const timestamp = Date.now();
      const encryptedFileName = `${timestamp}_${file.name}.encrypted`;
      const filePath = `${userId}/${encryptedFileName}`;

      setUploadProgress(70);
      setAnalysisProgress(85);

      // Upload to Supabase Storage with authenticated client
      const { error } = await supabase.storage
        .from('user_documents')
        .upload(filePath, encryptedBlob, {
          contentType: 'application/octet-stream',
          upsert: false,
        });

      if (error) {
        // If bucket doesn't exist, show helpful message
        if (error.message.includes('bucket')) {
          throw new Error(t('documents.uploader.bucketNotConfigured'));
        }
        throw error;
      }

      setUploadProgress(90);
      setAnalysisProgress(95);

      // Save metadata to database
      // Pre development posielame user_id explicitne
      // Store nonce with document for decryption
      const nonceBase64 = btoa(
        String.fromCharCode(
          ...(metadata?.iv
            ? new Uint8Array(metadata.iv.split(',').map(Number))
            : [])
        )
      );

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: userId, // Explicitne posielame Clerk user ID
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        document_type: 'General',
        encrypted_at: new Date().toISOString(),
        encryption_nonce: nonceBase64,
      });

      if (dbError) {
        // // console.error('Database error:', dbError);
        // Try to delete the uploaded file if database insert fails
        await supabase.storage.from('user_documents').remove([filePath]);
        throw new Error(t('documents.uploader.metadataError'));
      }

      // No longer storing in localStorage - all handled server-side

      setUploadProgress(100);
      setAnalysisProgress(100);

      // Use adaptive success message
      const adaptiveSuccessMessage = textManager.getText(
        'document_upload_success',
        userPreferences.communication.style,
        userId
      );
      toast.success(adaptiveSuccessMessage);

      // Emit event to refresh document list
      window.dispatchEvent(
        new CustomEvent('documentUploaded', { detail: { userId } })
      );

      // Celebrate with Sofia firefly
      celebrateUpload();

      // Reset form after animation completes
      setTimeout(() => {
        setFile(null);
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        const fileInput = document.getElementById(
          'file-input'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 1500);
    } catch (error: unknown) {
      // // console.error('Error uploading file:', error);

      // Use adaptive error message
      const adaptiveErrorMessage = textManager.getText(
        'upload_error',
        userPreferences.communication.style,
        userId
      );
      toast.error(
        error instanceof Error ? error.message : adaptiveErrorMessage
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Keep analysis animation state for success animation
    }
  };

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
      const droppedFile = files[0];

      // Validate file size (max 10MB for MVP)
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const validTypes = [
        '.pdf',
        '.doc',
        '.docx',
        '.jpg',
        '.jpeg',
        '.png',
        '.txt',
      ];
      const fileExtension =
        '.' + droppedFile.name.split('.').pop()?.toLowerCase();

      if (!validTypes.includes(fileExtension)) {
        toast.error(
          'Please select a valid file type (PDF, DOC, DOCX, JPG, PNG, or TXT)'
        );
        return;
      }

      setFile(droppedFile);
      toast.success(`File "${droppedFile.name}" selected for upload`);
    }
  };

  return (
    <FadeIn duration={0.5} delay={0.3}>
      <Card className='p-6 bg-card border-card-border'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Icon name="upload" className='w-5 h-5 text-primary' />
          </div>
          <div>
            <h3 className='font-semibold text-lg'>Secure Document Upload</h3>
            <p className='text-sm text-muted-foreground'>
              Your documents are encrypted before leaving your device
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          {/* Show analysis animation during upload */}
          {isAnalyzing ? (
            <DocumentAnalysisAnimation
              isAnalyzing={isAnalyzing}
              fileName={file?.name || 'Document'}
              analysisProgress={analysisProgress}
              personalityMode={personalityMode}
              onAnimationComplete={() => {
                setIsAnalyzing(false);
                setAnalysisProgress(0);
              }}
            />
          ) : (
            /* Enhanced Magical Drag & Drop Upload Area */
            <MagicalDropZone
              isDragOver={isDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              personalityMode={personalityMode}
              className='p-8'
            >
              <div className='text-center space-y-4'>
                <motion.div
                  className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgb(var(--primary) / 0.15)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    name="upload"
                    className='w-6 h-6 text-primary'
                  />
                </motion.div>

                <div>
                  <p className='text-lg font-medium mb-2'>
                    Choose a file or drag & drop
                  </p>
                  <p
                    id='upload-instructions'
                    className='text-sm text-muted-foreground mb-4'
                  >
                    Supports PDF, DOC, DOCX, JPG, PNG, TXT (max 10MB). Press
                    Enter or Space to browse files.
                  </p>

                  <Input
                    id='file-input'
                    type='file'
                    onChange={handleFileChange}
                    className='sr-only'
                    accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt'
                    disabled={isUploading}
                  />

                  <motion.label
                    htmlFor='file-input'
                    className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer transition-colors'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon name="documents" className='w-4 h-4' />
                    Browse Files
                  </motion.label>
                </div>
              </div>
            </MagicalDropZone>
          )}

          <div className='flex gap-2'>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                id='document-upload-button'
                onClick={handleUpload}
                disabled={!file || isUploading}
                className='min-w-[120px]'
              >
                {isUploading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Icon name="upload" className='w-4 h-4 mr-2' />
                    </motion.div>
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Icon name="upload" className='w-4 h-4 mr-2' />
                    Upload
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {isUploading && (
              <motion.div
                className='space-y-2'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className='flex justify-between text-sm'>
                  <motion.span
                    className='text-muted-foreground'
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Processing...
                  </motion.span>
                  <motion.span
                    className='text-primary'
                    key={uploadProgress}
                    initial={{ scale: 1.2, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {uploadProgress}%
                  </motion.span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2 overflow-hidden'>
                  <motion.div
                    className='bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full'
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {file && !isUploading && (
              <motion.div
                className='flex items-center gap-2 p-3 bg-primary/5 rounded-lg'
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon
                    name="documents"
                    className='w-4 h-4 text-primary'
                  />
                </motion.div>
                <span className='text-sm font-medium'>{file.name}</span>
                <span className='text-xs text-muted-foreground'>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <motion.button
                  className='ml-auto p-1 hover:bg-red-100 rounded-full transition-colors'
                  onClick={() => setFile(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon
                    name="x"
                    className='w-3 h-3 text-muted-foreground hover:text-red-500'
                  />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className='mt-4 p-3 bg-status-warning/10 rounded-lg'>
          <div className='flex gap-2'>
            <Icon
              name="info"
              className='w-4 h-4 text-status-warning flex-shrink-0 mt-0.5'
            />
            <div className='text-xs text-muted-foreground'>
              <p className='font-medium mb-1'>End-to-End Encryption</p>
              <p>
                Your files are encrypted on your device before upload. Only you
                can decrypt them with your personal key.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Secure Password Prompt */}
      {showPasswordPrompt && (
        <SecurePasswordPrompt
          onSuccess={() => setShowPasswordPrompt(false)}
          onCancel={() => setShowPasswordPrompt(false)}
        />
      )}
    </FadeIn>
  );
};
