
import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Baby,
  Crown,
  Download,
  Edit3,
  Heart,
  Maximize2,
  Minimize2,
  Plus,
  RotateCcw,
  Share2,
  User,
  Users,
  UserX,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';

export interface FamilyMember {
  birthDate?: string;
  deathDate?: string;
  email?: string;
  gender?: 'female' | 'male' | 'other';
  generation: number;
  id: string;
  isGuardian?: boolean;
  name: string;
  notes?: string;
  parents?: string[];
  phone?: string;
  photo?: string;
  position: { x: number; y: number };
  relationship:
    | 'child'
    | 'grandchild'
    | 'grandparent'
    | 'other'
    | 'parent'
    | 'self'
    | 'sibling'
    | 'spouse';
  roles: Array<
    'executor' | 'guardian' | 'heir' | 'power_of_attorney' | 'trustee'
  >;
  spouse?: string;
  status: 'active' | 'declined' | 'inactive' | 'invited';
}

export interface FamilyConnection {
  endDate?: string;
  fromId: string;
  id: string;
  startDate?: string;
  toId: string;
  type: 'child' | 'parent' | 'sibling' | 'spouse';
}

interface FamilyTreeVisualizationProps {
  connections: FamilyConnection[];
  currentUserId?: string;
  isEditable?: boolean;
  members: FamilyMember[];
  onAddConnection?: (connection: Omit<FamilyConnection, 'id'>) => void;
  onAddMember?: (member: Omit<FamilyMember, 'id'>) => void;
  onDeleteMember?: (memberId: string) => void;
  onEditMember?: (member: FamilyMember) => void;
  onExportTree?: (format: 'json' | 'pdf' | 'png') => void;
  onShareTree?: () => void;
}

export const FamilyTreeVisualization: React.FC<
  FamilyTreeVisualizationProps
> = ({
  members,
  connections,
  onAddMember,
  onEditMember: _onEditMember,
  onDeleteMember,
  onAddConnection: _onAddConnection,
  onExportTree,
  onShareTree,
  currentUserId,
  isEditable = true,
}) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState<'roles' | 'timeline' | 'tree'>(
    'tree'
  );
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [_editingMember, setEditingMember] = useState<FamilyMember | null>(
    null
  );
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: '',
    relationship: 'child',
    generation: 0,
    position: { x: 0, y: 0 },
    status: 'active',
    roles: [],
  });

  // Organize members by generation for tree layout
  const membersByGeneration = useMemo(() => {
    const generations = new Map<number, FamilyMember[]>();
    members.forEach(member => {
      const gen = member.generation;
      if (!generations.has(gen)) {
        generations.set(gen, []);
      }
      const genMembers = generations.get(gen);
      if (genMembers) {
        genMembers.push(member);
      }
    });
    return generations;
  }, [members]);

  // Find the current user (root of the tree)
  const currentUser = useMemo(() => {
    return members.find(
      member => member.id === currentUserId || member.relationship === 'self'
    );
  }, [members, currentUserId]);

  // Generate tree layout positions
  const layoutMembers = useMemo(() => {
    if (!currentUser) return members;

    const positioned = new Map<string, FamilyMember>();
    const generationWidth = 300;
    const memberSpacing = 120;

    // Start with current user at center
    positioned.set(currentUser.id, {
      ...currentUser,
      position: { x: 0, y: 0 },
    });

    // Position each generation
    Array.from(membersByGeneration.keys())
      .sort()
      .forEach(gen => {
        const genMembers = membersByGeneration.get(gen) || [];
        const genY = (gen - (currentUser.generation || 0)) * generationWidth;

        genMembers.forEach((member, index) => {
          if (member.id === currentUser.id) return; // Skip root, already positioned

          const genWidth = genMembers.length * memberSpacing;
          const startX = -genWidth / 2;
          const x = startX + index * memberSpacing;

          positioned.set(member.id, {
            ...member,
            position: { x, y: genY },
          });
        });
      });

    return Array.from(positioned.values());
  }, [members, currentUser, membersByGeneration]);

  // Get member icon based on relationship and status
  const getMemberIcon = (member: FamilyMember) => {
    if (member.relationship === 'self') return Crown;
    if (member.relationship === 'spouse') return Heart;
    if (member.relationship === 'child' || member.relationship === 'grandchild')
      return Baby;
    if (member.deathDate) return UserX;
    return User;
  };

  // Get member color based on status and roles
  const getMemberColor = (member: FamilyMember) => {
    if (member.relationship === 'self')
      return 'bg-primary text-primary-foreground';
    if (member.isGuardian) return 'bg-blue-100 text-blue-900 border-blue-300';
    if (member.roles.includes('heir'))
      return 'bg-green-100 text-green-900 border-green-300';
    if (member.status === 'invited')
      return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    if (member.status === 'declined')
      return 'bg-red-100 text-red-900 border-red-300';
    return 'bg-white border-gray-200 hover:bg-gray-50';
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship) return;

    const member: Omit<FamilyMember, 'id'> = {
      name: newMember.name,
      relationship: newMember.relationship as FamilyMember['relationship'],
      generation: newMember.generation || 0,
      position: newMember.position || { x: 0, y: 0 },
      status: 'active',
      roles: [],
      ...newMember,
    };

    onAddMember?.(member);
    setNewMember({
      name: '',
      relationship: 'child',
      generation: 0,
      position: { x: 0, y: 0 },
      status: 'active',
      roles: [],
    });
    setShowAddMemberDialog(false);
  };

  const MemberCard = ({ member }: { member: FamilyMember }) => {
    const IconComponent = getMemberIcon(member);

    return (
      <motion.div
        key={member.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`absolute cursor-pointer transition-all duration-200 ${
          selectedMember?.id === member.id ? 'z-20 scale-110' : 'z-10'
        }`}
        style={{
          left: `${member.position.x + 300}}px`,
          top: `${member.position.y + 200}px`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => setSelectedMember(member)}
      >
        <Card
          className={`w-32 ${getMemberColor(member)} shadow-lg hover:shadow-xl transition-shadow`}
        >
          <CardContent className='p-3 text-center'>
            <div className='flex justify-center mb-2'>
              <IconComponent className='h-6 w-6' />
            </div>
            <div className='font-medium text-sm truncate'>{member.name}</div>
            <div className='text-xs opacity-70 capitalize'>
              {member.relationship}
            </div>
            {member.roles.length > 0 && (
              <div className='flex flex-wrap gap-1 mt-1'>
                {member.roles.slice(0, 2).map(role => (
                  <Badge
                    key={role}
                    variant='secondary'
                    className='text-xs px-1 py-0'
                  >
                    {role}
                  </Badge>
                ))}
                {member.roles.length > 2 && (
                  <Badge variant='secondary' className='text-xs px-1 py-0'>
                    +{member.roles.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const TreeConnections = () => {
    return (
      <svg
        className='absolute inset-0 pointer-events-none'
        style={{ zIndex: 5 }}
      >
        {connections.map(conn => {
          const fromMember = layoutMembers.find(m => m.id === conn.fromId);
          const toMember = layoutMembers.find(m => m.id === conn.toId);

          if (!fromMember || !toMember) return null;

          const startX = fromMember.position.x + 300;
          const startY = fromMember.position.y + 200;
          const endX = toMember.position.x + 300;
          const endY = toMember.position.y + 200;

          const strokeColor = conn.type === 'spouse' ? '#ef4444' : '#6b7280';
          const strokeWidth = conn.type === 'spouse' ? 2 : 1;

          return (
            <line
              key={conn.id}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={conn.endDate ? '5,5' : 'none'}
              opacity={0.6}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className='w-full h-full bg-gray-50'>
      {/* Header Controls */}
      <div className='bg-white border-b p-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <h2 className='text-xl font-semibold flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Family Tree
          </h2>
          <div className='flex gap-2'>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'roles' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('roles')}
            >
              Roles
            </Button>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {isZoomed ? (
              <Minimize2 className='h-4 w-4' />
            ) : (
              <Maximize2 className='h-4 w-4' />
            )}
          </Button>

          <Button variant='outline' size='sm' onClick={() => {}}>
            <RotateCcw className='h-4 w-4' />
          </Button>

          <Select>
            <SelectTrigger className='w-32'>
              <SelectValue placeholder='Export' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='png' onClick={() => onExportTree?.('png')}>
                <div className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  PNG Image
                </div>
              </SelectItem>
              <SelectItem value='pdf' onClick={() => onExportTree?.('pdf')}>
                <div className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  PDF Document
                </div>
              </SelectItem>
              <SelectItem value='json' onClick={() => onExportTree?.('json')}>
                <div className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  JSON Data
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' size='sm' onClick={onShareTree}>
            <Share2 className='h-4 w-4' />
          </Button>

          {isEditable && (
            <Dialog
              open={showAddMemberDialog}
              onOpenChange={setShowAddMemberDialog}
            >
              <DialogTrigger asChild>
                <Button size='sm'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newMember.name || ''}
                      onChange={e =>
                        setNewMember(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder='Enter full name'
                    />
                  </div>
                  <div>
                    <Label>Relationship</Label>
                    <Select
                      value={newMember.relationship}
                      onValueChange={value =>
                        setNewMember(prev => ({
                          ...prev,
                          relationship: value as FamilyMember['relationship'],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='spouse'>Spouse</SelectItem>
                        <SelectItem value='child'>Child</SelectItem>
                        <SelectItem value='parent'>Parent</SelectItem>
                        <SelectItem value='sibling'>Sibling</SelectItem>
                        <SelectItem value='grandparent'>Grandparent</SelectItem>
                        <SelectItem value='grandchild'>Grandchild</SelectItem>
                        <SelectItem value='other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Email (Optional)</Label>
                    <Input
                      type='email'
                      value={newMember.email || ''}
                      onChange={e =>
                        setNewMember(prev => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder='email@example.com'
                    />
                  </div>
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={newMember.notes || ''}
                      onChange={e =>
                        setNewMember(prev => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder='Any additional notes...'
                      rows={3}
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setShowAddMemberDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember}>Add Member</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tree Visualization */}
      <div
        className={`relative overflow-auto ${isZoomed ? 'h-screen' : 'h-96'} bg-gradient-to-br from-blue-50 to-green-50`}
      >
        {viewMode === 'tree' && (
          <>
            <TreeConnections />
            {layoutMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </>
        )}

        {viewMode === 'timeline' && (
          <div className='p-8'>
            <div className='text-center text-gray-600'>
              Timeline view - Coming soon
            </div>
          </div>
        )}

        {viewMode === 'roles' && (
          <div className='p-8'>
            <div className='text-center text-gray-600'>
              Roles view - Coming soon
            </div>
          </div>
        )}
      </div>

      {/* Member Details Panel */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className='fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-30 overflow-y-auto'
          >
            <div className='p-6 border-b'>
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='text-xl font-semibold'>
                    {selectedMember.name}
                  </h3>
                  <p className='text-gray-600 capitalize'>
                    {selectedMember.relationship}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedMember(null)}
                >
                  ×
                </Button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              {selectedMember.email && (
                <div>
                  <Label className='text-sm font-medium'>Email</Label>
                  <p className='text-sm text-gray-600'>
                    {selectedMember.email}
                  </p>
                </div>
              )}

              {selectedMember.phone && (
                <div>
                  <Label className='text-sm font-medium'>Phone</Label>
                  <p className='text-sm text-gray-600'>
                    {selectedMember.phone}
                  </p>
                </div>
              )}

              {selectedMember.roles.length > 0 && (
                <div>
                  <Label className='text-sm font-medium'>Roles</Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {selectedMember.roles.map(role => (
                      <Badge key={role} variant='secondary'>
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMember.notes && (
                <div>
                  <Label className='text-sm font-medium'>Notes</Label>
                  <p className='text-sm text-gray-600'>
                    {selectedMember.notes}
                  </p>
                </div>
              )}

              <div>
                <Label className='text-sm font-medium'>Status</Label>
                <Badge
                  variant={
                    selectedMember.status === 'active' ? 'default' : 'secondary'
                  }
                  className='ml-2'
                >
                  {selectedMember.status}
                </Badge>
              </div>

              {isEditable && (
                <div className='flex gap-2 pt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setEditingMember(selectedMember);
                      // Open edit dialog
                    }}
                  >
                    <Edit3 className='h-4 w-4 mr-2' />
                    Edit
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onDeleteMember?.(selectedMember.id)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Footer */}
      <div className='bg-white border-t p-4'>
        <div className='flex items-center justify-between text-sm text-gray-600'>
          <div className='flex gap-6'>
            <span>Total Members: {members.length}</span>
            <span>
              Active: {members.filter(m => m.status === 'active').length}
            </span>
            <span>Guardians: {members.filter(m => m.isGuardian).length}</span>
            <span>
              Heirs: {members.filter(m => m.roles.includes('heir')).length}
            </span>
          </div>
          <div className='flex items-center gap-2 text-xs'>
            <div className='w-3 h-3 bg-blue-100 border-blue-300 border rounded'></div>
            <span>Guardian</span>
            <div className='w-3 h-3 bg-green-100 border-green-300 border rounded ml-4'></div>
            <span>Heir</span>
            <div className='w-3 h-3 bg-yellow-100 border-yellow-300 border rounded ml-4'></div>
            <span>Invited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyTreeVisualization;
