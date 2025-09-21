
import React, { useCallback, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { WillData } from './WillWizard';

export interface FamilyNode {
  children: string[]; // IDs of children nodes
  conflicts?: ConflictType[];
  dateOfBirth?: string;
  generation: number; // 0 = testator, -1 = parents, +1 = children, etc.
  id: string;
  inheritanceDetails?: string;
  inheritanceShare?: number;
  inheritanceType?: 'percentage' | 'residual' | 'specific_asset';
  isAlive: boolean;
  name: string;
  parents: string[]; // IDs of parent nodes
  position: { x: number; y: number };
  relationship:
    | 'charity'
    | 'child'
    | 'friend'
    | 'grandchild'
    | 'other'
    | 'parent'
    | 'sibling'
    | 'spouse';
}

export interface RelativeSuggestion {
  priority: 'high' | 'low' | 'medium';
  reasoning: string;
  relationship:
    | 'charity'
    | 'child'
    | 'friend'
    | 'grandchild'
    | 'other'
    | 'parent'
    | 'sibling'
    | 'spouse';
}

export interface InheritanceMap {
  conflicts: ConflictType[];
  distributions: Array<{
    amount: number;
    assetTypes: string[];
    percentage: number;
    recipientId: string;
    recipientName: string;
  }>;
  totalValue: number;
}

export type ConflictType =
  | 'forced_heirs'
  | 'missing_heirs'
  | 'percentage_overflow'
  | 'relationship_inconsistency';

interface FamilyTreeVisualizationProps {
  className?: string;
  guardians?: Array<{
    contact_info?: any;
    id: string;
    name: string;
    relationship:
      | 'charity'
      | 'child'
      | 'friend'
      | 'grandchild'
      | 'other'
      | 'parent'
      | 'sibling'
      | 'spouse';
  }>;
  onUpdateWillData: (data: Partial<WillData>) => void;
  willData: WillData;
}

export const FamilyTreeVisualization: React.FC<
  FamilyTreeVisualizationProps
> = ({ willData, guardians = [], onUpdateWillData, className = '' }) => {
  const [selectedNode, setSelectedNode] = useState<FamilyNode | null>(null);
  const [showAddRelative, setShowAddRelative] = useState(false);
  const [newRelative, setNewRelative] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    isAlive: true,
  });

  // Build family tree from will data and guardians
  const familyTree = useMemo(() => {
    return buildFamilyTree(willData, guardians);
  }, [willData, guardians]);

  // Generate inheritance flow visualization
  const inheritanceFlow = useMemo(() => {
    return visualizeInheritanceFlow(familyTree, willData);
  }, [familyTree, willData]);

  // Detect relationship conflicts
  const conflicts = useMemo(() => {
    return detectRelationshipConflicts(familyTree, willData);
  }, [familyTree, willData]);

  // Suggest missing relatives
  const suggestions = useMemo(() => {
    return suggestMissingRelatives(familyTree);
  }, [familyTree]);

  const handleDragStart = useCallback(
    (node: FamilyNode, event: React.DragEvent) => {
      event.dataTransfer.setData('application/json', JSON.stringify(node));
    },
    []
  );

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    // Parse node data from drag event
    JSON.parse(event.dataTransfer.getData('application/json')) as FamilyNode;
    const rect = event.currentTarget.getBoundingClientRect();
    // Calculate drop position
    event.clientX - rect.left;
    event.clientY - rect.top;

    // Update node position (in a real implementation, you'd update the family tree state)
    // Moving ${nodeData.name} to position (${x}, ${y})
  }, []);

  const handleAssignInheritance = useCallback(
    (nodeId: string, percentage: number) => {
      const node = familyTree.find(n => n.id === nodeId);
      if (!node) return;

      // Check if person is already a beneficiary
      const existingBeneficiaryIndex = willData.beneficiaries.findIndex(
        b => b.name.toLowerCase() === node.name.toLowerCase()
      );

      if (existingBeneficiaryIndex >= 0) {
        // Update existing beneficiary
        const updatedBeneficiaries = [...willData.beneficiaries];
        updatedBeneficiaries[existingBeneficiaryIndex] = {
          ...updatedBeneficiaries[existingBeneficiaryIndex],
          id: updatedBeneficiaries[existingBeneficiaryIndex].id,
          name: updatedBeneficiaries[existingBeneficiaryIndex].name,
          relationship: updatedBeneficiaries[existingBeneficiaryIndex].relationship,
          percentage,
        };
        onUpdateWillData({ beneficiaries: updatedBeneficiaries });
      } else {
        // Add new beneficiary
        const newBeneficiary = {
          id: crypto.randomUUID(),
          name: node.name,
          relationship: node.relationship,
          percentage,
          specificGifts: [],
          conditions: '',
        };
        onUpdateWillData({
          beneficiaries: [...willData.beneficiaries, newBeneficiary],
        });
      }

      toast.success(`Assigned ${percentage}% inheritance to ${node.name}`);
    },
    [familyTree, willData.beneficiaries, onUpdateWillData]
  );

  const handleAddRelative = useCallback(() => {
    if (!newRelative.name || !newRelative.relationship) {
      toast.error('Please provide name and relationship');
      return;
    }

    // In a real implementation, you'd add this to your guardians/family data
    // For now, we'll just show a success message
    toast.success(`Added ${newRelative.name} as ${newRelative.relationship}`);

    setNewRelative({
      name: '',
      relationship: '',
      dateOfBirth: '',
      isAlive: true,
    });
    setShowAddRelative(false);
  }, [newRelative]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>
            Family Tree & Inheritance Flow
          </h3>
          <p className='text-sm text-muted-foreground'>
            Visualize relationships and plan inheritance distribution
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Dialog open={showAddRelative} onOpenChange={setShowAddRelative}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm'>
                <Icon name="add" className='w-4 h-4 mr-2' />
                Add Relative
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>Name</label>
                  <Input
                    value={newRelative.name}
                    onChange={e =>
                      setNewRelative(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder='Full name'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>Relationship</label>
                  <Select
                    value={newRelative.relationship}
                    onValueChange={value =>
                      setNewRelative(prev => ({ ...prev, relationship: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select relationship' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='child'>Child</SelectItem>
                      <SelectItem value='spouse'>Spouse</SelectItem>
                      <SelectItem value='parent'>Parent</SelectItem>
                      <SelectItem value='sibling'>Sibling</SelectItem>
                      <SelectItem value='grandchild'>Grandchild</SelectItem>
                      <SelectItem value='grandparent'>Grandparent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Date of Birth (Optional)
                  </label>
                  <Input
                    type='date'
                    value={newRelative.dateOfBirth}
                    onChange={e =>
                      setNewRelative(prev => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowAddRelative(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddRelative}>Add Relative</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Conflicts and Suggestions */}
      {(conflicts.length > 0 || suggestions.length > 0) && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {conflicts.length > 0 && (
            <Card className='p-4 border-red-200 bg-red-50'>
              <h4 className='font-medium text-red-900 mb-2 flex items-center gap-2'>
                <Icon name="alert-triangle" className='w-4 h-4' />
                Relationship Conflicts ({conflicts.length})
              </h4>
              <div className='space-y-2'>
                {conflicts.slice(0, 3).map((conflict, index) => (
                  <div key={index} className='text-sm text-red-800'>
                    • {getConflictDescription(conflict)}
                  </div>
                ))}
                {conflicts.length > 3 && (
                  <div className='text-xs text-red-600'>
                    +{conflicts.length - 3} more conflicts
                  </div>
                )}
              </div>
            </Card>
          )}

          {suggestions.length > 0 && (
            <Card className='p-4 border-blue-200 bg-blue-50'>
              <h4 className='font-medium text-blue-900 mb-2 flex items-center gap-2'>
                <Icon name="lightbulb" className='w-4 h-4' />
                Suggested Family Members ({suggestions.length})
              </h4>
              <div className='space-y-2'>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className='text-sm'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {suggestion.priority}
                      </Badge>
                      <span className='font-medium'>
                        {suggestion.relationship}
                      </span>
                    </div>
                    <div className='text-blue-700 text-xs mt-1'>
                      {suggestion.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Family Tree Visualization */}
      <Card className='p-6'>
        <div className='mb-4'>
          <h4 className='font-medium mb-2'>Interactive Family Tree</h4>
          <p className='text-sm text-muted-foreground'>
            Drag family members to rearrange. Click on a person to assign
            inheritance.
          </p>
        </div>

        <div
          className='relative w-full h-96 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden'
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          {/* Render family tree nodes */}
          {familyTree.map(node => (
            <FamilyTreeNode
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onClick={() => setSelectedNode(node)}
              onDragStart={e => handleDragStart(node, e)}
              onAssignInheritance={percentage =>
                handleAssignInheritance(node.id, percentage)
              }
            />
          ))}

          {/* Connection lines would be rendered here */}
          <svg className='absolute inset-0 pointer-events-none w-full h-full'>
            {familyTree.map(node =>
              node.children.map(childId => {
                const child = familyTree.find(n => n.id === childId);
                if (!child) return null;

                return (
                  <line
                    key={`${node.id}-${childId}`}
                    x1={node.position.x + 60} // Center of parent node
                    y1={node.position.y + 25}
                    x2={child.position.x + 60} // Center of child node
                    y2={child.position.y + 25}
                    stroke='currentColor'
                    className='text-slate-400'
                    strokeWidth='2'
                    strokeDasharray='5,5'
                  />
                );
              })
            )}
          </svg>
        </div>
      </Card>

      {/* Inheritance Summary */}
      <Card className='p-6'>
        <h4 className='font-medium mb-4'>Inheritance Distribution</h4>
        <div className='space-y-4'>
          {inheritanceFlow.distributions.map((distribution, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 bg-muted/50 rounded'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                  <Icon name="user" className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <div className='font-medium'>
                    {distribution.recipientName}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {distribution.assetTypes.join(', ')}
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='font-medium'>{distribution.percentage}%</div>
                {distribution.amount > 0 && (
                  <div className='text-sm text-muted-foreground'>
                    ${distribution.amount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}

          {inheritanceFlow.distributions.length === 0 && (
            <div className='text-center text-muted-foreground py-8'>
              <Icon
                name="users"
                className='w-12 h-12 mx-auto mb-4 opacity-50'
              />
              <p>No inheritance distributions defined yet</p>
              <p className='text-sm'>
                Add beneficiaries to see the inheritance flow
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Family Tree Node Component
interface FamilyTreeNodeProps {
  isSelected: boolean;
  node: FamilyNode;
  onAssignInheritance: (percentage: number) => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const FamilyTreeNode: React.FC<FamilyTreeNodeProps> = ({
  node,
  isSelected,
  onClick,
  onDragStart,
  onAssignInheritance,
}) => {
  const [showInheritanceDialog, setShowInheritanceDialog] = useState(false);
  const [inheritancePercentage, setInheritancePercentage] = useState(
    node.inheritanceShare || 0
  );

  const getGenerationColor = (generation: number): string => {
    switch (generation) {
      case -1:
        return 'bg-blue-100 border-blue-300 text-blue-800'; // Parents
      case 0:
        return 'bg-green-100 border-green-300 text-green-800'; // Testator
      case 1:
        return 'bg-purple-100 border-purple-300 text-purple-800'; // Children
      case 2:
        return 'bg-pink-100 border-pink-300 text-pink-800'; // Grandchildren
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRelationshipIcon = (
    relationship: string
  ): 'heart' | 'home' | 'star' | 'user' | 'users' => {
    switch (relationship.toLowerCase()) {
      case 'spouse':
      case 'husband':
      case 'wife':
        return 'heart';
      case 'child':
      case 'son':
      case 'daughter':
        return 'user';
      case 'parent':
      case 'father':
      case 'mother':
        return 'user';
      case 'sibling':
      case 'brother':
      case 'sister':
        return 'users';
      case 'grandchild':
        return 'heart';
      case 'grandparent':
        return 'user';
      default:
        return 'user';
    }
  };

  return (
    <>
      <div
        className={`absolute cursor-move select-none ${getGenerationColor(node.generation)} ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        } rounded-lg border-2 p-2 min-w-[120px] shadow-sm hover:shadow-md transition-all`}
        style={{
          left: `${node.position.x}}px`,
          top: `${node.position.y}px`,
        }}
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
      >
        <div className='flex items-center gap-2 mb-1'>
          <Icon
            name={getRelationshipIcon(node.relationship)}
            className='w-4 h-4'
          />
          <span className='font-medium text-sm truncate'>{node.name}</span>
        </div>

        <div className='text-xs opacity-75 mb-2'>
          {node.relationship}
          {node.dateOfBirth && (
            <div>Born: {new Date(node.dateOfBirth).getFullYear()}</div>
          )}
        </div>

        {node.inheritanceShare && (
          <Badge variant='secondary' className='text-xs'>
            {node.inheritanceShare}%
          </Badge>
        )}

        <div className='flex gap-1 mt-2'>
          <Button
            size='sm'
            variant='ghost'
            className='h-6 px-2 text-xs'
            onClick={e => {
              e.stopPropagation();
              setShowInheritanceDialog(true);
            }}
          >
            <Icon name="percent" className='w-3 h-3' />
          </Button>
        </div>

        {node.conflicts && node.conflicts.length > 0 && (
          <div className='absolute -top-2 -right-2'>
            <div className='w-4 h-4 bg-red-500 rounded-full flex items-center justify-center'>
              <Icon
                name="alert-triangle"
                className='w-2 h-2 text-white'
              />
            </div>
          </div>
        )}
      </div>

      {/* Inheritance Assignment Dialog */}
      <Dialog
        open={showInheritanceDialog}
        onOpenChange={setShowInheritanceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Inheritance to {node.name}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium'>
                Inheritance Percentage
              </label>
              <Input
                type='number'
                min='0'
                max='100'
                value={inheritancePercentage}
                onChange={e =>
                  setInheritancePercentage(parseInt(e.target.value) || 0)
                }
                placeholder='0'
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowInheritanceDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onAssignInheritance(inheritancePercentage);
                  setShowInheritanceDialog(false);
                }}
              >
                Assign {inheritancePercentage}%
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper functions
function buildFamilyTree(willData: WillData, guardians: any[]): FamilyNode[] {
  const nodes: FamilyNode[] = [];
  let nodeId = 1;

  // Add testator as root node
  nodes.push({
    id: 'testator',
    name: willData.testator_data.fullName || 'Testator',
    relationship: 'other',
    dateOfBirth: willData.testator_data.dateOfBirth || '',
    isAlive: true,
    generation: 0,
    position: { x: 200, y: 150 }, // Center position
    children: [],
    parents: [],
  });

  // Add beneficiaries and guardians as family nodes
  const allPeople = [
    ...willData.beneficiaries.map(b => ({ ...b, source: 'beneficiary' })),
    ...guardians.map(g => ({ ...g, source: 'guardian' })),
  ];

  allPeople.forEach((person, index) => {
    const generation = getGenerationFromRelationship(person.relationship);
    const basePosition = getPositionForGeneration(generation, index);

    nodes.push({
      id: `person_${nodeId++}`,
      name: person.name,
      relationship: person.relationship,
      dateOfBirth: person.dateOfBirth,
      isAlive: true,
      generation,
      position: basePosition,
      inheritanceShare: person.percentage || 0,
      children: [],
      parents: generation === 0 ? [] : ['testator'],
    });
  });

  return nodes;
}

function getGenerationFromRelationship(relationship: string): number {
  const rel = relationship.toLowerCase();
  if (['parent', 'father', 'mother'].includes(rel)) return -1;
  if (['spouse', 'husband', 'wife', 'partner'].includes(rel)) return 0;
  if (['child', 'son', 'daughter'].includes(rel)) return 1;
  if (['grandchild', 'grandson', 'granddaughter'].includes(rel)) return 2;
  if (['grandparent', 'grandfather', 'grandmother'].includes(rel)) return -2;
  if (['sibling', 'brother', 'sister'].includes(rel)) return 0;
  return 0;
}

function getPositionForGeneration(
  generation: number,
  index: number
): { x: number; y: number } {
  const baseY = 150 + generation * 80; // Vertical spacing between generations
  const baseX = 100 + index * 150; // Horizontal spacing between siblings
  return { x: baseX, y: Math.max(20, baseY) };
}

function visualizeInheritanceFlow(
  _familyTree: FamilyNode[],
  willData: WillData
): InheritanceMap {
  const distributions = willData.beneficiaries.map(beneficiary => ({
    recipientId: beneficiary.id,
    recipientName: beneficiary.name,
    amount: 0, // Would calculate based on total estate value
    percentage: beneficiary.percentage,
    assetTypes: ['General Estate'], // Would be more specific based on assets
  }));

  return {
    totalValue: 0, // Would calculate from assets
    distributions,
    conflicts: [],
  };
}

function detectRelationshipConflicts(
  familyTree: FamilyNode[],
  willData: WillData
): ConflictType[] {
  const conflicts: ConflictType[] = [];

  // Check for percentage overflow
  const totalPercentage = willData.beneficiaries.reduce(
    (sum, b) => sum + b.percentage,
    0
  );
  if (totalPercentage > 100) {
    conflicts.push('percentage_overflow');
  }

  // Check for missing forced heirs (simplified)
  const hasChildren = familyTree.some(node =>
    ['child', 'son', 'daughter'].includes(node.relationship.toLowerCase())
  );
  const childrenInWill = willData.beneficiaries.some(b =>
    ['child', 'son', 'daughter'].includes(b.relationship.toLowerCase())
  );

  if (hasChildren && !childrenInWill) {
    conflicts.push('forced_heirs');
  }

  return conflicts;
}

function suggestMissingRelatives(
  familyTree: FamilyNode[]
): RelativeSuggestion[] {
  const suggestions: RelativeSuggestion[] = [];

  // Check for missing spouse
  const hasSpouse = familyTree.some(node =>
    ['spouse', 'husband', 'wife', 'partner'].includes(
      node.relationship.toLowerCase()
    )
  );

  if (!hasSpouse) {
    suggestions.push({
      relationship: 'spouse',
      reasoning: 'Consider adding your spouse or partner to the family tree',
      priority: 'high',
    });
  }

  // Check for missing children
  const hasChildren = familyTree.some(node =>
    ['child', 'son', 'daughter'].includes(node.relationship.toLowerCase())
  );

  if (!hasChildren) {
    suggestions.push({
      relationship: 'child',
      reasoning:
        'If you have children, they may be entitled to forced heir protection',
      priority: 'high',
    });
  }

  return suggestions;
}

function getConflictDescription(conflict: ConflictType): string {
  switch (conflict) {
    case 'forced_heirs':
      return 'Some family members may have forced heir rights';
    case 'percentage_overflow':
      return 'Total inheritance percentages exceed 100%';
    case 'missing_heirs':
      return 'Potential heirs are missing from the will';
    case 'relationship_inconsistency':
      return 'Relationship definitions may be inconsistent';
    default:
      return 'Unknown conflict detected';
  }
}
