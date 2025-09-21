/**
 * Advanced Analytics Dashboard - Premium Liquid Design
 * Real-time family protection metrics with Sofia AI-powered insights
 */

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Heart,
  Shield,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Target,
  Award,
  Sparkles,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/stubs/ui'
import { Button } from '@/stubs/ui'
import { Badge } from '@/stubs/ui'
import { Separator } from '@/stubs/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/stubs/ui'
import { Label } from '@/stubs/ui'
import { cn } from '@schwalbe/lib/utils'

// Import Sofia AI components
import { SofiaFirefly } from '@/components/sofia-firefly/SofiaFirefly'

interface AnalyticsMetric {
  id: string
  title: string
  value: number | string
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  description: string
  trend: number[]
  color: string
}

interface FamilyMember {
  id: string
  name: string
  role: 'primary' | 'spouse' | 'child' | 'guardian'
  status: 'active' | 'pending' | 'inactive'
  lastActivity: string
  completionPercentage: number
  avatar: string
}

interface DocumentStatus {
  id: string
  name: string
  type: 'will' | 'trust' | 'healthcare' | 'financial' | 'digital'
  status: 'complete' | 'in_progress' | 'pending' | 'expired'
  lastUpdated: string
  priority: 'high' | 'medium' | 'low'
  assignedTo?: string
}

interface GuardianNetwork {
  id: string
  name: string
  relationship: string
  status: 'active' | 'pending' | 'inactive'
  lastContact: string
  trustScore: number
  responseTime: string
}

interface SofiaInsight {
  id: string
  type: 'warning' | 'success' | 'info' | 'celebration'
  title: string
  message: string
  actionRequired: boolean
  priority: 'high' | 'medium' | 'low'
  timestamp: string
  category: 'documents' | 'guardians' | 'family' | 'protection'
}

interface AnalyticsDashboardProps {
  className?: string
  onDocumentClick?: (document: DocumentStatus) => void
  onGuardianClick?: (guardian: GuardianNetwork) => void
  onFamilyMemberClick?: (member: FamilyMember) => void
}

export function AnalyticsDashboard({
  onDocumentClick,
  onGuardianClick,
  onFamilyMemberClick,
  className,
}: AnalyticsDashboardProps) {
  const { t } = useTranslation('ui/analytics')
  const shouldReduceMotion = useReducedMotion()

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sofiaPersonality, setSofiaPersonality] = useState<'nurturing' | 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'confident'>('nurturing')

  // Mock data - in real app, this would come from APIs
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    {
      id: 'family-protection',
      title: 'Family Protection Score',
      value: 92,
      change: 5,
      changeType: 'positive',
      icon: <Shield className="h-5 w-5" />,
      description: 'Overall family protection readiness',
      trend: [85, 87, 89, 90, 92],
      color: 'blue'
    },
    {
      id: 'documents-complete',
      title: 'Documents Complete',
      value: '8/12',
      change: 2,
      changeType: 'positive',
      icon: <FileText className="h-5 w-5" />,
      description: 'Essential legal documents completed',
      trend: [6, 7, 7, 8, 8],
      color: 'green'
    },
    {
      id: 'guardian-response',
      title: 'Guardian Response Time',
      value: '2.3h',
      change: -0.4,
      changeType: 'positive',
      icon: <Clock className="h-5 w-5" />,
      description: 'Average response time from guardians',
      trend: [3.1, 2.9, 2.7, 2.5, 2.3],
      color: 'purple'
    },
    {
      id: 'family-engagement',
      title: 'Family Engagement',
      value: 87,
      change: -3,
      changeType: 'negative',
      icon: <Users className="h-5 w-5" />,
      description: 'Family members actively participating',
      trend: [90, 89, 88, 87, 87],
      color: 'orange'
    }
  ])

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'primary',
      status: 'active',
      lastActivity: '2 hours ago',
      completionPercentage: 95,
      avatar: 'SJ'
    },
    {
      id: '2',
      name: 'Michael Johnson',
      role: 'spouse',
      status: 'active',
      lastActivity: '1 day ago',
      completionPercentage: 88,
      avatar: 'MJ'
    },
    {
      id: '3',
      name: 'Emma Johnson',
      role: 'child',
      status: 'pending',
      lastActivity: '3 days ago',
      completionPercentage: 45,
      avatar: 'EJ'
    },
    {
      id: '4',
      name: 'David Smith',
      role: 'guardian',
      status: 'active',
      lastActivity: '5 hours ago',
      completionPercentage: 100,
      avatar: 'DS'
    }
  ])

  const [documents, setDocuments] = useState<DocumentStatus[]>([
    {
      id: '1',
      name: 'Last Will and Testament',
      type: 'will',
      status: 'complete',
      lastUpdated: '2025-01-15',
      priority: 'high',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: '2',
      name: 'Living Trust',
      type: 'trust',
      status: 'in_progress',
      lastUpdated: '2025-01-10',
      priority: 'high',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: '3',
      name: 'Healthcare Directive',
      type: 'healthcare',
      status: 'pending',
      lastUpdated: '2024-12-20',
      priority: 'medium'
    },
    {
      id: '4',
      name: 'Financial Power of Attorney',
      type: 'financial',
      status: 'expired',
      lastUpdated: '2024-06-15',
      priority: 'high'
    }
  ])

  const [guardians, setGuardians] = useState<GuardianNetwork[]>([
    {
      id: '1',
      name: 'David Smith',
      relationship: 'Brother',
      status: 'active',
      lastContact: '2 hours ago',
      trustScore: 95,
      responseTime: '1.2h'
    },
    {
      id: '2',
      name: 'Lisa Chen',
      relationship: 'Sister-in-law',
      status: 'active',
      lastContact: '1 day ago',
      trustScore: 92,
      responseTime: '2.8h'
    },
    {
      id: '3',
      name: 'Robert Johnson',
      relationship: 'Uncle',
      status: 'pending',
      lastContact: '1 week ago',
      trustScore: 78,
      responseTime: '24h+'
    }
  ])

  const [sofiaInsights, setSofiaInsights] = useState<SofiaInsight[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Document Expiration Alert',
      message: 'Your Financial Power of Attorney expired 6 months ago and needs immediate attention.',
      actionRequired: true,
      priority: 'high',
      timestamp: '2025-01-20T10:30:00Z',
      category: 'documents'
    },
    {
      id: '2',
      type: 'celebration',
      title: 'Protection Milestone Reached!',
      message: 'Congratulations! Your family protection score has reached 92% - you\'re doing great!',
      actionRequired: false,
      priority: 'medium',
      timestamp: '2025-01-19T14:15:00Z',
      category: 'protection'
    },
    {
      id: '3',
      type: 'info',
      title: 'Guardian Network Update',
      message: 'Emma has been inactive for 3 days. Consider reaching out to ensure everything is okay.',
      actionRequired: false,
      priority: 'medium',
      timestamp: '2025-01-18T09:45:00Z',
      category: 'family'
    }
  ])

  // Simulate real-time updates
  const refreshData = useCallback(async () => {
    setIsRefreshing(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update metrics with slight random changes
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: typeof metric.value === 'number'
        ? Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 2))
        : metric.value,
      change: metric.change + (Math.random() - 0.5) * 1
    })))

    setIsRefreshing(false)
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'expired':
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const renderMetricCard = (metric: AnalyticsMetric) => (
    <motion.div
      key={metric.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 border-2 border-transparent hover:border-blue-200/50 hover:shadow-xl transition-all duration-500 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={cn(
              'p-3 rounded-xl bg-gradient-to-br shadow-lg',
              getMetricColor(metric.color)
            )}>
              <div className="text-white">
                {metric.icon}
              </div>
            </div>
            <div className="text-right">
              <motion.div
                className={cn(
                  'text-2xl font-bold',
                  metric.changeType === 'positive' ? 'text-green-600' :
                  metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {typeof metric.value === 'number' ? `${metric.value}%` : metric.value}
              </motion.div>
              <motion.div
                className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  metric.changeType === 'positive' ? 'text-green-600' :
                  metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                )}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {metric.changeType === 'positive' ? '+' : ''}
                {metric.change}%
                <TrendingUp className="h-3 w-3" />
              </motion.div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h3 className="font-semibold text-gray-900 mb-1">{metric.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{metric.description}</p>

          {/* Mini trend chart */}
          <div className="flex items-end gap-1 h-8">
            {metric.trend.map((value, index) => (
              <motion.div
                key={index}
                className={cn(
                  'flex-1 rounded-sm',
                  getMetricColor(metric.color).replace('from-', 'bg-').replace('to-', '/')
                )}
                style={{
                  height: `${(value / 100) * 100}%`,
                  opacity: 0.3 + (index / metric.trend.length) * 0.7
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderFamilyMemberCard = (member: FamilyMember) => (
    <motion.div
      key={member.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="cursor-pointer"
      onClick={() => onFamilyMemberClick?.(member)}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700">
                {member.avatar}
              </div>
              <div className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                member.status === 'active' ? 'bg-green-500' :
                member.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
              )} />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{member.role}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${member.completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{member.completionPercentage}%</span>
              </div>
            </div>

            <div className="text-right">
              <Badge className={getStatusColor(member.status)}>
                {member.status}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">{member.lastActivity}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderDocumentCard = (document: DocumentStatus) => (
    <motion.div
      key={document.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="cursor-pointer"
      onClick={() => onDocumentClick?.(document)}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                document.type === 'will' ? 'bg-blue-100 text-blue-600' :
                document.type === 'trust' ? 'bg-purple-100 text-purple-600' :
                document.type === 'healthcare' ? 'bg-green-100 text-green-600' :
                document.type === 'financial' ? 'bg-orange-100 text-orange-600' :
                'bg-gray-100 text-gray-600'
              )}>
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{document.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{document.type.replace('_', ' ')}</p>
              </div>
            </div>
            <Badge className={getPriorityColor(document.priority)}>
              {document.priority}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(document.status)}>
              {document.status.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-gray-500">
              Updated {new Date(document.lastUpdated).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderGuardianCard = (guardian: GuardianNetwork) => (
    <motion.div
      key={guardian.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="cursor-pointer"
      onClick={() => onGuardianClick?.(guardian)}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-700">
              {guardian.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{guardian.name}</h4>
              <p className="text-sm text-gray-600">{guardian.relationship}</p>
            </div>
            <Badge className={getStatusColor(guardian.status)}>
              {guardian.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Trust Score</p>
              <p className="font-semibold text-green-600">{guardian.trustScore}%</p>
            </div>
            <div>
              <p className="text-gray-600">Response Time</p>
              <p className="font-semibold text-blue-600">{guardian.responseTime}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">Last contact: {guardian.lastContact}</p>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderSofiaInsight = (insight: SofiaInsight) => (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-4 rounded-xl border-l-4',
        insight.type === 'warning' ? 'bg-red-50 border-red-400' :
        insight.type === 'success' ? 'bg-green-50 border-green-400' :
        insight.type === 'celebration' ? 'bg-purple-50 border-purple-400' :
        'bg-blue-50 border-blue-400'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-lg',
          insight.type === 'warning' ? 'bg-red-100 text-red-600' :
          insight.type === 'success' ? 'bg-green-100 text-green-600' :
          insight.type === 'celebration' ? 'bg-purple-100 text-purple-600' :
          'bg-blue-100 text-blue-600'
        )}>
          {insight.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
           insight.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
           insight.type === 'celebration' ? <Sparkles className="h-4 w-4" /> :
           <Eye className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
          <div className="flex items-center justify-between">
            <Badge className={getPriorityColor(insight.priority)}>
              {insight.priority} priority
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(insight.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
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
        context="guiding"
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
          <BarChart3 className="h-4 w-4" />
          Family Protection Analytics
          <Sparkles className="h-4 w-4" />
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your Family's Protection at a Glance
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Real-time insights into your family's protection status, document completion, and guardian network health.
        </motion.p>

        {/* Controls */}
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Timeframe:</Label>
            <div className="flex rounded-lg border-2 border-gray-200">
              {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
                <motion.button
                  key={timeframe}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={cn(
                    'px-3 py-1 text-sm font-medium transition-colors',
                    selectedTimeframe === timeframe
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {timeframe}
                </motion.button>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={isRefreshing}
              className="gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map(renderMetricCard)}
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Sofia Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Sofia's Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sofiaInsights.map(renderSofiaInsight)}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Protection Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Essential Documents</span>
                      <span className="font-semibold text-green-600">8/12 Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Guardian Network</span>
                      <span className="font-semibold text-blue-600">3/5 Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Family Engagement</span>
                      <span className="font-semibold text-purple-600">87% Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Protection Score 90%+</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">All Critical Documents Complete</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Guardian Network Established</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="family" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {familyMembers.map(renderFamilyMemberCard)}
          </motion.div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {documents.map(renderDocumentCard)}
          </motion.div>
        </TabsContent>

        <TabsContent value="guardians" className="space-y-6 mt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {guardians.map(renderGuardianCard)}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}