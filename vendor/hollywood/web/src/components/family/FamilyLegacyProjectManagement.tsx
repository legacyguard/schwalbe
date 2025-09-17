
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  AlertCircle,
  Archive,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  FileText,
  FolderOpen,
  MessageCircle,
  Plus,
  Star,
  Target,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FamilyMember {
  availability: 'full-time' | 'limited' | 'part-time' | 'unavailable';
  avatar?: string;
  email: string;
  expertise: string[];
  id: string;
  name: string;
  role: 'contributor' | 'project-manager' | 'reviewer' | 'viewer';
}

interface Task {
  actualHours?: number;
  assigneeId: string;
  assigneeName: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  completedAt?: Date;
  dependencies: string[];
  description: string;
  dueDate?: Date;
  estimatedHours: number;
  id: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
  status: 'blocked' | 'completed' | 'in-progress' | 'review' | 'todo';
  tags: string[];
  title: string;
}

interface TaskComment {
  content: string;
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

interface TaskAttachment {
  fileName: string;
  fileSize: number;
  fileUrl: string;
  id: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface Milestone {
  associatedTasks: string[];
  completedAt?: Date;
  description: string;
  dueDate: Date;
  id: string;
  isCompleted: boolean;
  rewards?: string;
  title: string;
}

interface LegacyProject {
  actualCost?: number;
  budget?: number;
  category:
    | 'asset-management'
    | 'custom'
    | 'document-organization'
    | 'emergency-planning'
    | 'family-history'
    | 'trust-setup'
    | 'will-creation';
  completedDate?: Date;
  description: string;
  id: string;
  milestones: Milestone[];
  ownerId: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
  progress: number;
  resources: ProjectResource[];
  settings: {
    allowTeamInvites: boolean;
    isPrivate: boolean;
    requiresApproval: boolean;
  };
  startDate: Date;
  status: 'active' | 'archived' | 'completed' | 'on-hold' | 'planning';
  tags: string[];
  targetDate?: Date;
  tasks: Task[];
  teamMembers: FamilyMember[];
  title: string;
}

interface ProjectResource {
  addedAt: Date;
  addedBy: string;
  description?: string;
  id: string;
  name: string;
  type: 'contact' | 'document' | 'link' | 'template';
  url: string;
}

interface ProjectTemplate {
  category: LegacyProject['category'];
  description: string;
  estimatedDuration: string;
  icon: React.ReactNode;
  id: string;
  milestones: Omit<Milestone, 'associatedTasks' | 'id' | 'isCompleted'>[];
  name: string;
  requiredRoles: string[];
  tasks: Omit<
    Task,
    'assigneeId' | 'assigneeName' | 'attachments' | 'comments' | 'id'
  >[];
}

const getProjectTemplates = (t: (key: string) => string): ProjectTemplate[] => [
  {
    id: 'comprehensive-will',
    name: t('templates.comprehensiveWill.name'),
    description: t('templates.comprehensiveWill.description'),
    category: 'will-creation',
    estimatedDuration: t('templates.comprehensiveWill.estimatedDuration'),
    tasks: [
      {
        title: t('templates.comprehensiveWill.tasks.gatherInfo.title'),
        description: t('templates.comprehensiveWill.tasks.gatherInfo.description'),
        status: 'todo',
        priority: 'high',
        estimatedHours: 8,
        dependencies: [],
        tags: ['information-gathering', 'assets'],
      },
      {
        title: t('templates.comprehensiveWill.tasks.defineBeneficiaries.title'),
        description: t('templates.comprehensiveWill.tasks.defineBeneficiaries.description'),
        status: 'todo',
        priority: 'high',
        estimatedHours: 4,
        dependencies: [],
        tags: ['beneficiaries', 'inheritance'],
      },
      {
        title: t('templates.comprehensiveWill.tasks.draftWill.title'),
        description: t('templates.comprehensiveWill.tasks.draftWill.description'),
        status: 'todo',
        priority: 'medium',
        estimatedHours: 6,
        dependencies: [],
        tags: ['drafting', 'legal'],
      },
      {
        title: t('templates.comprehensiveWill.tasks.familyReview.title'),
        description: t('templates.comprehensiveWill.tasks.familyReview.description'),
        status: 'todo',
        priority: 'medium',
        estimatedHours: 4,
        dependencies: [],
        tags: ['family-review', 'feedback'],
      },
      {
        title: t('templates.comprehensiveWill.tasks.legalReview.title'),
        description: t('templates.comprehensiveWill.tasks.legalReview.description'),
        status: 'todo',
        priority: 'critical',
        estimatedHours: 3,
        dependencies: [],
        tags: ['legal-review', 'attorney'],
      },
      {
        title: t('templates.comprehensiveWill.tasks.finalizeWill.title'),
        description: t('templates.comprehensiveWill.tasks.finalizeWill.description'),
        status: 'todo',
        priority: 'critical',
        estimatedHours: 2,
        dependencies: [],
        tags: ['execution', 'signing'],
      },
    ],
    milestones: [
      {
        title: t('templates.comprehensiveWill.milestones.infoComplete.title'),
        description: t('templates.comprehensiveWill.milestones.infoComplete.description'),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rewards: t('templates.comprehensiveWill.milestones.infoComplete.rewards'),
      },
      {
        title: t('templates.comprehensiveWill.milestones.firstDraft.title'),
        description: t('templates.comprehensiveWill.milestones.firstDraft.description'),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        rewards: t('templates.comprehensiveWill.milestones.firstDraft.rewards'),
      },
      {
        title: t('templates.comprehensiveWill.milestones.willExecuted.title'),
        description: t('templates.comprehensiveWill.milestones.willExecuted.description'),
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        rewards: t('templates.comprehensiveWill.milestones.willExecuted.rewards'),
      },
    ],
    requiredRoles: ['project-manager', 'legal-advisor', 'family-members'],
    icon: <FileText className='h-4 w-4' />,
  },
  {
    id: 'emergency-planning',
    name: t('templates.emergencyPlanning.name'),
    description: t('templates.emergencyPlanning.description'),
    category: 'emergency-planning',
    estimatedDuration: t('templates.emergencyPlanning.estimatedDuration'),
    tasks: [
      {
        title: t('templates.emergencyPlanning.tasks.contactDatabase.title'),
        description: t('templates.emergencyPlanning.tasks.contactDatabase.description'),
        status: 'todo',
        priority: 'high',
        estimatedHours: 3,
        dependencies: [],
        tags: ['contacts', 'emergency'],
      },
      {
        title: t('templates.emergencyPlanning.tasks.procedures.title'),
        description: t('templates.emergencyPlanning.tasks.procedures.description'),
        status: 'todo',
        priority: 'high',
        estimatedHours: 6,
        dependencies: [],
        tags: ['procedures', 'response'],
      },
      {
        title: t('templates.emergencyPlanning.tasks.emergencyKits.title'),
        description: t('templates.emergencyPlanning.tasks.emergencyKits.description'),
        status: 'todo',
        priority: 'medium',
        estimatedHours: 8,
        dependencies: [],
        tags: ['emergency-kit', 'supplies'],
      },
    ],
    milestones: [
      {
        title: t('templates.emergencyPlanning.milestones.contactsEstablished.title'),
        description: t('templates.emergencyPlanning.milestones.contactsEstablished.description'),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        rewards: t('templates.emergencyPlanning.milestones.contactsEstablished.rewards'),
      },
      {
        title: t('templates.emergencyPlanning.milestones.planComplete.title'),
        description: t('templates.emergencyPlanning.milestones.planComplete.description'),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        rewards: t('templates.emergencyPlanning.milestones.planComplete.rewards'),
      },
    ],
    requiredRoles: ['project-manager', 'family-members'],
    icon: <AlertCircle className='h-4 w-4' />,
  },
  {
    id: 'family-history',
    name: t('templates.familyHistory.name'),
    description: t('templates.familyHistory.description'),
    category: 'family-history',
    estimatedDuration: t('templates.familyHistory.estimatedDuration'),
    tasks: [
      {
        title: t('templates.familyHistory.tasks.interviews.title'),
        description: t('templates.familyHistory.tasks.interviews.description'),
        status: 'todo',
        priority: 'high',
        estimatedHours: 20,
        dependencies: [],
        tags: ['interviews', 'stories', 'memories'],
      },
      {
        title: t('templates.familyHistory.tasks.digitizePhotos.title'),
        description: t('templates.familyHistory.tasks.digitizePhotos.description'),
        status: 'todo',
        priority: 'medium',
        estimatedHours: 15,
        dependencies: [],
        tags: ['photos', 'digitization'],
      },
      {
        title: t('templates.familyHistory.tasks.familyTree.title'),
        description: t('templates.familyHistory.tasks.familyTree.description'),
        status: 'todo',
        priority: 'medium',
        estimatedHours: 12,
        dependencies: [],
        tags: ['genealogy', 'family-tree'],
      },
    ],
    milestones: [
      {
        title: t('templates.familyHistory.milestones.interviewsComplete.title'),
        description: t('templates.familyHistory.milestones.interviewsComplete.description'),
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        rewards: t('templates.familyHistory.milestones.interviewsComplete.rewards'),
      },
      {
        title: t('templates.familyHistory.milestones.archiveComplete.title'),
        description: t('templates.familyHistory.milestones.archiveComplete.description'),
        dueDate: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000),
        rewards: t('templates.familyHistory.milestones.archiveComplete.rewards'),
      },
    ],
    requiredRoles: ['project-manager', 'family-historian', 'family-members'],
    icon: <Archive className='h-4 w-4' />,
  },
];

interface FamilyLegacyProjectManagementProps {
  existingProjects?: LegacyProject[];
  familyMembers?: FamilyMember[];
  onProjectCreated?: (project: LegacyProject) => void;
}

export const FamilyLegacyProjectManagement: React.FC<
  FamilyLegacyProjectManagementProps
> = ({ familyMembers: _familyMembers = [], onProjectCreated, existingProjects = [] }) => {
  const { t } = useTranslation('ui/family-legacy');
  const [projects, setProjects] = useState<LegacyProject[]>(existingProjects);
  const [activeProject, setActiveProject] = useState<LegacyProject | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [_selectedTemplate, setSelectedTemplate] =
    useState<null | ProjectTemplate>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'kanban' | 'list'>(
    'kanban'
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentUserId] = useState('current-user-id');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [_editingTask, _setEditingTask] = useState<null | Task>(null);

  // Get project templates
  const projectTemplates = getProjectTemplates(t);

  // Mock current user
  const currentUser: FamilyMember = {
    id: currentUserId,
    name: t('misc.you'),
    email: 'user@example.com',
    role: 'project-manager',
    expertise: ['project-management', 'legal-planning'],
    availability: 'full-time',
  };

  // const __allMembers = [currentUser, ...familyMembers]; // Unused

  const createProjectFromTemplate = (template: ProjectTemplate) => {
    const newProject: LegacyProject = {
      id: `project-${Date.now()}`,
      title: template.name,
      description: template.description,
      category: template.category,
      status: 'planning',
      priority: 'medium',
      ownerId: currentUserId,
      teamMembers: [currentUser],
      tasks: template.tasks.map((task, index) => ({
        ...task,
        id: `task-${Date.now()}-${index}`,
        assigneeId: currentUserId,
        assigneeName: currentUser.name,
        comments: [],
        attachments: [],
      })),
      milestones: template.milestones.map((milestone, index) => ({
        ...milestone,
        id: `milestone-${Date.now()}-${index}`,
        associatedTasks: [],
        isCompleted: false,
      })),
      startDate: new Date(),
      targetDate: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000), // 6 weeks from now
      progress: 0,
      tags: [template.category],
      resources: [],
      settings: {
        isPrivate: false,
        requiresApproval: false,
        allowTeamInvites: true,
      },
    };

    setProjects([...projects, newProject]);
    setActiveProject(newProject);
    onProjectCreated?.(newProject);
    setIsCreating(false);
    setSelectedTemplate(null);
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    if (!activeProject) return;

    const updatedTasks = activeProject.tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : undefined,
        };
        return updatedTask;
      }
      return task;
    });

    const completedTasks = updatedTasks.filter(
      t => t.status === 'completed'
    ).length;
    const progress = Math.round((completedTasks / updatedTasks.length) * 100);

    const updatedProject = {
      ...activeProject,
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'completed' : activeProject.status,
      completedDate: progress === 100 ? new Date() : undefined,
    };

    setActiveProject(updatedProject);
    setProjects(
      projects.map(p => (p.id === activeProject.id ? updatedProject : p))
    );
  };

  const createNewTask = (taskData: Partial<Task>) => {
    if (!activeProject) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || t('misc.newTask'),
      description: taskData.description || '',
      assigneeId: taskData.assigneeId || currentUserId,
      assigneeName: taskData.assigneeName || currentUser.name,
      status: 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours || 1,
      dependencies: [],
      tags: taskData.tags || [],
      comments: [],
      attachments: [],
    };

    const updatedProject = {
      ...activeProject,
      tasks: [...activeProject.tasks, newTask],
    };

    setActiveProject(updatedProject);
    setProjects(
      projects.map(p => (p.id === activeProject.id ? updatedProject : p))
    );
    setShowTaskForm(false);
  };

  const getStatusColor = (status: LegacyProject['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (
    priority: LegacyProject['priority'] | Task['priority']
  ) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects.filter(
    project => filterStatus === 'all' || project.status === filterStatus
  );

  const tasksByStatus = activeProject
    ? {
        todo: activeProject.tasks.filter(t => t.status === 'todo'),
        'in-progress': activeProject.tasks.filter(
          t => t.status === 'in-progress'
        ),
        review: activeProject.tasks.filter(t => t.status === 'review'),
        completed: activeProject.tasks.filter(t => t.status === 'completed'),
        blocked: activeProject.tasks.filter(t => t.status === 'blocked'),
      }
    : { todo: [], 'in-progress': [], review: [], completed: [], blocked: [] };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            {t('header.title')}
          </h2>
          <p className='text-gray-600'>
            {t('header.subtitle')}
          </p>
        </div>
        <div className='flex gap-2'>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder={t('filters.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('filters.allProjects')}</SelectItem>
              <SelectItem value='planning'>{t('filters.planning')}</SelectItem>
              <SelectItem value='active'>{t('filters.active')}</SelectItem>
              <SelectItem value='completed'>{t('filters.completed')}</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='h-4 w-4' />
                {t('navigation.newProject')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-6xl max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>{t('projectCreation.title')}</DialogTitle>
              </DialogHeader>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                {projectTemplates.map((template: ProjectTemplate) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className='cursor-pointer hover:border-blue-300 transition-colors h-full'
                      onClick={() => createProjectFromTemplate(template)}
                    >
                      <CardContent className='p-6'>
                        <div className='flex items-start gap-3'>
                          <div className='p-2 bg-blue-50 rounded-lg'>
                            {template.icon}
                          </div>
                          <div className='flex-1'>
                            <h3 className='font-medium text-gray-900'>
                              {template.name}
                            </h3>
                            <p className='text-sm text-gray-600 mt-1'>
                              {template.description}
                            </p>
                            <div className='flex items-center gap-2 mt-3'>
                              <Badge variant='outline' className='text-xs'>
                                {t(`categories.${template.category}`)}
                              </Badge>
                              <Badge variant='secondary' className='text-xs'>
                                {template.estimatedDuration}
                              </Badge>
                            </div>
                            <div className='mt-3 text-xs text-gray-500'>
                              {template.tasks.length} {t('projectDetails.tasks').toLowerCase()} •{' '}
                              {template.milestones.length} {t('projectDetails.milestones').toLowerCase()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className='flex justify-end gap-2 mt-4'>
                <Button variant='outline' onClick={() => setIsCreating(false)}>
                  {t('navigation.cancel')}
                </Button>
                <Button variant='outline'>{t('projectCreation.createCustomProject')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Project Detail View */}
      {activeProject && (
        <Card className='border-2 border-blue-200'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <CardTitle className='text-xl'>
                    {activeProject.title}
                  </CardTitle>
                  <Badge className={getStatusColor(activeProject.status)}>
                    {t(`filters.${activeProject.status}`)}
                  </Badge>
                  <Badge className={getPriorityColor(activeProject.priority)}>
                    {t(`priorities.${activeProject.priority}`)}
                  </Badge>
                </div>
                <p className='text-gray-600'>{activeProject.description}</p>
                <div className='flex items-center gap-4 mt-3 text-sm text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <CalendarIcon className='h-4 w-4' />
                    {t('projectDetails.started')} {activeProject.startDate.toLocaleDateString()}
                  </div>
                  {activeProject.targetDate && (
                    <div className='flex items-center gap-1'>
                      <Target className='h-4 w-4' />
                      {t('projectDetails.due')} {activeProject.targetDate.toLocaleDateString()}
                    </div>
                  )}
                  <div className='flex items-center gap-1'>
                    <Users className='h-4 w-4' />
                    {activeProject.teamMembers.length} {t('projectDetails.members')}
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <Select
                  value={viewMode}
                  onValueChange={(value: 'calendar' | 'kanban' | 'list') =>
                    setViewMode(value)
                  }
                >
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='kanban'>{t('viewModes.kanban')}</SelectItem>
                    <SelectItem value='list'>{t('viewModes.list')}</SelectItem>
                    <SelectItem value='calendar'>{t('viewModes.calendar')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant='outline'
                  onClick={() => setActiveProject(null)}
                >
                  {t('navigation.close')}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='mt-4'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium'>{t('projectDetails.projectProgress')}</span>
                <span className='text-sm text-gray-500'>
                  {activeProject.progress}%
                </span>
              </div>
              <Progress value={activeProject.progress} className='h-2' />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='tasks' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='tasks'>{t('projectDetails.tasks')}</TabsTrigger>
                <TabsTrigger value='milestones'>{t('projectDetails.milestones')}</TabsTrigger>
                <TabsTrigger value='team'>{t('projectDetails.team')}</TabsTrigger>
                <TabsTrigger value='resources'>{t('projectDetails.resources')}</TabsTrigger>
              </TabsList>

              <TabsContent value='tasks' className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium'>
                    {t('projectDetails.tasks')} ({activeProject.tasks.length})
                  </h3>
                  <Button
                    size='sm'
                    onClick={() => setShowTaskForm(true)}
                    className='gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    {t('taskManagement.addTask')}
                  </Button>
                </div>

                {/* Kanban Board */}
                {viewMode === 'kanban' && (
                  <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                    {Object.entries(tasksByStatus).map(([status, tasks]) => (
                      <div key={status} className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-medium text-sm text-gray-700 uppercase tracking-wide'>
                            {t(`statuses.${status === 'in-progress' ? 'inProgress' : status}`)} ({tasks.length})
                          </h4>
                        </div>
                        <div className='space-y-2 min-h-[200px]'>
                          <AnimatePresence>
                            {tasks.map(task => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                layout
                              >
                                <Card className='hover:shadow-md transition-shadow cursor-pointer'>
                                  <CardContent className='p-3'>
                                    <div className='flex items-start justify-between mb-2'>
                                      <h5 className='font-medium text-sm'>
                                        {task.title}
                                      </h5>
                                      <Badge
                                        className={getPriorityColor(
                                          task.priority
                                        )}
                                      >
                                        {t(`priorities.${task.priority}`)}
                                      </Badge>
                                    </div>
                                    <p className='text-xs text-gray-600 mb-3 line-clamp-2'>
                                      {task.description}
                                    </p>

                                    <div className='flex items-center justify-between'>
                                      <div className='flex items-center gap-1'>
                                        <Avatar className='w-5 h-5'>
                                          <AvatarFallback className='text-xs'>
                                            {task.assigneeName.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className='text-xs text-gray-500'>
                                          {task.assigneeName}
                                        </span>
                                      </div>
                                      {task.dueDate && (
                                        <div className='flex items-center gap-1 text-xs text-gray-500'>
                                          <CalendarIcon className='h-3 w-3' />
                                          {task.dueDate.toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>

                                    <div className='flex gap-1 mt-2'>
                                      {[
                                        'todo',
                                        'in-progress',
                                        'review',
                                        'completed',
                                        'blocked',
                                      ].map(newStatus => (
                                        <Button
                                          key={newStatus}
                                          size='sm'
                                          variant={
                                            task.status === newStatus
                                              ? 'default'
                                              : 'outline'
                                          }
                                          onClick={() =>
                                            updateTaskStatus(
                                              task.id,
                                              newStatus as Task['status']
                                            )
                                          }
                                          className='text-xs h-6 px-2'
                                        >
                                          {newStatus === 'in-progress'
                                            ? t('taskManagement.progress')
                                            : t(`statuses.${newStatus === 'in-progress' ? 'inProgress' : newStatus}`)}
                                        </Button>
                                      ))}
                                    </div>

                                    {task.comments.length > 0 && (
                                      <div className='flex items-center gap-1 mt-2 text-xs text-gray-500'>
                                        <MessageCircle className='h-3 w-3' />
                                        {task.comments.length} {t('taskManagement.comments')}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Task Creation Form */}
                <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('taskManagement.createNewTask')}</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <Input placeholder={t('taskManagement.taskTitle')} />
                      <Textarea placeholder={t('taskManagement.taskDescription')} rows={3} />
                      <div className='grid grid-cols-2 gap-4'>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={t('taskManagement.assignee')} />
                          </SelectTrigger>
                          <SelectContent>
                            {activeProject.teamMembers.map(member => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={t('taskManagement.priority')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='low'>{t('priorities.low')}</SelectItem>
                            <SelectItem value='medium'>{t('priorities.medium')}</SelectItem>
                            <SelectItem value='high'>{t('priorities.high')}</SelectItem>
                            <SelectItem value='critical'>{t('priorities.critical')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        type='number'
                        placeholder={t('taskManagement.estimatedHours')}
                        min='1'
                      />
                      <Button
                        onClick={() =>
                          createNewTask({
                            title: t('misc.newTask'),
                            description: t('taskManagement.taskDescription'),
                          })
                        }
                        className='w-full'
                      >
                        {t('taskManagement.createTask')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value='milestones' className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium'>
                    {t('projectDetails.milestones')} ({activeProject.milestones.length})
                  </h3>
                  <Button size='sm' className='gap-2'>
                    <Plus className='h-4 w-4' />
                    {t('milestones.addMilestone')}
                  </Button>
                </div>

                <div className='space-y-3'>
                  {activeProject.milestones.map(milestone => (
                    <Card
                      key={milestone.id}
                      className={
                        milestone.isCompleted
                          ? 'bg-green-50 border-green-200'
                          : ''
                      }
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <h4 className='font-medium'>{milestone.title}</h4>
                              {milestone.isCompleted ? (
                                <CheckCircle className='h-5 w-5 text-green-600' />
                              ) : (
                                <Clock className='h-5 w-5 text-gray-400' />
                              )}
                            </div>
                            <p className='text-sm text-gray-600 mt-1'>
                              {milestone.description}
                            </p>
                            {milestone.rewards && (
                              <div className='flex items-center gap-1 mt-2 text-sm text-blue-600'>
                                <Star className='h-4 w-4' />
                                {milestone.rewards}
                              </div>
                            )}
                          </div>
                          <div className='text-right'>
                            <div className='text-sm text-gray-500'>
                              {t('projectDetails.due')}: {milestone.dueDate.toLocaleDateString()}
                            </div>
                            {milestone.isCompleted && milestone.completedAt && (
                              <div className='text-sm text-green-600'>
                                {t('milestones.completed')}{' '}
                                {milestone.completedAt.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='team' className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium'>
                    {t('team.teamMembers')} ({activeProject.teamMembers.length})
                  </h3>
                  <Button size='sm' className='gap-2'>
                    <Plus className='h-4 w-4' />
                    {t('team.addMember')}
                  </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {activeProject.teamMembers.map(member => (
                    <Card key={member.id}>
                      <CardContent className='p-4'>
                        <div className='flex items-center gap-3'>
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <div className='font-medium'>{member.name}</div>
                            <div className='text-sm text-gray-500'>
                              {member.email}
                            </div>
                            <div className='flex items-center gap-2 mt-1'>
                              <Badge variant='outline' className='text-xs'>
                                {t(`roles.${member.role === 'project-manager' ? 'project-manager' : member.role}`)}
                              </Badge>
                              <Badge variant='secondary' className='text-xs'>
                                {t(`availability.${member.availability === 'full-time' ? 'full-time' : member.availability === 'part-time' ? 'part-time' : member.availability}`)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {member.expertise.length > 0 && (
                          <div className='mt-3'>
                            <div className='text-xs text-gray-500 mb-1'>
                              {t('team.expertise')}
                            </div>
                            <div className='flex flex-wrap gap-1'>
                              {member.expertise.map(skill => (
                                <Badge
                                  key={skill}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='resources' className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium'>
                    {t('resources.projectResources')} ({activeProject.resources.length})
                  </h3>
                  <Button size='sm' className='gap-2'>
                    <Plus className='h-4 w-4' />
                    {t('resources.addResource')}
                  </Button>
                </div>

                <div className='text-center py-8 text-gray-500'>
                  <FolderOpen className='h-12 w-12 mx-auto mb-3 text-gray-300' />
                  <p>{t('resources.noResourcesTitle')}</p>
                  <p className='text-sm'>
                    {t('resources.noResourcesSubtitle')}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Project List */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.map(project => (
          <motion.div
            key={project.id}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className='hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => setActiveProject(project)}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>{project.title}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {t(`filters.${project.status}`)}
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    {t(`categories.${project.category}`)}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {t(`priorities.${project.priority}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
                  {project.description}
                </p>

                <div className='space-y-3'>
                  <div>
                    <div className='flex items-center justify-between text-sm mb-1'>
                      <span>{t('projectList.progress')}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className='h-2' />
                  </div>

                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <CheckCircle className='h-3 w-3' />
                      {
                        project.tasks.filter(t => t.status === 'completed')
                          .length
                      }
                      /{project.tasks.length} {t('projectDetails.tasks').toLowerCase()}
                    </div>
                    <div className='flex items-center gap-1'>
                      <Users className='h-3 w-3' />
                      {project.teamMembers.length} {t('projectDetails.members')}
                    </div>
                  </div>

                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <div>{t('projectDetails.started')} {project.startDate.toLocaleDateString()}</div>
                    {project.targetDate && (
                      <div>{t('projectDetails.due')} {project.targetDate.toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className='text-center py-12'>
          <FolderOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            {t('emptyState.noProjectsTitle')}
          </h3>
          <p className='text-gray-600 mb-4'>
            {filterStatus !== 'all'
              ? t('emptyState.noProjectsFilterMessage')
              : t('emptyState.noProjectsCreateMessage')}
          </p>
          {filterStatus === 'all' && (
            <Button onClick={() => setIsCreating(true)} className='gap-2'>
              <Plus className='h-4 w-4' />
              {t('emptyState.createFirstProject')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
