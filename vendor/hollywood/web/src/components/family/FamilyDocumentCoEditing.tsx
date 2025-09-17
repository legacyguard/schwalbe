
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
// Tabs components import removed as unused

import {
  Activity,
  Check,
  Clock,
  Eye,
  EyeOff,
  FileText,
  History,
  Lock,
  MessageSquare,
  Plus,
  Save,
  Unlock,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface FamilyMember {
  avatar?: string;
  color: string;
  email: string;
  id: string;
  isOnline: boolean;
  lastSeen?: Date;
  name: string;
  role: 'commenter' | 'editor' | 'owner' | 'viewer';
}

interface DocumentEdit {
  content: string;
  id: string;
  length?: number;
  position: number;
  previousContent?: string;
  timestamp: Date;
  type: 'delete' | 'format' | 'insert' | 'replace';
  userId: string;
  userName: string;
}

interface Comment {
  content: string;
  id: string;
  isResolved: boolean;
  position: number;
  replies: CommentReply[];
  timestamp: Date;
  userAvatar?: string;
  userId: string;
  userName: string;
}

interface CommentReply {
  content: string;
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

interface DocumentVersion {
  authorId: string;
  authorName: string;
  changes: DocumentEdit[];
  comment?: string;
  content: string;
  id: string;
  timestamp: Date;
}

interface SharedDocument {
  collaborators: FamilyMember[];
  comments: Comment[];
  content: string;
  id: string;
  isLocked: boolean;
  lastModified: Date;
  lockedBy?: string;
  ownerId: string;
  permissions: {
    allowComments: boolean;
    allowEditing: boolean;
    requireApproval: boolean;
  };
  status: 'approved' | 'draft' | 'final' | 'review';
  title: string;
  type: 'instructions' | 'letter' | 'other' | 'story' | 'will';
  versions: DocumentVersion[];
}

interface Cursor {
  color: string;
  position: number;
  selection?: {
    end: number;
    start: number;
  };
  userId: string;
  userName: string;
}

interface FamilyDocumentCoEditingProps {
  existingDocuments?: SharedDocument[];
  familyMembers?: FamilyMember[];
  onDocumentCreated?: (document: SharedDocument) => void;
}

export const FamilyDocumentCoEditing: React.FC<
  FamilyDocumentCoEditingProps
> = ({ familyMembers = [], onDocumentCreated, existingDocuments = [] }) => {
  const { t } = useTranslation('ui/family-document-coediting');
  const [documents, setDocuments] =
    useState<SharedDocument[]>(existingDocuments);
  const [activeDocument, setActiveDocument] = useState<null | SharedDocument>(
    null
  );
  const [_isEditing, setIsEditing] = useState(false);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [_comments, _setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [_selectedText, _setSelectedText] = useState<null | {
    end: number;
    start: number;
  }>(null);
  const [currentUserId] = useState('current-user-id');
  const [isCreating, setIsCreating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editHistory, setEditHistory] = useState<DocumentEdit[]>([]);

  // Mock current user
  const currentUser: FamilyMember = {
    id: currentUserId,
    name: 'You',
    email: 'user@example.com',
    role: 'owner',
    isOnline: true,
    color: '#3B82F6',
  };

  const collaborators = [currentUser, ...familyMembers];

  // Simulate real-time cursors
  useEffect(() => {
    if (!activeDocument) return;

    const interval = setInterval(() => {
      const activeCursors = activeDocument.collaborators
        .filter(member => member.isOnline && member.id !== currentUserId)
        .map(member => ({
          userId: member.id,
          userName: member.name,
          color: member.color,
          position: Math.floor(
            Math.random() * (activeDocument.content?.length || 100)
          ),
        }));

      setCursors(activeCursors);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeDocument, currentUserId]);

  const createNewDocument = () => {
    const newDocument: SharedDocument = {
      id: `doc-${Date.now()}`,
      title: t('sidebar.newDocument'),
      content: '',
      type: 'other',
      ownerId: currentUserId,
      collaborators: [currentUser],
      isLocked: false,
      lastModified: new Date(),
      versions: [],
      comments: [],
      status: 'draft',
      permissions: {
        allowComments: true,
        allowEditing: true,
        requireApproval: false,
      },
    };

    setActiveDocument(newDocument);
    setIsCreating(true);
    setIsEditing(true);
  };

  const saveDocument = () => {
    if (!activeDocument) return;

    const version: DocumentVersion = {
      id: `version-${Date.now()}`,
      content: activeDocument.content,
      timestamp: new Date(),
      authorId: currentUserId,
      authorName: currentUser.name,
      changes: editHistory,
      comment: 'Auto-saved',
    };

    const updatedDocument = {
      ...activeDocument,
      lastModified: new Date(),
      versions: [...activeDocument.versions, version],
    };

    const existingIndex = documents.findIndex(d => d.id === activeDocument.id);
    if (existingIndex >= 0) {
      const updatedDocuments = [...documents];
      updatedDocuments[existingIndex] = updatedDocument;
      setDocuments(updatedDocuments);
    } else {
      setDocuments([...documents, updatedDocument]);
    }

    setActiveDocument(updatedDocument);
    onDocumentCreated?.(updatedDocument);
    setEditHistory([]);
    setIsCreating(false);
  };

  const handleContentChange = (newContent: string) => {
    if (!activeDocument) return;

    const edit: DocumentEdit = {
      id: `edit-${Date.now()}`,
      userId: currentUserId,
      userName: currentUser.name,
      timestamp: new Date(),
      type: 'replace',
      position: 0,
      content: newContent,
      previousContent: activeDocument.content,
    };

    setEditHistory([...editHistory, edit]);
    setActiveDocument({
      ...activeDocument,
      content: newContent,
      lastModified: new Date(),
    });
  };

  const addCollaborator = (memberId: string) => {
    if (!activeDocument) return;

    const member = collaborators.find(m => m.id === memberId);
    if (!member || activeDocument.collaborators.find(c => c.id === memberId))
      return;

    setActiveDocument({
      ...activeDocument,
      collaborators: [...activeDocument.collaborators, member],
    });
  };

  const updateCollaboratorRole = (
    memberId: string,
    newRole: FamilyMember['role']
  ) => {
    if (!activeDocument) return;

    setActiveDocument({
      ...activeDocument,
      collaborators: activeDocument.collaborators.map(c =>
        c.id === memberId ? { ...c, role: newRole } : c
      ),
    });
  };

  const addComment = (content: string, position: number) => {
    if (!activeDocument || !content.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUserId,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      timestamp: new Date(),
      position,
      isResolved: false,
      replies: [],
    };

    setActiveDocument({
      ...activeDocument,
      comments: [...activeDocument.comments, comment],
    });
  };

  const resolveComment = (commentId: string) => {
    if (!activeDocument) return;

    setActiveDocument({
      ...activeDocument,
      comments: activeDocument.comments.map(c =>
        c.id === commentId ? { ...c, isResolved: true } : c
      ),
    });
  };

  const lockDocument = () => {
    if (!activeDocument) return;

    setActiveDocument({
      ...activeDocument,
      isLocked: !activeDocument.isLocked,
      lockedBy: !activeDocument.isLocked ? currentUserId : undefined,
    });
  };

  const getStatusColor = (status: SharedDocument['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'final':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Family Document Co-Editing
          </h2>
          <p className='text-gray-600'>
            Collaborate with family members on important documents
          </p>
        </div>
        <Button onClick={createNewDocument} className='gap-2'>
          <Plus className='h-4 w-4' />
          New Document
        </Button>
      </div>

      {/* Active Document Editor */}
      {(isCreating || activeDocument) && activeDocument && (
        <Card className='border-2 border-blue-200'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <Input
                  value={activeDocument.title}
                  onChange={e =>
                    setActiveDocument({
                      ...activeDocument,
                      title: e.target.value,
                    })
                  }
                  className='text-xl font-bold border-0 p-0 h-auto'
                  placeholder={t('document.titlePlaceholder')}
                />
                <div className='flex items-center gap-2 mt-2'>
                  <Badge className={getStatusColor(activeDocument.status)}>
                    {activeDocument.status}
                  </Badge>
                  <Select
                    value={activeDocument.type}
                    onValueChange={(value: SharedDocument['type']) =>
                      setActiveDocument({ ...activeDocument, type: value })
                    }
                  >
                    <SelectTrigger className='w-40'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='will'>Will</SelectItem>
                      <SelectItem value='letter'>Letter</SelectItem>
                      <SelectItem value='instructions'>Instructions</SelectItem>
                      <SelectItem value='story'>Story</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size='sm'
                    variant={
                      activeDocument.isLocked ? 'destructive' : 'outline'
                    }
                    onClick={lockDocument}
                    className='gap-2'
                  >
                    {activeDocument.isLocked ? (
                      <Lock className='h-3 w-3' />
                    ) : (
                      <Unlock className='h-3 w-3' />
                    )}
                    {activeDocument.isLocked ? t('document.locked') : t('document.unlocked')}
                  </Button>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setShowComments(!showComments)}
                  className='gap-2'
                >
                  {showComments ? (
                    <EyeOff className='h-3 w-3' />
                  ) : (
                    <Eye className='h-3 w-3' />
                  )}
                  Comments ({activeDocument.comments.length})
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className='gap-2'
                >
                  <History className='h-3 w-3' />
                  History
                </Button>
                <Button size='sm' onClick={saveDocument} className='gap-2'>
                  <Save className='h-3 w-3' />
                  Save
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    setActiveDocument(null);
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-12 gap-4'>
              {/* Main Editor */}
              <div className={`${showComments ? 'col-span-8' : 'col-span-12'}`}>
                <div className='relative'>
                  <Textarea
                    ref={textareaRef}
                    value={activeDocument.content}
                    onChange={e => handleContentChange(e.target.value)}
                    placeholder={t('document.contentPlaceholder')}
                    className='min-h-96 resize-none font-mono text-sm'
                    disabled={
                      activeDocument.isLocked &&
                      activeDocument.lockedBy !== currentUserId
                    }
                  />

                  {/* Real-time Cursors */}
                  <AnimatePresence>
                    {cursors.map(cursor => (
                      <motion.div
                        key={cursor.userId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='absolute pointer-events-none'
                        style={{
                          top: `${Math.floor(cursor.position / 80) * 1.5}}em`,
                          left: `${(cursor.position % 80) * 0.6}em`,
                        }}
                      >
                        <div
                          className='w-0.5 h-5 animate-pulse'
                          style={{ backgroundColor: cursor.color }}
                        />
                        <div
                          className='text-xs px-2 py-1 rounded text-white mt-1 whitespace-nowrap'
                          style={{ backgroundColor: cursor.color }}
                        >
                          {cursor.userName}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Collaborators */}
                  <div className='absolute top-2 right-2 flex -space-x-2'>
                    {activeDocument.collaborators
                      .slice(0, 4)
                      .map(collaborator => (
                        <div key={collaborator.id} className='relative'>
                          <Avatar
                            className={`w-8 h-8 border-2 ${collaborator.isOnline ? 'border-green-400' : 'border-gray-300'}`}
                          >
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback className='text-xs'>
                              {collaborator.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {collaborator.isOnline && (
                            <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full' />
                          )}
                        </div>
                      ))}
                    {activeDocument.collaborators.length > 4 && (
                      <div className='w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white'>
                        +{activeDocument.collaborators.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Toolbar */}
                <div className='flex items-center justify-between mt-4 p-2 bg-gray-50 rounded-lg'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Activity className='h-4 w-4' />
                    {editHistory.length} edits • Last saved{' '}
                    {activeDocument.lastModified.toLocaleTimeString()}
                  </div>
                  <div className='flex gap-2'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size='sm' variant='outline' className='gap-2'>
                          <Users className='h-3 w-3' />
                          Share ({activeDocument.collaborators.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Document</DialogTitle>
                        </DialogHeader>
                        <div className='space-y-4'>
                          <Select
                            onValueChange={value => addCollaborator(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('collaborators.addPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {collaborators
                                .filter(
                                  m =>
                                    !activeDocument.collaborators.find(
                                      c => c.id === m.id
                                    )
                                )
                                .map(member => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.name} ({member.email})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <div className='space-y-2'>
                            {activeDocument.collaborators.map(collaborator => (
                              <div
                                key={collaborator.id}
                                className='flex items-center justify-between p-2 bg-gray-50 rounded-lg'
                              >
                                <div className='flex items-center gap-3'>
                                  <Avatar className='w-6 h-6'>
                                    <AvatarFallback className='text-xs'>
                                      {collaborator.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className='font-medium'>
                                      {collaborator.name}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                      {collaborator.email}
                                    </div>
                                  </div>
                                </div>
                                <Select
                                  value={collaborator.role}
                                  onValueChange={(
                                    value: FamilyMember['role']
                                  ) =>
                                    updateCollaboratorRole(
                                      collaborator.id,
                                      value
                                    )
                                  }
                                  disabled={
                                    collaborator.id === activeDocument.ownerId
                                  }
                                >
                                  <SelectTrigger className='w-28'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='owner'>Owner</SelectItem>
                                    <SelectItem value='editor'>
                                      Editor
                                    </SelectItem>
                                    <SelectItem value='commenter'>
                                      Commenter
                                    </SelectItem>
                                    <SelectItem value='viewer'>
                                      Viewer
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {/* Comments Sidebar */}
              {showComments && (
                <div className='col-span-4 border-l pl-4'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-medium'>Comments</h3>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        const text = prompt(t('comments.addComment'));
                        if (text) addComment(text, 0);
                      }}
                      className='gap-2'
                    >
                      <Plus className='h-3 w-3' />
                      Add
                    </Button>
                  </div>

                  <div className='space-y-3 max-h-96 overflow-y-auto'>
                    {activeDocument.comments.map(comment => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg border ${comment.isResolved ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <Avatar className='w-6 h-6'>
                              <AvatarImage src={comment.userAvatar} />
                              <AvatarFallback className='text-xs'>
                                {comment.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='text-sm font-medium'>
                              {comment.userName}
                            </div>
                          </div>
                          <div className='text-xs text-gray-500'>
                            {comment.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        <p className='text-sm text-gray-700 mb-2'>
                          {comment.content}
                        </p>
                        {!comment.isResolved && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => resolveComment(comment.id)}
                            className='gap-1'
                          >
                            <Check className='h-3 w-3' />
                            Resolve
                          </Button>
                        )}
                        {comment.isResolved && (
                          <div className='flex items-center gap-1 text-green-600 text-xs'>
                            <Check className='h-3 w-3' />
                            Resolved
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Version History */}
            {showVersionHistory && (
              <div className='mt-4 pt-4 border-t'>
                <h3 className='font-medium mb-3'>Version History</h3>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {activeDocument.versions.map(version => (
                    <div
                      key={version.id}
                      className='flex items-center justify-between p-2 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-6 h-6'>
                          <AvatarFallback className='text-xs'>
                            {version.authorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='text-sm font-medium'>
                            {version.authorName}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {version.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className='text-xs text-gray-600'>
                        {version.changes.length} changes
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {documents.map(document => (
          <motion.div
            key={document.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className='hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => setActiveDocument(document)}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <FileText className='h-4 w-4' />
                    {document.title}
                  </CardTitle>
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2 mb-3'>
                  <Badge variant='outline' className='text-xs'>
                    {document.type}
                  </Badge>
                  {document.isLocked && (
                    <Badge variant='secondary' className='text-xs gap-1'>
                      <Lock className='h-2 w-2' />
                      Locked
                    </Badge>
                  )}
                </div>

                <div className='flex items-center gap-2 mb-3'>
                  <Users className='h-4 w-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>
                    {document.collaborators.length} collaborators
                  </span>
                  <div className='flex -space-x-1'>
                    {document.collaborators.slice(0, 3).map(collaborator => (
                      <Avatar
                        key={collaborator.id}
                        className='w-5 h-5 border border-white'
                      >
                        <AvatarFallback className='text-xs'>
                          {collaborator.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <MessageSquare className='h-3 w-3' />
                    {document.comments.length} comments
                  </div>
                  <div className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    {document.lastModified.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {documents.length === 0 && !isCreating && (
        <div className='text-center py-12'>
          <FileText className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Collaborative Documents
          </h3>
          <p className='text-gray-600 mb-4'>
            Create your first shared document to start collaborating with family
          </p>
          <Button onClick={createNewDocument} className='gap-2'>
            <Plus className='h-4 w-4' />
            Create First Document
          </Button>
        </div>
      )}
    </div>
  );
};
