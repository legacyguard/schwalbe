
import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon, type IconName } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import type { Document } from '@/integrations/supabase/types';
import { adaptDbDocumentToApp } from '@/lib/type-adapters';

interface EnhancedDocumentListProps {
  className?: string;
  documents: Document[];
  onDocumentDelete?: (document: Document) => void;
  onDocumentSelect?: (document: Document) => void;
}

export default function EnhancedDocumentList({
  documents,
  onDocumentSelect,
  onDocumentDelete,
  className,
}: EnhancedDocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'confidence' | 'date' | 'importance' | 'name'
  >('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    const adaptedDocuments = documents.map(adaptDbDocumentToApp);
    const filtered = adaptedDocuments.filter(doc => {
      const matchesSearch =
        !searchQuery ||
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ocr_text?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || doc.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'importance': {
          const aImportance = calculateImportanceScore(a);
          const bImportance = calculateImportanceScore(b);
          return bImportance - aImportance;
        }

        case 'name': {
          const aName = a.title || a.file_name;
          const bName = b.title || b.file_name;
          return aName.localeCompare(bName);
        }

        case 'confidence': {
          const aConfidence = a.ocr_confidence || 0;
          const bConfidence = b.ocr_confidence || 0;
          return bConfidence - aConfidence;
        }

        case 'date':
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return filtered;
  }, [documents, searchQuery, categoryFilter, sortBy]);

  // Calculate importance score for sorting
  const calculateImportanceScore = (doc: Document): number => {
    let score = 0;

    if (doc.is_important) score += 50;
    if (doc.expires_at) {
      const daysUntilExpiry = Math.floor(
        (new Date(doc.expires_at).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 7) score += 40;
      else if (daysUntilExpiry <= 30) score += 30;
      else if (daysUntilExpiry <= 90) score += 20;
    }

    if (doc.classification_confidence) {
      score += doc.classification_confidence * 20;
    }

    return score;
  };

  const getDocumentIcon = (doc: Document): string => {
    if (doc.processing_status === 'completed' && doc.ocr_text)
      return 'sparkles';
    if (doc.category === 'legal') return 'shield';
    if (doc.category === 'financial') return 'financial';
    if (doc.category === 'medical') return 'heart';
    if (doc.category === 'insurance') return 'protection';
    return 'documents';
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.processing_status === 'completed' && doc.ocr_text) {
      return (
        <Badge variant='secondary' className='text-xs'>
          AI Processed
        </Badge>
      );
    }
    if (doc.processing_status === 'processing') {
      return (
        <Badge variant='outline' className='text-xs'>
          Processing...
        </Badge>
      );
    }
    if (doc.processing_status === 'failed') {
      return (
        <Badge variant='destructive' className='text-xs'>
          Processing Failed
        </Badge>
      );
    }
    return null;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpiringSoon = (expiresAt: null | string | undefined): boolean => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiresAt: null | string | undefined): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <Card className='p-6'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Icon
                name='search'
                className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground'
              />
              <Input
                placeholder='Search documents, text content, or metadata...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                <SelectItem value='legal'>Legal</SelectItem>
                <SelectItem value='financial'>Financial</SelectItem>
                <SelectItem value='medical'>Medical</SelectItem>
                <SelectItem value='insurance'>Insurance</SelectItem>
                <SelectItem value='personal'>Personal</SelectItem>
                <SelectItem value='property'>Property</SelectItem>
                <SelectItem value='business'>Business</SelectItem>
                <SelectItem value='government'>Government</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={value =>
                setSortBy(
                  value as 'confidence' | 'date' | 'importance' | 'name'
                )
              }
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='date'>Date Added</SelectItem>
                <SelectItem value='importance'>Importance</SelectItem>
                <SelectItem value='name'>Name</SelectItem>
                <SelectItem value='confidence'>AI Confidence</SelectItem>
              </SelectContent>
            </Select>

            <div className='flex border border-input rounded-md'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='border-0 rounded-r-none'
              >
                <Icon name='grid' className='w-4 h-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='border-0 rounded-l-none'
              >
                <Icon name='list' className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between mt-4'>
          <p className='text-sm text-muted-foreground'>
            {filteredAndSortedDocuments.length} of {documents.length} documents
          </p>
          {searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSearchQuery('')}
              className='text-xs'
            >
              <Icon name='x' className='w-3 h-3 mr-1' />
              Clear search
            </Button>
          )}
        </div>
      </Card>

      {/* Document Grid/List */}
      {filteredAndSortedDocuments.length === 0 ? (
        <Card className='p-12 text-center'>
          <Icon
            name="search"
            className='w-16 h-16 text-muted-foreground mx-auto mb-6'
          />
          <h3 className='text-xl font-semibold mb-4'>No Documents Found</h3>
          <p className='text-muted-foreground mb-6'>
            {searchQuery
              ? `No documents match "${searchQuery}"`
              : 'No documents available. Upload your first document to get started.'}
          </p>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredAndSortedDocuments.map((document, index) => (
            <FadeIn key={document.id} duration={0.3} delay={index * 0.05}>
              {viewMode === 'grid' ? (
                <DocumentCard
                  document={document}
                  onSelect={() => onDocumentSelect?.(document)}
                  onDelete={() => onDocumentDelete?.(document)}
                  getDocumentIcon={getDocumentIcon}
                  getStatusBadge={getStatusBadge}
                  formatFileSize={formatFileSize}
                  isExpiringSoon={isExpiringSoon}
                  isExpired={isExpired}
                />
              ) : (
                <DocumentListItem
                  document={document}
                  onSelect={() => onDocumentSelect?.(document)}
                  onDelete={() => onDocumentDelete?.(document)}
                  getDocumentIcon={getDocumentIcon}
                  getStatusBadge={getStatusBadge}
                  formatFileSize={formatFileSize}
                  isExpiringSoon={isExpiringSoon}
                  isExpired={isExpired}
                />
              )}
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

// Document Card Component (Grid View)
interface DocumentCardProps {
  document: {
    category?: string;
    created_at: string;
    description?: string;
    expires_at?: string;
    file_name: string;
    file_size?: number;
    file_url?: string;
    id: string;
    is_important?: boolean;
    ocr_confidence?: number;
    tags?: string[];
    title?: string;
  };
  formatFileSize: (size?: number) => string;
  getDocumentIcon: (doc: any) => string;
  getStatusBadge: (doc: any) => React.ReactNode;
  isExpired: (expiresAt: null | string | undefined) => boolean;
  isExpiringSoon: (expiresAt: null | string | undefined) => boolean;
  onDelete: () => void;
  onSelect: () => void;
}

function DocumentCard({
  document,
  onSelect,
  onDelete,
  getDocumentIcon,
  getStatusBadge,
  formatFileSize,
  isExpiringSoon,
  isExpired,
}: DocumentCardProps) {
  return (
    <Card className='p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group'>
      <div onClick={() => onSelect()} className='space-y-4'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                document.category === 'legal'
                  ? 'bg-blue-500/10'
                  : document.category === 'financial'
                    ? 'bg-green-500/10'
                    : document.category === 'medical'
                      ? 'bg-red-500/10'
                      : document.category === 'insurance'
                        ? 'bg-purple-500/10'
                        : 'bg-primary/10'
              }`}
            >
              <Icon
                name={getDocumentIcon(document) as IconName}
                className={`w-5 h-5 ${
                  document.category === 'legal'
                    ? 'text-blue-600'
                    : document.category === 'financial'
                      ? 'text-green-600'
                      : document.category === 'medical'
                        ? 'text-red-600'
                        : document.category === 'insurance'
                          ? 'text-purple-600'
                          : 'text-primary'
                }`}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-sm truncate'>
                {document.title || document.file_name}
              </h3>
              {document.category && (
                <p className='text-xs text-muted-foreground capitalize'>
                  {document.category}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {document.is_important && (
              <Badge variant='destructive' className='text-xs'>
                Important
              </Badge>
            )}
            {document.expires_at && isExpired(document.expires_at) && (
              <Badge variant='destructive' className='text-xs'>
                Expired
              </Badge>
            )}
            {document.expires_at &&
              !isExpired(document.expires_at) &&
              isExpiringSoon(document.expires_at) && (
                <Badge
                  variant='outline'
                  className='text-xs border-yellow-500 text-yellow-600'
                >
                  Expires Soon
                </Badge>
              )}
          </div>
        </div>

        {/* Status and Badges */}
        <div className='flex items-center justify-between'>
          {getStatusBadge(document)}
          {document.ocr_confidence && (
            <span className='text-xs text-muted-foreground'>
              {Math.round(document.ocr_confidence * 100)}% confidence
            </span>
          )}
        </div>

        {/* Description */}
        {document.description && (
          <p className='text-sm text-muted-foreground line-clamp-2'>
            {document.description}
          </p>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {document.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant='outline' className='text-xs'>
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant='outline' className='text-xs'>
                +{document.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className='space-y-2 text-xs text-muted-foreground'>
          <div className='flex justify-between'>
            <span>Added:</span>
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
          </div>
          {document.expires_at && (
            <div className='flex justify-between'>
              <span>Expires:</span>
              <span
                className={isExpired(document.expires_at) ? 'text-red-600' : ''}
              >
                {new Date(document.expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {document.file_size && (
            <div className='flex justify-between'>
              <span>Size:</span>
              <span>{formatFileSize(document.file_size)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className='flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity'>
        <Button
          size='sm'
          variant='outline'
          onClick={e => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Icon name='eye' className='w-4 h-4' />
        </Button>
        <Button
          size='sm'
          variant='outline'
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className='hover:bg-destructive/10 hover:text-destructive'
        >
          <Icon name='trash' className='w-4 h-4' />
        </Button>
      </div>
    </Card>
  );
}

// Document List Item Component (List View)
function DocumentListItem({
  document,
  onSelect,
  onDelete,
  getDocumentIcon,
  getStatusBadge,
  formatFileSize,
  isExpiringSoon,
  isExpired,
}: DocumentCardProps) {
  return (
    <Card className='p-4 hover:shadow-md transition-all duration-200 cursor-pointer group'>
      <div onClick={() => onSelect()} className='flex items-center gap-4'>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            document.category === 'legal'
              ? 'bg-blue-500/10'
              : document.category === 'financial'
                ? 'bg-green-500/10'
                : document.category === 'medical'
                  ? 'bg-red-500/10'
                  : document.category === 'insurance'
                    ? 'bg-purple-500/10'
                    : 'bg-primary/10'
          }`}
        >
          <Icon
            name={getDocumentIcon(document) as any}
            className={`w-6 h-6 ${
              document.category === 'legal'
                ? 'text-blue-600'
                : document.category === 'financial'
                  ? 'text-green-600'
                  : document.category === 'medical'
                    ? 'text-red-600'
                    : document.category === 'insurance'
                      ? 'text-purple-600'
                      : 'text-primary'
            }`}
          />
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='font-semibold truncate'>
              {document.title || document.file_name}
            </h3>
            {document.is_important && (
              <Badge variant='destructive' className='text-xs'>
                Important
              </Badge>
            )}
            {document.expires_at && isExpired(document.expires_at) && (
              <Badge variant='destructive' className='text-xs'>
                Expired
              </Badge>
            )}
            {document.expires_at &&
              !isExpired(document.expires_at) &&
              isExpiringSoon(document.expires_at) && (
                <Badge
                  variant='outline'
                  className='text-xs border-yellow-500 text-yellow-600'
                >
                  Expires Soon
                </Badge>
              )}
            {getStatusBadge(document)}
          </div>

          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <span className='capitalize'>{document.category || 'Other'}</span>
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
            {document.file_size && (
              <span>{formatFileSize(document.file_size)}</span>
            )}
            {document.ocr_confidence && (
              <span>
                {Math.round(document.ocr_confidence * 100)}% AI confidence
              </span>
            )}
          </div>

          {document.description && (
            <p className='text-sm text-muted-foreground mt-1 line-clamp-1'>
              {document.description}
            </p>
          )}
        </div>

        <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
          <Button
            size='sm'
            variant='outline'
            onClick={e => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Icon name='eye' className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
            className='hover:bg-destructive/10 hover:text-destructive'
          >
            <Icon name='trash' className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </Card>
  );
}
