
import _React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertTriangle,
  Eye,
  FileText,
  Lock,
  Share2,
  Shield,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FamilyMember } from '@/types/family';
// FamilyPermissions import removed as unused
// familyService import removed as unused

interface Document {
  category: string;
  createdAt: Date;
  emergencyAccess: boolean;
  id: string;
  isEncrypted: boolean;
  name: string;
  owner: string;
  sharedWith: DocumentShare[];
  size: number;
  type: string;
  updatedAt: Date;
}

interface DocumentShare {
  accessLevel: 'edit' | 'emergency_only' | 'view';
  memberId: string;
  permissions: {
    canDownload: boolean;
    canEdit: boolean;
    canView: boolean;
  };
  sharedAt: Date;
}

interface ShareDocumentForm {
  accessLevel: 'edit' | 'emergency_only' | 'view';
  customMessage?: string;
  documentIds: string[];
  expiresAt?: Date;
  includeNotification: boolean;
  memberIds: string[];
}

interface FamilyDocumentSharingProps {
  familyMembers: FamilyMember[];
  userId: string;
}

const documentCategories = {
  will: {
    icon: FileText,
    label: 'Will & Testament',
    color: 'bg-blue-100 text-blue-800',
  },
  trust: {
    icon: Shield,
    label: 'Trust Documents',
    color: 'bg-green-100 text-green-800',
  },
  insurance: {
    icon: Shield,
    label: 'Insurance',
    color: 'bg-purple-100 text-purple-800',
  },
  medical: {
    icon: FileText,
    label: 'Medical Records',
    color: 'bg-red-100 text-red-800',
  },
  financial: {
    icon: FileText,
    label: 'Financial',
    color: 'bg-yellow-100 text-yellow-800',
  },
  identification: {
    icon: FileText,
    label: 'ID Documents',
    color: 'bg-gray-100 text-gray-800',
  },
  other: { icon: FileText, label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

const accessLevelConfig = {
  view: {
    label: 'View Only',
    description: 'Can view documents but cannot edit or download',
    color: 'bg-blue-100 text-blue-800',
    permissions: { canView: true, canEdit: false, canDownload: false },
  },
  edit: {
    label: 'Edit Access',
    description: 'Can view, edit, and download documents',
    color: 'bg-green-100 text-green-800',
    permissions: { canView: true, canEdit: true, canDownload: true },
  },
  emergency_only: {
    label: 'Emergency Only',
    description: 'Access only during verified emergency situations',
    color: 'bg-red-100 text-red-800',
    permissions: { canView: true, canEdit: false, canDownload: true },
  },
};

export function FamilyDocumentSharing({
  userId,
  familyMembers,
}: FamilyDocumentSharingProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareForm, setShareForm] = useState<ShareDocumentForm>({
    documentIds: [],
    memberIds: [],
    accessLevel: 'view',
    includeNotification: true,
  });
  const [filter, setFilter] = useState<
    'all' | 'emergency' | 'private' | 'shared'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      // Mock document data - in real app, this would come from your document service
      const mockDocuments: Document[] = [
        {
          id: 'doc1',
          name: 'Last Will and Testament.pdf',
          type: 'pdf',
          category: 'will',
          size: 245760,
          createdAt: new Date('2023-06-15'),
          updatedAt: new Date('2024-01-10'),
          owner: userId,
          sharedWith: [
            {
              memberId: 'family1',
              permissions: { canView: true, canEdit: false, canDownload: true },
              sharedAt: new Date('2024-01-10'),
              accessLevel: 'view',
            },
          ],
          isEncrypted: true,
          emergencyAccess: true,
        },
        {
          id: 'doc2',
          name: 'Life Insurance Policy.pdf',
          type: 'pdf',
          category: 'insurance',
          size: 1024000,
          createdAt: new Date('2023-08-20'),
          updatedAt: new Date('2024-01-15'),
          owner: userId,
          sharedWith: [],
          isEncrypted: true,
          emergencyAccess: false,
        },
        {
          id: 'doc3',
          name: 'Medical Directives.pdf',
          type: 'pdf',
          category: 'medical',
          size: 512000,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
          owner: userId,
          sharedWith: [
            {
              memberId: 'family2',
              permissions: { canView: true, canEdit: false, canDownload: true },
              sharedAt: new Date('2024-01-05'),
              accessLevel: 'emergency_only',
            },
          ],
          isEncrypted: true,
          emergencyAccess: true,
        },
      ];
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDocuments();
  }, [userId, loadDocuments]);

  const handleShareDocuments = async () => {
    try {
      // In real app, this would call your sharing service
      // console.log('Sharing documents:', shareForm);

      // Mock sharing success
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form and close dialog
      setShareForm({
        documentIds: [],
        memberIds: [],
        accessLevel: 'view',
        includeNotification: true,
      });
      setShowShareDialog(false);

      // Reload documents to show updated sharing status
      loadDocuments();
    } catch (error) {
      console.error('Failed to share documents:', error);
    }
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      // Category filter
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      // Sharing filter
      switch (filter) {
        case 'shared':
          return doc.sharedWith.length > 0;
        case 'private':
          return doc.sharedWith.length === 0;
        case 'emergency':
          return doc.emergencyAccess;
        default:
          return true;
      }
    });
  };

  const getMemberById = (memberId: string) => {
    return familyMembers.find(m => m.id === memberId);
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Family Document Sharing</h2>
          <p className='text-muted-foreground'>
            Securely share documents with your family members
          </p>
        </div>

        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Share2 className='h-4 w-4' />
              Share Documents
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Share Documents</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Select Documents</Label>
                <div className='space-y-2 max-h-32 overflow-y-auto border rounded-md p-2'>
                  {documents.map(doc => (
                    <div key={doc.id} className='flex items-center space-x-2'>
                      <Checkbox
                        id={`doc-${doc.id}`}
                        checked={shareForm.documentIds.includes(doc.id)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setShareForm(prev => ({
                              ...prev,
                              documentIds: [...prev.documentIds, doc.id],
                            }));
                          } else {
                            setShareForm(prev => ({
                              ...prev,
                              documentIds: prev.documentIds.filter(
                                id => id !== doc.id
                              ),
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`doc-${doc.id}`}
                        className='text-sm font-normal flex-1'
                      >
                        {doc.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Select Family Members</Label>
                <div className='space-y-2 max-h-32 overflow-y-auto border rounded-md p-2'>
                  {familyMembers
                    .filter(m => m.status === 'active')
                    .map(member => (
                      <div
                        key={member.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={shareForm.memberIds.includes(member.id)}
                          onCheckedChange={checked => {
                            if (checked) {
                              setShareForm(prev => ({
                                ...prev,
                                memberIds: [...prev.memberIds, member.id],
                              }));
                            } else {
                              setShareForm(prev => ({
                                ...prev,
                                memberIds: prev.memberIds.filter(
                                  id => id !== member.id
                                ),
                              }));
                            }
                          }}
                        />
                        <Avatar className='h-6 w-6'>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className='text-xs'>
                            {member.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Label
                          htmlFor={`member-${member.id}`}
                          className='text-sm font-normal flex-1'
                        >
                          {member.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Access Level</Label>
                <Select
                  value={shareForm.accessLevel}
                  onValueChange={(value: 'edit' | 'emergency_only' | 'view') =>
                    setShareForm(prev => ({ ...prev, accessLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(accessLevelConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className='font-medium'>{config.label}</div>
                          <div className='text-xs text-muted-foreground'>
                            {config.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='notification'
                  checked={shareForm.includeNotification}
                  onCheckedChange={checked =>
                    setShareForm(prev => ({
                      ...prev,
                      includeNotification: !!checked,
                    }))
                  }
                />
                <Label htmlFor='notification' className='text-sm'>
                  Send email notification to family members
                </Label>
              </div>

              <div className='flex items-center justify-end space-x-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setShowShareDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleShareDocuments}
                  disabled={
                    shareForm.documentIds.length === 0 ||
                    shareForm.memberIds.length === 0
                  }
                >
                  Share Documents
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-2'>
        <Select
          value={filter}
          onValueChange={(v: 'all' | 'emergency' | 'private' | 'shared') =>
            setFilter(v)
          }
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Filter by sharing' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Documents</SelectItem>
            <SelectItem value='shared'>Shared</SelectItem>
            <SelectItem value='private'>Private</SelectItem>
            <SelectItem value='emergency'>Emergency Access</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {Object.entries(documentCategories).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className='flex items-center gap-2'>
                  <config.icon className='h-4 w-4' />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <div className='space-y-4'>
        <AnimatePresence>
          {getFilteredDocuments().map((doc, index) => {
            const categoryConfig =
              documentCategories[
                doc.category as keyof typeof documentCategories
              ] || documentCategories.other;

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='hover:shadow-md transition-shadow'>
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-4 flex-1'>
                        <div className='p-2 rounded-lg bg-gray-50'>
                          <categoryConfig.icon className='h-6 w-6 text-gray-600' />
                        </div>

                        <div className='flex-1 space-y-2'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-semibold'>{doc.name}</h3>
                            <Badge
                              className={categoryConfig.color}
                              variant='outline'
                            >
                              {categoryConfig.label}
                            </Badge>
                            {doc.isEncrypted && (
                              <Badge variant='secondary' className='gap-1'>
                                <Lock className='h-3 w-3' />
                                Encrypted
                              </Badge>
                            )}
                            {doc.emergencyAccess && (
                              <Badge variant='destructive' className='gap-1'>
                                <AlertTriangle className='h-3 w-3' />
                                Emergency Access
                              </Badge>
                            )}
                          </div>

                          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>
                              Modified {doc.updatedAt.toLocaleDateString()}
                            </span>
                            <span className='flex items-center gap-1'>
                              <Users className='h-3 w-3' />
                              Shared with {doc.sharedWith.length} members
                            </span>
                          </div>

                          {/* Shared Members */}
                          {doc.sharedWith.length > 0 && (
                            <div className='space-y-2'>
                              <h4 className='text-sm font-medium text-muted-foreground'>
                                Shared with:
                              </h4>
                              <div className='flex flex-wrap gap-2'>
                                {doc.sharedWith.map(share => {
                                  const member = getMemberById(share.memberId);
                                  const accessConfig =
                                    accessLevelConfig[share.accessLevel];

                                  if (!member) return null;

                                  return (
                                    <div
                                      key={share.memberId}
                                      className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg'
                                    >
                                      <Avatar className='h-6 w-6'>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback className='text-xs'>
                                          {member.name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className='text-sm font-medium'>
                                        {member.name}
                                      </span>
                                      <Badge
                                        className={accessConfig.color}
                                        variant='outline'
                                      >
                                        {accessConfig.label}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {doc.sharedWith.length === 0 && (
                            <Alert>
                              <Lock className='h-4 w-4' />
                              <AlertDescription>
                                This document is private and not shared with any
                                family members.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Button variant='outline' size='sm' className='gap-2'>
                          <Eye className='h-4 w-4' />
                          View
                        </Button>
                        <Button variant='outline' size='sm' className='gap-2'>
                          <Share2 className='h-4 w-4' />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {getFilteredDocuments().length === 0 && (
          <div className='text-center py-12'>
            <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50' />
            <h3 className='text-lg font-medium mb-2'>No documents found</h3>
            <p className='text-muted-foreground mb-4'>
              {filter === 'all' && selectedCategory === 'all'
                ? 'Upload your first document to start sharing with family members.'
                : 'No documents match the current filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
