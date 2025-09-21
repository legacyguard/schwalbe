
import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';
import {
  type ComparisonReport,
  type TemplateCategory,
  type UserProfile,
  type WillTemplate,
  willTemplateLibrary,
} from '@/lib/will-template-library';
import type { WillData } from './WillWizard';

interface WillTemplateLibraryProps {
  className?: string;
  currentWillData?: WillData;
  onComparisonComplete?: (report: ComparisonReport) => void;
  onTemplateSelect: (template: WillTemplate) => void;
  userProfile?: Partial<UserProfile>;
}

export const WillTemplateLibrary: React.FC<WillTemplateLibraryProps> = ({
  currentWillData,
  userProfile = {},
  onTemplateSelect,
  onComparisonComplete,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | TemplateCategory
  >('all');
  const [selectedTemplate, setSelectedTemplate] = useState<null | WillTemplate>(
    null
  );
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState('recommended');

  // Get templates based on user profile
  const recommendedTemplates = useMemo(() => {
    return willTemplateLibrary.getTemplatesForSituation(userProfile);
  }, [userProfile]);

  // Get all templates filtered by search and category
  const filteredTemplates = useMemo(() => {
    let templates = searchQuery
      ? willTemplateLibrary.searchTemplates(searchQuery)
      : willTemplateLibrary
          .getAvailableCategories()
          .flatMap(cat =>
            willTemplateLibrary.getTemplatesByCategory(cat.category)
          );

    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }

    return templates.sort((a, b) => b.popularityScore - a.popularityScore);
  }, [searchQuery, selectedCategory]);

  // Get available categories
  const categories = useMemo(() => {
    return willTemplateLibrary.getAvailableCategories();
  }, []);

  const handleTemplatePreview = (template: WillTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTemplateApply = (template: WillTemplate) => {
    if (currentWillData && Object.keys(currentWillData).length > 0) {
      // Show comparison if user has existing data
      setShowComparison(true);
    } else {
      // Apply directly if no existing data
      onTemplateSelect(template);
      toast.success(`Applied template: ${template.name}`);
    }
  };

  const handleCompareAndApply = (template: WillTemplate) => {
    if (!currentWillData) return;

    try {
      const comparison = willTemplateLibrary.compareWillVersions(
        currentWillData,
        willTemplateLibrary.applyTemplate(template.id, currentWillData)
      );

      if (onComparisonComplete) {
        onComparisonComplete(comparison);
      }

      onTemplateSelect(template);
      toast.success(`Template applied with comparison analysis`);
    } catch (error) {
      toast.error('Failed to apply template');
      console.error(error);
    }
  };

  const getCategoryIcon = (category: TemplateCategory): string => {
    switch (category) {
      case 'young_professional':
        return 'briefcase';
      case 'new_parent':
        return 'baby';
      case 'established_family':
        return 'home';
      case 'blended_family':
        return 'users';
      case 'business_owner':
        return 'building-office';
      case 'retiree':
        return 'user-check';
      case 'single_parent':
        return 'user';
      case 'childless_couple':
        return 'heart';
      case 'charitable_focused':
        return 'gift';
      case 'international':
        return 'globe';
      case 'special_needs':
        return 'heart-handshake';
      default:
        return 'document';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className='text-lg font-semibold mb-2'>Will Template Library</h3>
        <p className='text-sm text-muted-foreground'>
          Choose from professionally crafted templates designed for different
          life situations
        </p>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <Input
            placeholder='Search templates...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full'
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={value =>
            setSelectedCategory(value as 'all' | TemplateCategory)
          }
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map(
              ({ category, count, description: _description }) => (
                <SelectItem key={category} value={category}>
                  {category.replace('_', ' ')} ({count})
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Template Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='recommended'>
            Recommended ({recommendedTemplates.length})
          </TabsTrigger>
          <TabsTrigger value='all'>
            Browse All ({filteredTemplates.length})
          </TabsTrigger>
          <TabsTrigger value='categories'>By Category</TabsTrigger>
        </TabsList>

        <TabsContent value='recommended' className='space-y-4 mt-6'>
          {recommendedTemplates.length > 0 ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {recommendedTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isRecommended={true}
                  onPreview={() => handleTemplatePreview(template)}
                  onApply={() => handleTemplateApply(template)}
                />
              ))}
            </div>
          ) : (
            <Card className='p-8 text-center'>
              <Icon
                name="search"
                className='w-12 h-12 text-muted-foreground mx-auto mb-4'
              />
              <h4 className='font-semibold mb-2'>No Recommended Templates</h4>
              <p className='text-sm text-muted-foreground mb-4'>
                We need more information about your situation to provide
                personalized recommendations.
              </p>
              <Button variant='outline' onClick={() => setActiveTab('all')}>
                Browse All Templates
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='all' className='space-y-4 mt-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => handleTemplatePreview(template)}
                onApply={() => handleTemplateApply(template)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value='categories' className='space-y-6 mt-6'>
          {categories.map(({ category, count, description }) => (
            <div key={category} className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Icon
                  name={getCategoryIcon(category) as any}
                  className='w-5 h-5 text-primary'
                />
                <h4 className='font-semibold capitalize'>
                  {category.replace('_', ' ')}
                </h4>
                <Badge variant='secondary' className='text-xs'>
                  {count} template{count !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground ml-8'>
                {description}
              </p>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 ml-8'>
                {willTemplateLibrary
                  .getTemplatesByCategory(category)
                  .map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      compact={true}
                      onPreview={() => handleTemplatePreview(template)}
                      onApply={() => handleTemplateApply(template)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog
        open={selectedTemplate !== null}
        onOpenChange={() => setSelectedTemplate(null)}
      >
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-3'>
                  <Icon
                    name={getCategoryIcon(selectedTemplate.category) as any}
                    className='w-6 h-6 text-primary'
                  />
                  {selectedTemplate.name}
                </DialogTitle>
              </DialogHeader>
              <TemplatePreview
                template={selectedTemplate}
                onApply={() => {
                  handleTemplateApply(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                onClose={() => setSelectedTemplate(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Apply Template?</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='p-4 border rounded-lg bg-yellow-50 border-yellow-200'>
              <div className='flex items-start gap-3'>
                <Icon
                  name="alert-triangle"
                  className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5'
                />
                <div>
                  <h4 className='font-medium text-yellow-900'>
                    Existing Will Data Found
                  </h4>
                  <p className='text-sm text-yellow-800 mt-1'>
                    You have existing will information. Applying this template
                    will modify your current data. We'll show you exactly what
                    changes before finalizing.
                  </p>
                </div>
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowComparison(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedTemplate) {
                    handleCompareAndApply(selectedTemplate);
                  }
                  setShowComparison(false);
                }}
              >
                Continue with Comparison
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  compact?: boolean;
  isRecommended?: boolean;
  onApply: () => void;
  onPreview: () => void;
  template: WillTemplate;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isRecommended = false,
  compact = false,
  onPreview,
  onApply,
}) => {
  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow ${isRecommended ? 'border-primary/50 bg-primary/5' : ''}`}
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-start gap-3'>
          <Icon
            name={
              template.category === 'young_professional'
                ? 'briefcase'
                : 'document'
            }
            className='w-5 h-5 text-primary flex-shrink-0 mt-1'
          />
          <div className='flex-1 min-w-0'>
            <h4 className='font-semibold mb-1'>{template.name}</h4>
            {!compact && (
              <p className='text-sm text-muted-foreground line-clamp-2'>
                {template.description}
              </p>
            )}
          </div>
        </div>
        {isRecommended && (
          <Badge variant='default' className='text-xs'>
            Recommended
          </Badge>
        )}
      </div>

      <div className='flex items-center gap-2 mb-3'>
        <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
          {template.complexity}
        </Badge>
        <Badge variant='outline' className='text-xs'>
          {template.estimatedCompletionTime}min
        </Badge>
        <Badge variant='outline' className='text-xs'>
          ⭐ {template.popularityScore}
        </Badge>
      </div>

      {!compact && (
        <div className='space-y-3 mb-4'>
          <div>
            <h5 className='text-xs font-medium text-muted-foreground mb-1'>
              Key Features
            </h5>
            <div className='flex flex-wrap gap-1'>
              {template.preview.keyFeatures
                .slice(0, 3)
                .map((feature, index) => (
                  <Badge key={index} variant='secondary' className='text-xs'>
                    {feature}
                  </Badge>
                ))}
            </div>
          </div>

          <div className='text-xs text-muted-foreground'>
            <span>{template.preview.beneficiaryCount} beneficiaries</span>
            <span className='mx-2'>•</span>
            <span>{template.jurisdiction}</span>
          </div>
        </div>
      )}

      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onPreview}
          className='flex-1'
        >
          <Icon name="eye" className='w-3 h-3 mr-2' />
          Preview
        </Button>
        <Button size='sm' onClick={onApply} className='flex-1'>
          <Icon name="check" className='w-3 h-3 mr-2' />
          Use Template
        </Button>
      </div>
    </Card>
  );
};

// Template Preview Component
interface TemplatePreviewProps {
  onApply: () => void;
  onClose: () => void;
  template: WillTemplate;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onApply,
  onClose,
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState('overview');

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Badge className={`${getComplexityColor(template.complexity)}`}>
            {template.complexity}
          </Badge>
          <Badge variant='outline'>
            {template.estimatedCompletionTime} minutes
          </Badge>
          <Badge variant='outline'>⭐ {template.popularityScore}</Badge>
        </div>
      </div>

      <Tabs value={activePreviewTab} onValueChange={setActivePreviewTab}>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='structure'>Structure</TabsTrigger>
          <TabsTrigger value='requirements'>Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div>
            <h4 className='font-semibold mb-2'>Description</h4>
            <p className='text-sm text-muted-foreground'>
              {template.description}
            </p>
          </div>

          <div>
            <h4 className='font-semibold mb-2'>Target Profile</h4>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='font-medium'>Marital Status:</span>
                <span className='ml-2 capitalize'>
                  {template.targetProfile.maritalStatus}
                </span>
              </div>
              <div>
                <span className='font-medium'>Has Children:</span>
                <span className='ml-2'>
                  {template.targetProfile.hasChildren ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className='font-medium'>Age Range:</span>
                <span className='ml-2'>{template.targetProfile.ageRange}</span>
              </div>
              <div>
                <span className='font-medium'>Net Worth:</span>
                <span className='ml-2 capitalize'>
                  {template.targetProfile.estimatedNetWorth}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className='font-semibold mb-2'>Key Features</h4>
            <div className='flex flex-wrap gap-2'>
              {template.preview.keyFeatures.map((feature, index) => (
                <Badge key={index} variant='secondary'>
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='structure' className='space-y-4'>
          <div>
            <h4 className='font-semibold mb-2'>Will Structure</h4>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center justify-between p-2 bg-muted/50 rounded'>
                <span>Beneficiaries</span>
                <Badge variant='outline'>
                  {template.preview.beneficiaryCount}
                </Badge>
              </div>
              <div className='flex items-center justify-between p-2 bg-muted/50 rounded'>
                <span>Asset Types</span>
                <div className='flex gap-1'>
                  {template.preview.assetTypes.map((type, index) => (
                    <Badge key={index} variant='outline' className='text-xs'>
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className='flex items-center justify-between p-2 bg-muted/50 rounded'>
                <span>Complexity</span>
                <Badge className={getComplexityColor(template.complexity)}>
                  {template.complexity}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className='font-semibold mb-2'>Sample Preview</h4>
            <div className='p-3 bg-muted/50 rounded text-sm font-mono'>
              {template.preview.summaryText}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='requirements' className='space-y-4'>
          <div>
            <h4 className='font-semibold mb-2'>Required Information</h4>
            <div className='space-y-2'>
              {template.requiredFields.map((field, index) => (
                <div key={index} className='flex items-center gap-2 text-sm'>
                  <Icon
                    name="check-circle"
                    className='w-4 h-4 text-green-600'
                  />
                  <span>{field.replace('_', ' ').replace('.', ' → ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className='font-semibold mb-2'>Optional Enhancements</h4>
            <div className='space-y-2'>
              {template.optionalEnhancements.map((enhancement, index) => (
                <div key={index} className='flex items-center gap-2 text-sm'>
                  <Icon
                    name="plus-circle"
                    className='w-4 h-4 text-blue-600'
                  />
                  <span>{enhancement.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {template.legalNotices.length > 0 && (
            <div>
              <h4 className='font-semibold mb-2'>Legal Notices</h4>
              <div className='space-y-2'>
                {template.legalNotices.map((notice, index) => (
                  <div key={index} className='flex items-start gap-2 text-sm'>
                    <Icon
                      name="info"
                      className='w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5'
                    />
                    <span className='text-muted-foreground'>{notice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className='flex justify-end gap-2 pt-4 border-t'>
        <Button variant='outline' onClick={onClose}>
          Close
        </Button>
        <Button onClick={onApply}>
          <Icon name="check" className='w-4 h-4 mr-2' />
          Use This Template
        </Button>
      </div>
    </div>
  );
};

// Helper function moved outside component
function getComplexityColor(complexity: WillTemplate['complexity']): string {
  switch (complexity) {
    case 'simple':
      return 'text-green-600 bg-green-100';
    case 'moderate':
      return 'text-yellow-600 bg-yellow-100';
    case 'complex':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
