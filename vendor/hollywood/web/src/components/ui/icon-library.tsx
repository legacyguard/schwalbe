
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  Briefcase,
  Calendar,
  Car,
  CreditCard as Card,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Copy,
  CreditCard,
  Database,
  FileText as Document,
  FileText as DocumentText,
  DollarSign,
  Dot,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FilePlus,
  FileText,
  Upload as FileUpload,
  Filter,
  Folder,
  Gift,
  Globe,
  Grid,
  GripVertical,
  Heart,
  HelpCircle,
  Home,
  Inbox,
  Infinity as InfinityIcon,
  Info,
  Key,
  LayoutDashboard,
  Lightbulb,
  Link,
  List,
  Loader,
  Loader2,
  Loader2 as Loading,
  Lock,
  Mail,
  Maximize2,
  MessageCircle,
  Mic,
  MoreHorizontal,
  PanelLeft,
  Pause,
  Edit3 as Pencil,
  Phone,
  PieChart,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Scale,
  Search,
  Search as SearchIcon,
  SearchX,
  Send,
  Settings,
  Share,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SidebarOpen,
  Sparkles,
  Star,
  Terminal,
  Trash2,
  TrendingDown,
  TrendingUp,
  Unlock,
  Upload,
  User,
  UserPlus,
  Users,
  Vault,
  Video,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

// Export all icons for direct use
export {
  AlertCircle,
  ArrowRight,
  Bot,
  Briefcase,
  Calendar,
  Car,
  Card,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Copy,
  CreditCard,
  FileText as Document,
  FileText as DocumentText,
  DollarSign,
  Dot,
  Download,
  Edit,
  Eye,
  EyeOff,
  FilePlus,
  FileText,
  FileUpload,
  Filter,
  Folder,
  Gift,
  Grid,
  GripVertical,
  Heart,
  HelpCircle,
  Home,
  InfinityIcon,
  Info,
  Key,
  LayoutDashboard,
  List,
  Loader,
  Loader2,
  Lock,
  Mail,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Phone,
  PieChart,
  Plus,
  RefreshCw,
  Scale,
  Search,
  SearchIcon,
  Send,
  Settings,
  Share,
  Shield,
  ShieldCheck,
  SidebarOpen,
  Sparkles,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  Unlock,
  Upload,
  User,
  UserPlus,
  Users,
  Vault,
  Video,
  X,
};

// Icon mapping for semantic usage
export const IconMap = {
  // Navigation
  dashboard: LayoutDashboard,
  vault: Vault,
  documents: FileText,
  guardians: Users,
  legacy: Gift,
  timeline: Calendar,
  wishes: Heart,
  protection: Shield,
  settings: Settings,

  // Actions
  add: Plus,
  edit: Edit,
  pencil: Pencil,
  delete: Trash2,
  trash: Trash2,
  copy: Copy,
  share: Share,
  download: Download,
  upload: Upload,
  search: SearchIcon,
  filter: Filter,

  // Status
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  help: HelpCircle,
  locked: Lock,
  unlocked: Unlock,
  'shield-check': ShieldCheck,

  // UI Elements
  close: X,
  check: Check,
  circle: Circle,
  dot: Dot,
  arrowRight: ArrowRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  more: MoreHorizontal,

  // Legacy Specific
  infinity: InfinityIcon,
  star: Star,
  home: Home,
  eye: Eye,
  eyeOff: EyeOff,
  grip: GripVertical,
  panelLeft: PanelLeft,

  // Sofia AI specific
  bot: Bot,
  user: User,
  users: Users,
  send: Send,
  loader: Loader,
  'loader-2': Loader2,
  sparkles: Sparkles,
  shield: Shield,
  x: X,

  // Communication & Media
  mail: Mail,
  phone: Phone,
  video: Video,
  clock: Clock,

  // Layout
  grid: Grid,
  list: List,

  // Financial
  financial: DollarSign,
  money: DollarSign,
  card: CreditCard,
  scale: Scale,
  chart: PieChart,

  // Trends & Analytics
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,

  // Security & Access
  key: Key,

  // New dashboard icons
  car: Car,
  folder: Folder,
  'user-plus': UserPlus,
  'file-upload': FileUpload,
  'refresh-cw': RefreshCw,
  'file-plus': FilePlus,
  'credit-card': Card,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'shield-alert': ShieldAlert,

  // File icons
  file: File,
  'file-text': FileText,

  // Media controls
  play: Play,

  // Loading states
  loading: Loading,
  'loading-2': Loader2,

  // Aliases for common usage
  checkCircle: CheckCircle,
  heart: Heart,
  calendar: Calendar,

  // Additional icons
  brain: Brain,
  database: Database,
  globe: Globe,
  lightbulb: Lightbulb,
  inbox: Inbox,
  link: Link,
  plus: Plus,
  'rotate-ccw': RotateCcw,
  'x-circle': XCircle,
  'check-circle': CheckCircle,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'eye-off': EyeOff,
  unlock: Unlock,
  'triangle-exclamation': AlertTriangle,

  // Additional missing icons
  'message-circle': MessageCircle,
  'maximize-2': Maximize2,
  'document-text': DocumentText,
  briefcase: Briefcase,
  document: Document,

  // Missing icons from components
  zap: Zap,
  mic: Mic,
  pause: Pause,
  rotate: RotateCw,
  terminal: Terminal,
  activity: Activity,
  'search-x': SearchX,
  'external-link': ExternalLink,
} as const;

// Type for icon names
export type IconName = keyof typeof IconMap;

// Icon component with consistent sizing
interface IconProps {
  className?: string;
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24, className }: IconProps) {
  const IconComponent = IconMap[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in IconMap`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
}

// Predefined icon sizes
export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

export type IconSize = keyof typeof IconSizes;
