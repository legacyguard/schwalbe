/**
 * Family Collaboration Features - Premium Liquid Design
 * Multi-generational family sharing with Sofia AI-powered guidance
 */

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Heart,
  Lock,
  MessageSquare,
  Share2,
  Shield,
  Sparkles,
  TreePine,
  Users,
  Video,
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Bell,
  Star,
  Gift,
  Camera,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  TrendingUp,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/stubs/ui'
import { Button } from '@/stubs/ui'
import { Input } from '@/stubs/ui'
import { Label } from '@/stubs/ui'
import { Badge } from '@/stubs/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/stubs/ui'
import { Separator } from '@/stubs/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/stubs/ui'
import { Checkbox } from '@/stubs/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/stubs/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/stubs/ui'
import { cn } from '@schwalbe/lib/utils'

// Import Sofia AI components
import { SofiaFirefly } from '@/components/sofia-firefly/SofiaFirefly'

interface FamilyMember {
  id: string
  name: string
  role: 'primary' | 'spouse' | 'child' | 'grandchild' | 'parent' | 'sibling' | 'guardian' | 'advisor'
  relationship: string
  status: 'active' | 'pending' | 'inactive'
  lastActivity: string
  avatar: string
  email?: string
  phone?: string
  location?: string
  permissions: {
    viewDocuments: boolean
    editDocuments: boolean
    shareDocuments: boolean
    viewAnalytics: boolean
    manageGuardians: boolean
  }
  milestones: {
    id: string
    title: string
    date: string
    type: 'birthday' | 'anniversary' | 'achievement' | 'protection'
    completed: boolean
  }[]
  trustScore: number
  engagementLevel: 'high' | 'medium' | 'low'
}

interface FamilyTreeNode {
  id: string
  member: FamilyMember
  children: FamilyTreeNode[]
  spouse?: FamilyMember
  level: number
}

interface SharedDocument {
  id: string
  name: string
  type: 'will' | 'trust' | 'healthcare' | 'financial' | 'personal'
  sharedBy: string
  sharedWith: string[]
  permissions: 'view' | 'edit' | 'comment'
  lastAccessed: string
  accessCount: number
  securityLevel: 'private' | 'family' | 'extended'
}

interface FamilyMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: 'text' | 'document' | 'milestone' | 'reminder'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  readBy: string[]
  attachments?: {
    id: string
    name: string
    type: string
    url: string
  }[]
}

interface CollaborationRoom {
  id: string
  name: string
  type: 'planning' | 'review' | 'discussion' | 'celebration'
  participants: string[]
  activeNow: number
  lastActivity: string
  topic?: string
  scheduledFor?: string
}

interface SofiaMediation {
  id: string
  type: 'conflict_resolution' | 'decision_support' | 'emotional_support' | 'planning_guidance'
  title: string
  description: string
  participants: string[]
  status: 'active' | 'resolved' | 'pending'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  resolvedAt?: string
  outcome?: string
}

interface FamilyCollaborationProps {
  className?: string
  onDocumentShare?: (document: SharedDocument) => void
  onMessageSend?: (message: FamilyMessage) => void
  onMilestoneCreate?: (milestone: FamilyMember['milestones'][0]) => void
  onRoomJoin?: (room: CollaborationRoom) => void
}

export function FamilyCollaboration({
  onDocumentShare,
  onMessageSend,
  onMilestoneCreate,
  onRoomJoin,
  className,
}: FamilyCollaborationProps) {
  const { t } = useTranslation('ui/family-collaboration')
  const shouldReduceMotion = useReducedMotion()

  const [selectedTab, setSelectedTab] = useState<'tree' | 'messages' | 'documents' | 'milestones' | 'rooms'>('tree')
  const [sofiaPersonality, setSofiaPersonality] = useState<'nurturing' | 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'confident'>('nurturing')

  // Mock data - in real app, this would come from APIs
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'primary',
      relationship: 'Self',
      status: 'active',
      lastActivity: 'now',
      avatar: 'SJ',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      permissions: {
        viewDocuments: true,
        editDocuments: true,
        shareDocuments: true,
        viewAnalytics: true,
        manageGuardians: true,
      },
      milestones: [
        {
          id: '1',
          title: 'Will Completion',
          date: '2025-01-15',
          type: 'protection',
          completed: true,
        },
        {
          id: '2',
          title: '40th Birthday',
          date: '2025-03-20',
          type: 'birthday',
          completed: false,
        }
      ],
      trustScore: 100,
      engagementLevel: 'high'
    },
    {
      id: '2',
      name: 'Michael Johnson',
      role: 'spouse',
      relationship: 'Husband',
      status: 'active',
      lastActivity: '2 hours ago',
      avatar: 'MJ',
      email: 'michael.johnson@email.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      permissions: {
        viewDocuments: true,
        editDocuments: true,
        shareDocuments: false,
        viewAnalytics: true,
        manageGuardians: false,
      },
      milestones: [
        {
          id: '3',
          title: 'Trust Setup',
          date: '2025-01-10',
          type: 'protection',
          completed: true,
        }
      ],
      trustScore: 95,
      engagementLevel: 'high'
    },
    {
      id: '3',
      name: 'Emma Johnson',
      role: 'child',
      relationship: 'Daughter',
      status: 'active',
      lastActivity: '1 day ago',
      avatar: 'EJ',
      email: 'emma.johnson@email.com',
      phone: '+1 (555) 345-6789',
      location: 'Berkeley, CA',
      permissions: {
        viewDocuments: true,
        editDocuments: false,
        shareDocuments: false,
        viewAnalytics: false,
        manageGuardians: false,
      },
      milestones: [
        {
          id: '4',
          title: 'College Graduation',
          date: '2025-05-15',
          type: 'achievement',
          completed: false,
        }
      ],
      trustScore: 88,
      engagementLevel: 'medium'
    },
    {
      id: '4',
      name: 'David Smith',
      role: 'guardian',
      relationship: 'Brother',
      status: 'active',
      lastActivity: '5 hours ago',
      avatar: 'DS',
      email: 'david.smith@email.com',
      phone: '+1 (555) 456-7890',
      location: 'Los Angeles, CA',
      permissions: {
        viewDocuments: true,
        editDocuments: false,
        shareDocuments: false,
        viewAnalytics: true,
        manageGuardians: false,
      },
      milestones: [],
      trustScore: 92,
      engagementLevel: 'high'
    },
    {
      id: '5',
      name: 'Lisa Chen',
      role: 'advisor',
      relationship: 'Financial Advisor',
      status: 'active',
      lastActivity: '3 days ago',
      avatar: 'LC',
      email: 'lisa.chen@advisor.com',
      phone: '+1 (555) 567-8901',
      location: 'San Francisco, CA',
      permissions: {
        viewDocuments: false,
        editDocuments: false,
        shareDocuments: false,
        viewAnalytics: true,
        manageGuardians: false,
      },
      milestones: [],
      trustScore: 85,
      engagementLevel: 'medium'
    }
  ])

  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([
    {
      id: '1',
      name: 'Last Will and Testament',
      type: 'will',
      sharedBy: 'Sarah Johnson',
      sharedWith: ['Michael Johnson', 'David Smith'],
      permissions: 'view',
      lastAccessed: '2025-01-18T10:30:00Z',
      accessCount: 5,
      securityLevel: 'family'
    },
    {
      id: '2',
      name: 'Living Trust Document',
      type: 'trust',
      sharedBy: 'Sarah Johnson',
      sharedWith: ['Michael Johnson'],
      permissions: 'edit',
      lastAccessed: '2025-01-17T14:20:00Z',
      accessCount: 3,
      securityLevel: 'private'
    },
    {
      id: '3',
      name: 'Healthcare Directive',
      type: 'healthcare',
      sharedBy: 'Michael Johnson',
      sharedWith: ['Sarah Johnson', 'Emma Johnson'],
      permissions: 'view',
      lastAccessed: '2025-01-16T09:15:00Z',
      accessCount: 2,
      securityLevel: 'family'
    }
  ])

  const [messages, setMessages] = useState<FamilyMessage[]>([
    {
      id: '1',
      senderId: '2',
      senderName: 'Michael Johnson',
      content: 'Sarah, I reviewed the trust document changes. Everything looks good to me. Should we schedule a family meeting to discuss?',
      timestamp: '2025-01-20T14:30:00Z',
      type: 'text',
      priority: 'medium',
      readBy: ['1'],
      attachments: []
    },
    {
      id: '2',
      senderId: '3',
      senderName: 'Emma Johnson',
      content: 'Mom, Dad - I wanted to let you know I\'ve been thinking about my own estate planning. Could we talk about this sometime?',
      timestamp: '2025-01-20T11:15:00Z',
      type: 'text',
      priority: 'low',
      readBy: ['1', '2'],
      attachments: []
    },
    {
      id: '3',
      senderId: '4',
      senderName: 'David Smith',
      content: 'I\'ve completed my review of the guardianship documents. Everything is in order and properly structured.',
      timestamp: '2025-01-19T16:45:00Z',
      type: 'document',
      priority: 'medium',
      readBy: ['1'],
      attachments: [
        {
          id: '1',
          name: 'Guardianship_Review_2025.pdf',
          type: 'application/pdf',
          url: '/documents/guardianship-review.pdf'
        }
      ]
    }
  ])

  const [collaborationRooms, setCollaborationRooms] = useState<CollaborationRoom[]>([
    {
      id: '1',
      name: 'Family Estate Planning',
      type: 'planning',
      participants: ['1', '2', '3', '4'],
      activeNow: 2,
      lastActivity: '2025-01-20T14:30:00Z',
      topic: 'Review trust document updates',
      scheduledFor: '2025-01-25T15:00:00Z'
    },
    {
      id: '2',
      name: 'Emergency Preparedness',
      type: 'discussion',
      participants: ['1', '2', '4'],
      activeNow: 1,
      lastActivity: '2025-01-19T10:20:00Z',
      topic: 'Update emergency contact information'
    },
    {
      id: '3',
      name: 'Milestone Celebration',
      type: 'celebration',
      participants: ['1', '2', '3'],
      activeNow: 0,
      lastActivity: '2025-01-18T19:00:00Z',
      topic: 'Emma\'s college graduation planning'
    }
  ])

  const [sofiaMediations, setSofiaMediations] = useState<SofiaMediation[]>([
    {
      id: '1',
      type: 'decision_support',
      title: 'Trust Distribution Discussion',
      description: 'Family members need guidance on how to discuss trust distribution preferences without conflict.',
      participants: ['1', '2', '3'],
      status: 'active',
      priority: 'medium',
      createdAt: '2025-01-19T10:00:00Z'
    },
    {
      id: '2',
      type: 'emotional_support',
      title: 'Estate Planning Anxiety',
      description: 'Emma expressed anxiety about estate planning. Providing emotional support and education.',
      participants: ['3'],
      status: 'resolved',
      priority: 'high',
      createdAt: '2025-01-18T14:30:00Z',
      resolvedAt: '2025-01-18T16:45:00Z',
      outcome: 'Emma now feels more comfortable with the process and has scheduled a family discussion.'
    }
  ])

  // Build family tree structure
  const buildFamilyTree = useCallback((): FamilyTreeNode[] => {
    const tree: FamilyTreeNode[] = []
    const membersMap = new Map(familyMembers.map(m => [m.id, m]))

    // Primary member (Sarah)
    const primary = membersMap.get('1')
    if (primary) {
      tree.push({
        id: '1',
        member: primary,
        children: [],
        spouse: membersMap.get('2'), // Michael
        level: 0
      })
    }

    // Add children
    const emma = membersMap.get('3')
    if (emma && tree[0]) {
      tree[0].children.push({
        id: '3',
        member: emma,
        children: [],
        level: 1
      })
    }

    return tree
  }, [familyMembers])

  const familyTree = buildFamilyTree()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'will':
        return 'bg-blue-100 text-blue-600'
      case 'trust':
        return 'bg-purple-100 text-purple-600'
      case 'healthcare':
        return 'bg-green-100 text-green-600'
      case 'financial':
        return 'bg-orange-100 text-orange-600'
      case 'personal':
        return 'bg-pink-100 text-pink-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Liquid animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 30,
      scale: shouldReduceMotion ? 1 : 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: shouldReduceMotion ? 0 : 0.6
      }
    },
    hover: {
      y: shouldReduceMotion ? 0 : -4,
      scale: shouldReduceMotion ? 1 : 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  }

  const renderFamilyTreeNode = (node: FamilyTreeNode, index: number) => (
    <motion.div
      key={node.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="relative"
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                <AvatarImage src={node.member.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
                  {node.member.avatar}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white',
                node.member.status === 'active' ? 'bg-green-500' :
                node.member.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
              )} />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{node.member.name}</h4>
              <p className="text-sm text-gray-600">{node.member.relationship}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(node.member.status)}>
                  {node.member.status}
                </Badge>
                <Badge className={getEngagementColor(node.member.engagementLevel)}>
                  {node.member.engagementLevel} engagement
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{node.member.trustScore}%</span>
              </div>
              <p className="text-xs text-gray-500">{node.member.lastActivity}</p>
            </div>
          </div>

          {/* Milestones */}
          {node.member.milestones.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600 mb-2">Recent Milestones:</p>
              <div className="flex flex-wrap gap-1">
                {node.member.milestones.slice(0, 2).map(milestone => (
                  <Badge
                    key={milestone.id}
                    variant="outline"
                    className={cn(
                      'text-xs',
                      milestone.completed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                    )}
                  >
                    {milestone.completed ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                    {milestone.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderMessageCard = (message: FamilyMessage) => (
    <motion.div
      key={message.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 border-2 border-white shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
            {message.senderName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{message.senderName}</h4>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </span>
            <Badge className={getPriorityColor(message.priority)}>
              {message.priority}
            </Badge>
          </div>

          <p className="text-gray-700 mb-3">{message.content}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Read by: {message.readBy.length} members</span>
            <div className="flex -space-x-1">
              {message.readBy.slice(0, 3).map((readerId, index) => {
                const reader = familyMembers.find(m => m.id === readerId)
                return reader ? (
                  <div
                    key={readerId}
                    className="w-5 h-5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-blue-700"
                    style={{ zIndex: 3 - index }}
                  >
                    {reader.avatar}
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderDocumentCard = (document: SharedDocument) => (
    <motion.div
      key={document.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="cursor-pointer"
      onClick={() => onDocumentShare?.(document)}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                getDocumentTypeColor(document.type)
              )}>
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{document.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{document.type}</p>
              </div>
            </div>
            <Badge className={getPriorityColor(document.securityLevel)}>
              {document.securityLevel}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shared by:</span>
              <span className="font-medium">{document.sharedBy}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shared with:</span>
              <span className="font-medium">{document.sharedWith.length} members</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last accessed:</span>
              <span className="font-medium">{new Date(document.lastAccessed).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Access count:</span>
              <span className="font-medium">{document.accessCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderMilestoneCard = (member: FamilyMember) => (
    <motion.div
      key={member.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 border-2 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
                {member.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{member.name}</h4>
              <p className="text-sm text-gray-600">{member.relationship}</p>
            </div>
          </div>

          <div className="space-y-2">
            {member.milestones.map(milestone => (
              <div
                key={milestone.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg border',
                  milestone.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-center gap-2">
                  {milestone.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    milestone.completed ? 'text-green-700' : 'text-gray-700'
                  )}>
                    {milestone.title}
                  </span>
                </div>
                <div className="text-right">
                  <Badge className={cn(
                    'text-xs',
                    milestone.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  )}>
                    {milestone.type}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(milestone.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderRoomCard = (room: CollaborationRoom) => (
    <motion.div
      key={room.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="cursor-pointer"
      onClick={() => onRoomJoin?.(room)}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                room.type === 'planning' ? 'bg-blue-100 text-blue-600' :
                room.type === 'review' ? 'bg-purple-100 text-purple-600' :
                room.type === 'discussion' ? 'bg-green-100 text-green-600' :
                'bg-pink-100 text-pink-600'
              )}>
                {room.type === 'planning' ? <Calendar className="h-4 w-4" /> :
                 room.type === 'review' ? <Eye className="h-4 w-4" /> :
                 room.type === 'discussion' ? <MessageSquare className="h-4 w-4" /> :
                 <Gift className="h-4 w-4" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{room.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{room.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {room.activeNow > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">{room.activeNow} active</span>
                </div>
              )}
              <Badge className={getStatusColor(room.activeNow > 0 ? 'active' : 'inactive')}>
                {room.activeNow > 0 ? 'Live' : 'Scheduled'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            {room.topic && (
              <p className="text-sm text-gray-700">{room.topic}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {room.participants.length} participants
              </span>
              <span className="text-gray-500">
                Last activity: {new Date(room.lastActivity).toLocaleDateString()}
              </span>
            </div>
            {room.scheduledFor && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Calendar className="h-4 w-4" />
                <span>Scheduled for {new Date(room.scheduledFor).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-8', className)}
    >
      {/* Sofia AI Integration */}
      <SofiaFirefly
        personality={sofiaPersonality}
        context="supporting"
        size="medium"
      />

      {/* Header */}
      <motion.div
        className="text-center space-y-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl -z-10" />
        <motion.div
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Users className="h-4 w-4" />
          Family Collaboration Hub
          <Heart className="h-4 w-4" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your Family's Protection Network
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Connect, share, and protect together. Sofia helps facilitate meaningful family discussions and ensures everyone stays informed.
        </motion.p>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={(value: string) => setSelectedTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="tree">Family Tree</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {familyTree.map(renderFamilyTreeNode)}
          </motion.div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {messages.map(renderMessageCard)}
          </motion.div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sharedDocuments.map(renderDocumentCard)}
          </motion.div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {familyMembers.map(renderMilestoneCard)}
          </motion.div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {collaborationRooms.map(renderRoomCard)}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
