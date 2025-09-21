
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import {
  Calendar,
  Camera,
  Crown,
  Download,
  Eye,
  FileText,
  Globe,
  Heart,
  Search,
  Share2,
  Shield,
  Upload,
} from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { motion } from 'framer-motion';

export interface GenerationalDocument {
  filePath: string;
  generation: number;
  id: string;
  lastModified: string;
  metadata: {
    category: string;
    description?: string;
    expiryDate?: string;
    importance: 'critical' | 'high' | 'low' | 'medium';
    legalStatus?: 'active' | 'archived' | 'draft' | 'superseded';
    relatedMembers: string[];
    tags: string[];
  };
  name: string;
  originalUploader: string;
  permissions: {
    canDownload: string[];
    canEdit: string[];
    canShare: string[];
    canView: string[];
    inheritanceRules: {
      ageRestriction?: number;
      autoShareOnBirth?: boolean;
      autoShareOnDeath?: boolean;
      autoShareOnMarriage?: boolean;
    };
  };
  sharingHistory: Array<{
    action: 'downloaded' | 'edited' | 'shared' | 'viewed';
    details?: string;
    id: string;
    timestamp: string;
    userId: string;
  }>;
  size: number;
  type:
    | 'audio'
    | 'certificate'
    | 'financial'
    | 'letter'
    | 'medical'
    | 'photo'
    | 'property'
    | 'story'
    | 'video'
    | 'will';
  uploadDate: string;
  versions: Array<{
    changes: string;
    filePath: string;
    id: string;
    uploadDate: string;
    uploader: string;
    version: number;
  }>;
}

export interface FamilyMember {
  birthDate?: string;
  email?: string;
  generation: number;
  id: string;
  name: string;
  relationship: string;
  roles: string[];
  status: 'active' | 'declined' | 'invited';
}

interface MultiGenerationalDocumentSharingProps {
  currentUserId: string;
  documents: GenerationalDocument[];
  familyMembers: FamilyMember[];
  onDownloadDocument?: (docId: string) => void;
  onShareDocument?: (
    docId: string,
    memberIds: string[],
    permissions: string[]
  ) => void;
  onUpdatePermissions?: (
    docId: string,
    permissions: GenerationalDocument['permissions']
  ) => void;
  onUploadDocument?: (
    file: File,
    metadata: Partial<GenerationalDocument['metadata']>
  ) => void;
  onViewDocument?: (docId: string) => void;
}

export const MultiGenerationalDocumentSharing: React.FC<
  MultiGenerationalDocumentSharingProps
> = ({
  documents,
  familyMembers,
  currentUserId,
  onShareDocument,
  onUpdatePermissions: _onUpdatePermissions,
  onDownloadDocument,
  onViewDocument,
  onUploadDocument: _onUploadDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<GenerationalDocument | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGeneration, setFilterGeneration] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>(
    'grid'
  );

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    const filtered = documents.filter(doc => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.metadata.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        doc.metadata.tags.some(tag =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesGeneration =
        filterGeneration === 'all' ||
        doc.generation.toString() === filterGeneration;
      const matchesType = filterType === 'all' || doc.type === filterType;

      return matchesSearch && matchesGeneration && matchesType;
    });

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          );
        case 'name':
          return a.name.localeCompare(b.name);
        case 'importance': {
          const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (
            importanceOrder[b.metadata.importance] -
            importanceOrder[a.metadata.importance]
          );
        }
        case 'generation':
          return a.generation - b.generation;
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, filterGeneration, filterType, sortBy]);

  // Get documents by generation for timeline view
  const documentsByGeneration = useMemo(() => {
    const generations = new Map<number, GenerationalDocument[]>();
    filteredAndSortedDocuments.forEach(doc => {
      if (!generations.has(doc.generation)) {
        generations.set(doc.generation, []);
      }
      const genMembers = generations.get(doc.generation);
      if (genMembers) {
        genMembers.push(doc);
      }
    });
    return generations;
  }, [filteredAndSortedDocuments]);

  // Get unique generations and document types
  const generations = useMemo(
    () =>
      Array.from(new Set(documents.map(doc => doc.generation))).sort(
        (a, b) => a - b
      ),
    [documents]
  );

  const documentTypes = useMemo(
    () => Array.from(new Set(documents.map(doc => doc.type))),
    [documents]
  );

  // Check if user can perform action on document
  const canPerformAction = (
    doc: GenerationalDocument,
    action: 'download' | 'edit' | 'share' | 'view'
  ) => {
    switch (action) {
      case 'view':
        return (
          doc.permissions.canView.includes(currentUserId) ||
          doc.originalUploader === currentUserId
        );
      case 'edit':
        return (
          doc.permissions.canEdit.includes(currentUserId) ||
          doc.originalUploader === currentUserId
        );
      case 'share':
        return (
          doc.permissions.canShare.includes(currentUserId) ||
          doc.originalUploader === currentUserId
        );
      case 'download':
        return (
          doc.permissions.canDownload.includes(currentUserId) ||
          doc.originalUploader === currentUserId
        );
      default:
        return false;
    }
  };

  // Get generation label
  const getGenerationLabel = (generation: number) => {
    if (generation === 0) return 'Current Generation';
    if (generation > 0)
      return `${generation} Generation${generation > 1 ? 's' : ''} Down`;
    return `${Math.abs(generation)} Generation${Math.abs(generation) > 1 ? 's' : ''} Up`;
  };

  // Get document type icon
  const getDocumentIcon = (type: string) => {
    const icons = {
      will: Crown,
      photo: Camera,
      letter: Heart,
      certificate: Shield,
      medical: FileText,
      financial: FileText,
      property: FileText,
      story: FileText,
      video: FileText,
      audio: FileText,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  // Handle share document
  const handleShareDocument = () => {
    if (
      selectedDoc &&
      selectedMembers.length > 0 &&
      selectedPermissions.length > 0
    ) {
      onShareDocument?.(selectedDoc.id, selectedMembers, selectedPermissions);
      setShowShareDialog(false);
      setSelectedMembers([]);
      setSelectedPermissions([]);
    }
  };

  const DocumentCard = ({ doc }: { doc: GenerationalDocument }) => {
    const IconComponent = getDocumentIcon(doc.type);
    const canView = canPerformAction(doc, 'view');
    const canShare = canPerformAction(doc, 'share');
    const canDownload = canPerformAction(doc, 'download');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='group'
      >
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''
          } ${!canView ? 'opacity-60' : ''}`}
        >
          <CardHeader className='pb-3'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2'>
                <IconComponent className='h-5 w-5 text-gray-600' />
                <div>
                  <CardTitle className='text-sm font-medium truncate'>
                    {doc.name}
                  </CardTitle>
                  <p className='text-xs text-gray-500'>
                    {getGenerationLabel(doc.generation)}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  doc.metadata.importance === 'critical'
                    ? 'destructive'
                    : 'secondary'
                }
                className='text-xs'
              >
                {doc.metadata.importance}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            <div className='space-y-3'>
              {doc.metadata.description && (
                <p className='text-xs text-gray-600 line-clamp-2'>
                  {doc.metadata.description}
                </p>
              )}

              <div className='flex items-center gap-2 text-xs text-gray-500'>
                <Calendar className='h-3 w-3' />
                {new Date(doc.uploadDate).toLocaleDateString()}
              </div>

              {doc.metadata.tags.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {doc.metadata.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant='outline' className='text-xs px-1'>
                      {tag}
                    </Badge>
                  ))}
                  {doc.metadata.tags.length > 3 && (
                    <Badge variant='outline' className='text-xs px-1'>
                      +{doc.metadata.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className='flex items-center gap-2'>
                <div className='flex -space-x-1'>
                  {doc.permissions.canView.slice(0, 3).map(memberId => {
                    const member = familyMembers.find(m => m.id === memberId);
                    return member ? (
                      <div
                        key={memberId}
                        className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white'
                        title={member.name}
                      >
                        {member.name.charAt(0)}
                      </div>
                    ) : null;
                  })}
                  {doc.permissions.canView.length > 3 && (
                    <div className='w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white'>
                      +{doc.permissions.canView.length - 3}
                    </div>
                  )}
                </div>

                <div className='flex gap-1 ml-auto'>
                  {canView && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() => onViewDocument?.(doc.id)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  )}

                  {canShare && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowShareDialog(true);
                      }}
                    >
                      <Share2 className='h-4 w-4' />
                    </Button>
                  )}

                  {canDownload && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() => onDownloadDocument?.(doc.id)}
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const TimelineView = () => {
    const sortedGenerations = Array.from(documentsByGeneration.keys()).sort(
      (a, b) => a - b
    );

    return (
      <div className='space-y-8'>
        {sortedGenerations.map(generation => {
          const docs = documentsByGeneration.get(generation) || [];
          return (
            <div key={generation} className='relative'>
              <div className='sticky top-0 bg-white z-10 py-2 border-b'>
                <h3 className='text-lg font-semibold'>
                  {getGenerationLabel(generation)}
                </h3>
                <p className='text-sm text-gray-600'>
                  {docs.length} document{docs.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4'>
                {docs.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold flex items-center gap-2'>
            <Globe className='h-6 w-6' />
            Multi-Generational Documents
          </h2>
          <p className='text-gray-600'>
            Manage and share family documents across generations
          </p>
        </div>

        <Button>
          <Upload className='h-4 w-4 mr-2' />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-wrap gap-4 items-center'>
        <div className='flex-1 min-w-64'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search documents...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        <Select value={filterGeneration} onValueChange={setFilterGeneration}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by generation' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Generations</SelectItem>
            {generations.map(gen => (
              <SelectItem key={gen} value={gen.toString()}>
                {getGenerationLabel(gen)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Types</SelectItem>
            {documentTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='date'>Upload Date</SelectItem>
            <SelectItem value='name'>Name</SelectItem>
            <SelectItem value='importance'>Importance</SelectItem>
            <SelectItem value='generation'>Generation</SelectItem>
          </SelectContent>
        </Select>

        <div className='flex border rounded-lg'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
        </div>
      </div>

      {/* Documents Display */}
      <div className='min-h-96'>
        {filteredAndSortedDocuments.length === 0 ? (
          <div className='text-center py-12'>
            <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No documents found
            </h3>
            <p className='text-gray-600'>
              {searchQuery || filterGeneration !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'timeline' && <TimelineView />}

            {viewMode === 'grid' && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredAndSortedDocuments.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className='space-y-4'>
                {filteredAndSortedDocuments.map(doc => (
                  <Card key={doc.id} className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2'>
                          {React.createElement(getDocumentIcon(doc.type), {
                            className: 'h-5 w-5 text-gray-600',
                          })}
                          <div>
                            <h4 className='font-medium'>{doc.name}</h4>
                            <p className='text-sm text-gray-600'>
                              {getGenerationLabel(doc.generation)} •{' '}
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant='secondary'>
                          {doc.metadata.importance}
                        </Badge>
                      </div>

                      <div className='flex items-center gap-2'>
                        {canPerformAction(doc, 'view') && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => onViewDocument?.(doc.id)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                        )}
                        {canPerformAction(doc, 'share') && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowShareDialog(true);
                            }}
                          >
                            <Share2 className='h-4 w-4' />
                          </Button>
                        )}
                        {canPerformAction(doc, 'download') && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => onDownloadDocument?.(doc.id)}
                          >
                            <Download className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Document Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>

          {selectedDoc && (
            <div className='space-y-6'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-medium'>{selectedDoc.name}</h4>
                <p className='text-sm text-gray-600'>
                  {selectedDoc.metadata.description}
                </p>
              </div>

              <div>
                <h4 className='font-medium mb-3'>Select Family Members</h4>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {familyMembers.map(member => (
                    <div
                      key={member.id}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={member.id}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setSelectedMembers(prev => [...prev, member.id]);
                          } else {
                            setSelectedMembers(prev =>
                              prev.filter(id => id !== member.id)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={member.id}
                        className='flex-1 cursor-pointer'
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='font-medium'>{member.name}</p>
                            <p className='text-sm text-gray-600'>
                              {member.relationship} •{' '}
                              {getGenerationLabel(member.generation)}
                            </p>
                          </div>
                          <Badge variant='outline'>{member.status}</Badge>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className='font-medium mb-3'>Permissions</h4>
                <div className='space-y-2'>
                  {['view', 'download', 'share'].map(permission => (
                    <div
                      key={permission}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={permission}
                        checked={selectedPermissions.includes(permission)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setSelectedPermissions(prev => [
                              ...prev,
                              permission,
                            ]);
                          } else {
                            setSelectedPermissions(prev =>
                              prev.filter(p => p !== permission)
                            );
                          }
                        }}
                      />
                      <label htmlFor={permission} className='capitalize'>
                        Can {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowShareDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleShareDocument}
                  disabled={
                    selectedMembers.length === 0 ||
                    selectedPermissions.length === 0
                  }
                >
                  Share Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiGenerationalDocumentSharing;
