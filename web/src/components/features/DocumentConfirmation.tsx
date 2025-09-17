
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { cn } from '@/lib/utils';

// Document analysis result interface matching our Supabase Edge Function
export interface DocumentAnalysisResult {
  confidence: number;
  expirationDate: {
    confidence: number;
    date: null | string;
    originalText?: string;
    reasoning: string;
  };
  extractedText: string;
  keyData: Array<{
    confidence: number;
    label: string;
    type: 'account' | 'amount' | 'contact' | 'other' | 'reference';
    value: string;
  }>;
  // Bundle Intelligence (Phase 2)
  potentialBundles: Array<{
    bundleCategory: string;
    bundleId: string;
    bundleName: string;
    documentCount: number;
    matchReasons: string[];
    matchScore: number;
    primaryEntity: string;
  }>;
  // Document Versioning (Phase 3)
  potentialVersions: Array<{
    documentId: string;
    fileName: string;
    matchReasons: string[];
    similarityScore: number;
    versionDate: string;
    versionNumber: number;
  }>;
  processingId: string;

  processingTime: number;

  suggestedCategory: {
    category: string;
    confidence: number;
    icon: string;
    reasoning: string;
  };

  suggestedNewBundle: null | {
    category: string;
    confidence: number;
    entityType: null | string;
    keywords: string[];
    name: string;
    primaryEntity: null | string;
    reasoning: string;
  };

  suggestedTags: string[];

  suggestedTitle: {
    confidence: number;
    reasoning: string;
    title: string;
  };
  versioningSuggestion: null | {
    action: 'new_version' | 'replace' | 'separate';
    confidence: number;
    reasoning: string;
    suggestedArchiveReason?: string;
  };
}

interface DocumentConfirmationProps {
  analysisResult: DocumentAnalysisResult;
  file: File;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: (
    confirmedData: DocumentAnalysisResult & {
      bundleSelection?: {
        action: 'link' | 'new' | 'none';
        bundleId: null | string;
        newBundleName: null | string;
        suggestedNewBundle: null | {
          category: string;
          confidence: number;
          entityType: null | string;
          keywords: string[];
          name: string;
          primaryEntity: null | string;
          reasoning: string;
        };
      };
      versionSelection?: {
        action: 'new_version' | 'none' | 'replace' | 'separate';
        archiveReason: string;
        versionId: null | string;
      };
    }
  ) => void;
}

export const DocumentConfirmation: React.FC<DocumentConfirmationProps> = ({
  file,
  analysisResult,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const [editableData, setEditableData] = useState(analysisResult);
  const [selectedBundleAction, setSelectedBundleAction] = useState<
    'link' | 'new' | 'none'
  >('none');
  const [selectedBundleId, setSelectedBundleId] = useState<null | string>(null);
  const [newBundleName, setNewBundleName] = useState(
    analysisResult.suggestedNewBundle?.name || ''
  );

  // Phase 3: Document versioning state
  const [selectedVersionAction, setSelectedVersionAction] = useState<
    'new_version' | 'none' | 'replace' | 'separate'
  >(analysisResult.versioningSuggestion?.action || 'none');
  const [selectedVersionId, setSelectedVersionId] = useState<null | string>(
    null
  );
  const [customArchiveReason, setCustomArchiveReason] = useState(
    analysisResult.versioningSuggestion?.suggestedArchiveReason || ''
  );

  const handleCategoryChange = (newCategory: string) => {
    setEditableData(prev => ({
      ...prev,
      suggestedCategory: {
        ...prev.suggestedCategory,
        category: newCategory,
      },
    }));
  };

  const handleTitleChange = (newTitle: string) => {
    setEditableData(prev => ({
      ...prev,
      suggestedTitle: {
        ...prev.suggestedTitle,
        title: newTitle,
      },
    }));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-status-success';
    if (confidence >= 0.6) return 'text-status-warning';
    return 'text-status-error';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return 'check-circle';
    if (confidence >= 0.6) return 'alert-triangle';
    return 'x-circle';
  };

  const categories = [
    { id: 'personal', label: 'Personal', icon: 'user' },
    { id: 'housing', label: 'Housing', icon: 'home' },
    { id: 'finances', label: 'Finances', icon: 'dollar' },
    { id: 'work', label: 'Work', icon: 'briefcase' },
    { id: 'health', label: 'Health', icon: 'heart' },
    { id: 'legal', label: 'Legal', icon: 'scale' },
    { id: 'vehicles', label: 'Vehicles', icon: 'car' },
    { id: 'insurance', label: 'Insurance', icon: 'shield' },
    { id: 'other', label: 'Other', icon: 'file' },
  ];

  return (
    <FadeIn duration={0.5}>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto'>
        {/* Document Preview */}
        <Card className='p-6 bg-card border-card-border'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <Icon name='documents' className='w-5 h-5 text-primary' />
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-lg'>Document Preview</h3>
              <p className='text-sm text-muted-foreground'>{file.name}</p>
            </div>
          </div>

          {/* File Info */}
          <div className='space-y-2 mb-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>File Size:</span>
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>File Type:</span>
              <span>{file.type || 'Unknown'}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Processing Time:</span>
              <span>{(analysisResult.processingTime / 1000).toFixed(2)}s</span>
            </div>
          </div>

          {/* Extracted Text Preview */}
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Extracted Text</span>
              <Badge variant='outline' className='text-xs'>
                {(analysisResult?.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </div>
            <div className='p-3 bg-muted rounded-lg max-h-32 overflow-y-auto'>
              <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                {analysisResult.extractedText.substring(0, 300)}
                {analysisResult.extractedText.length > 300 && '...'}
              </p>
            </div>
          </div>
        </Card>

        {/* Analysis Results */}
        <Card className='p-6 bg-card border-card-border'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <Icon name='brain' className='w-5 h-5 text-primary' />
            </div>
            <div>
              <h3 className='font-semibold text-lg'>AI Analysis Results</h3>
              <p className='text-sm text-muted-foreground'>
                Review and adjust the suggestions below
              </p>
            </div>
          </div>

          <div className='space-y-6'>
            {/* Suggested Category */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <h4 className='font-medium'>Category</h4>
                <Icon
                  name={getConfidenceIcon(
                    editableData.suggestedCategory?.confidence
                  )}
                  className={cn(
                    'w-4 h-4',
                    getConfidenceColor(
                      editableData.suggestedCategory?.confidence
                    )
                  )}
                />
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={
                      editableData.suggestedCategory.category === category.id
                        ? 'default'
                        : 'outline'
                    }
                    size='sm'
                    onClick={() => handleCategoryChange(category.id)}
                    className='justify-start gap-2'
                  >
                    <Icon
                      name={category.icon as IconName}
                      className='w-4 h-4'
                    />
                    {category.label}
                  </Button>
                ))}
              </div>
              <p className='text-xs text-muted-foreground'>
                {editableData.suggestedCategory.reasoning}
              </p>
            </div>

            {/* Suggested Title */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <h4 className='font-medium'>Document Title</h4>
                <Icon
                  name={getConfidenceIcon(
                    editableData.suggestedTitle?.confidence
                  )}
                  className={cn(
                    'w-4 h-4',
                    getConfidenceColor(editableData.suggestedTitle?.confidence)
                  )}
                />
              </div>
              <input
                type='text'
                value={editableData.suggestedTitle.title}
                onChange={e => handleTitleChange(e.target.value)}
                className='w-full p-2 border rounded-md bg-background'
                placeholder='Document title'
              />
              <p className='text-xs text-muted-foreground'>
                {editableData.suggestedTitle.reasoning}
              </p>
            </div>

            {/* Expiration Date */}
            {editableData.expirationDate.date && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <h4 className='font-medium'>Expiration Date</h4>
                  <Icon
                    name={getConfidenceIcon(
                      editableData.expirationDate?.confidence
                    )}
                    className={cn(
                      'w-4 h-4',
                      getConfidenceColor(
                        editableData.expirationDate?.confidence
                      )
                    )}
                  />
                </div>
                <div className='flex items-center gap-2 p-2 bg-status-warning/10 rounded-md'>
                  <Icon
                    name='calendar'
                    className='w-4 h-4 text-status-warning'
                  />
                  <span className='text-sm'>
                    {editableData.expirationDate.date}
                  </span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {editableData.expirationDate.reasoning}
                </p>
              </div>
            )}

            {/* Key Data */}
            {editableData.keyData.length > 0 && (
              <div className='space-y-3'>
                <h4 className='font-medium'>Key Information</h4>
                <div className='space-y-2'>
                  {editableData.keyData.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 p-2 bg-muted rounded-md'
                    >
                      <div className='flex items-center gap-2 flex-1'>
                        <span className='text-sm font-medium'>
                          {item.label}:
                        </span>
                        <span className='text-sm'>{item.value}</span>
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        {(item?.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Tags */}
            {editableData.suggestedTags.length > 0 && (
              <div className='space-y-3'>
                <h4 className='font-medium'>Suggested Tags</h4>
                <div className='flex flex-wrap gap-2'>
                  {editableData.suggestedTags.map((tag, index) => (
                    <Badge key={index} variant='secondary'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Document Versioning Section (Phase 3) */}
            {(editableData.potentialVersions.length > 0 ||
              editableData.versioningSuggestion) && (
              <div className='space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
                <div className='flex items-center gap-2'>
                  <Icon
                    name='clock'
                    className='w-5 h-5 text-yellow-600 dark:text-yellow-400'
                  />
                  <h4 className='font-medium text-yellow-800 dark:text-yellow-200'>
                    Document Version Detection
                  </h4>
                </div>

                {editableData.versioningSuggestion && (
                  <div className='p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-md'>
                    <p className='text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2'>
                      {editableData.versioningSuggestion.action === 'replace' &&
                        'This appears to be a newer version of an existing document.'}
                      {editableData.versioningSuggestion.action ===
                        'new_version' &&
                        'This looks like a new version of an existing document.'}
                      {editableData.versioningSuggestion.action ===
                        'separate' &&
                        'This may be related to an existing document but appears different enough to keep separate.'}
                    </p>
                    <p className='text-xs text-yellow-700 dark:text-yellow-300'>
                      {editableData.versioningSuggestion.reasoning}
                    </p>
                  </div>
                )}

                {/* Existing Document Versions */}
                {editableData.potentialVersions.length > 0 && (
                  <div className='space-y-3'>
                    <p className='text-sm text-muted-foreground'>
                      Found similar documents that might be older versions:
                    </p>

                    {editableData.potentialVersions.map(version => (
                      <div
                        key={version.documentId}
                        className='p-3 border rounded-lg bg-background'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <span className='font-medium text-sm'>
                            {version.fileName}
                          </span>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='text-xs'>
                              v{version.versionNumber}
                            </Badge>
                            <Badge variant='secondary' className='text-xs'>
                              {(version.similarityScore * 100).toFixed(0)}%
                              similar
                            </Badge>
                          </div>
                        </div>
                        <p className='text-xs text-muted-foreground mb-2'>
                          Uploaded:{' '}
                          {new Date(version.versionDate).toLocaleDateString()}
                        </p>
                        {version.matchReasons.length > 0 && (
                          <p className='text-xs text-muted-foreground'>
                            {version.matchReasons.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Versioning Action Selection */}
                <div className='space-y-3'>
                  <p className='text-sm font-medium'>
                    How would you like to handle this?
                  </p>

                  {editableData.versioningSuggestion?.action === 'replace' && (
                    <label className='flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'>
                      <input
                        type='radio'
                        name='versionAction'
                        value='replace'
                        checked={selectedVersionAction === 'replace'}
                        onChange={() => {
                          setSelectedVersionAction('replace');
                          setSelectedVersionId(
                            editableData.potentialVersions[0]?.documentId ||
                              null
                          );
                        }}
                        className='mt-0.5'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <Icon
                            name='refresh-cw'
                            className='w-4 h-4 text-yellow-600'
                          />
                          <span className='font-medium'>
                            Replace older version
                          </span>
                          <Badge variant='outline' className='text-xs'>
                            Recommended
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Archive the older document and keep this as the
                          current version
                        </p>
                        {selectedVersionAction === 'replace' && (
                          <div className='mt-2'>
                            <input
                              type='text'
                              value={customArchiveReason}
                              onChange={e =>
                                setCustomArchiveReason(e.target.value)
                              }
                              className='w-full p-2 border rounded-md bg-background text-sm'
                              placeholder='Archive reason (optional)'
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  )}

                  <label className='flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'>
                    <input
                      type='radio'
                      name='versionAction'
                      value='separate'
                      checked={selectedVersionAction === 'separate'}
                      onChange={() => {
                        setSelectedVersionAction('separate');
                        setSelectedVersionId(null);
                      }}
                      className='mt-0.5'
                    />
                    <div className='flex items-center gap-2'>
                      <Icon name='add' className='w-4 h-4 text-blue-600' />
                      <span className='font-medium'>
                        Keep as separate document
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Bundle Intelligence Section (Phase 2) */}
            {(editableData.potentialBundles.length > 0 ||
              editableData.suggestedNewBundle) && (
              <div className='space-y-4 p-4 bg-primary/5 rounded-lg border'>
                <div className='flex items-center gap-2'>
                  <Icon name='link' className='w-5 h-5 text-primary' />
                  <h4 className='font-medium text-primary'>
                    Intelligent Document Linking
                  </h4>
                </div>

                {/* Existing Bundle Options */}
                {editableData.potentialBundles.length > 0 && (
                  <div className='space-y-3'>
                    <p className='text-sm text-muted-foreground'>
                      I found existing document bundles that might be related to
                      this document:
                    </p>

                    {editableData.potentialBundles.map(bundle => (
                      <div key={bundle.bundleId} className='space-y-2'>
                        <label className='flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'>
                          <input
                            type='radio'
                            name='bundleAction'
                            value={bundle.bundleId}
                            checked={
                              selectedBundleAction === 'link' &&
                              selectedBundleId === bundle.bundleId
                            }
                            onChange={() => {
                              setSelectedBundleAction('link');
                              setSelectedBundleId(bundle.bundleId);
                            }}
                            className='mt-0.5'
                          />
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                {bundle.bundleName}
                              </span>
                              <Badge variant='outline' className='text-xs'>
                                {bundle.documentCount} documents
                              </Badge>
                              <Badge variant='secondary' className='text-xs'>
                                {bundle.matchScore}% match
                              </Badge>
                            </div>
                            {bundle.primaryEntity && (
                              <p className='text-sm text-muted-foreground'>
                                {bundle.primaryEntity}
                              </p>
                            )}
                            {bundle.matchReasons.length > 0 && (
                              <p className='text-xs text-muted-foreground mt-1'>
                                Match reasons: {bundle.matchReasons.join(', ')}
                              </p>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Bundle Option */}
                {editableData.suggestedNewBundle && (
                  <div className='space-y-3'>
                    {editableData.potentialBundles.length > 0 && (
                      <div className='border-t pt-3'>
                        <p className='text-sm text-muted-foreground mb-3'>
                          Or create a new bundle:
                        </p>
                      </div>
                    )}

                    <label className='flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'>
                      <input
                        type='radio'
                        name='bundleAction'
                        value='new'
                        checked={selectedBundleAction === 'new'}
                        onChange={() => {
                          setSelectedBundleAction('new');
                          setSelectedBundleId(null);
                        }}
                        className='mt-0.5'
                      />
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Icon name='add' className='w-4 h-4 text-primary' />
                          <span className='font-medium'>Create new bundle</span>
                          <Badge variant='outline' className='text-xs'>
                            {(
                              editableData.suggestedNewBundle?.confidence * 100
                            ).toFixed(0)}
                            % confidence
                          </Badge>
                        </div>

                        {selectedBundleAction === 'new' && (
                          <input
                            type='text'
                            value={newBundleName}
                            onChange={e => setNewBundleName(e.target.value)}
                            className='w-full p-2 border rounded-md bg-background text-sm'
                            placeholder='Bundle name'
                          />
                        )}

                        <p className='text-xs text-muted-foreground'>
                          {editableData.suggestedNewBundle.reasoning}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* No Linking Option */}
                <label className='flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer'>
                  <input
                    type='radio'
                    name='bundleAction'
                    value='none'
                    checked={selectedBundleAction === 'none'}
                    onChange={() => {
                      setSelectedBundleAction('none');
                      setSelectedBundleId(null);
                    }}
                  />
                  <div className='flex items-center gap-2'>
                    <Icon name='x' className='w-4 h-4 text-muted-foreground' />
                    <span>Don't link to any bundle</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 mt-6 pt-6 border-t'>
            <Button
              onClick={onCancel}
              variant='outline'
              disabled={isProcessing}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                onConfirm({
                  ...editableData,
                  bundleSelection: {
                    action: selectedBundleAction,
                    bundleId: selectedBundleId,
                    newBundleName:
                      selectedBundleAction === 'new' ? newBundleName : null,
                    suggestedNewBundle: editableData.suggestedNewBundle,
                  },
                  versionSelection: {
                    action: selectedVersionAction,
                    versionId: selectedVersionId,
                    archiveReason:
                      customArchiveReason ||
                      editableData.versioningSuggestion
                        ?.suggestedArchiveReason ||
                      'Replaced by newer version',
                  },
                })
              }
              disabled={isProcessing}
              className='flex-1 gap-2'
            >
              {isProcessing ? (
                <>
                  <Icon name='upload' className='w-4 h-4 animate-pulse' />
                  Saving...
                </>
              ) : (
                <>
                  <Icon name='check' className='w-4 h-4' />
                  Confirm & Save
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </FadeIn>
  );
};
