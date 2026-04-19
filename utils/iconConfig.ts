import React from 'react';
import {
  // Dashboard & Navigation
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Bell,
  Calendar,
  TrendingUp,
  
  // Invoice Actions
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  Download,
  Upload,
  Eye,
  EyeOff,
  
  // Payment & Money
  DollarSign,
  CreditCard,
  Wallet,
  TrendingDown,
  PiggyBank,
  Receipt,
  
  // Status Indicators
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Info,
  
  // Client & People
  User,
  UserPlus,
  Users2,
  Building2,
  Mail,
  Phone,
  MapPin,
  
  // Project & Tasks
  Briefcase,
  FolderOpen,
  CheckSquare,
  Circle,
  Target,
  
  // Analytics & Reports
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  
  // Settings & Controls
  Sliders,
  Palette,
  Globe,
  Lock,
  Unlock,
  Key,
  
  // Communication
  MessageSquare,
  Share2,
  Link,
  ExternalLink,
  
  // Time & Schedule
  CalendarDays,
  Timer,
  Clock3,
  History,
  
  // Files & Documents
  FileSpreadsheet,
  FileText as FilePdf,
  FileImage,
  File,
  FolderPlus,
  
  // Interface Controls
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  Search,
  Filter,
  MoreVertical,
  MoreHorizontal,
  
  // Success & Actions
  Check,
  Save,
  RefreshCw,
  Archive,
  Star,
  Heart,
  
  // Special Features
  Sparkles,
  Zap,
  Award,
  Crown,
  Rocket,
  
  LucideIcon
} from 'lucide-react';

export const icons = {
  dashboard: LayoutDashboard,
  invoice: FileText,
  clients: Users,
  settings: Settings,
  notifications: Bell,
  calendar: Calendar,
  trending: TrendingUp,
  add: Plus,
  edit: Edit,
  delete: Trash2,
  duplicate: Copy,
  send: Send,
  download: Download,
  upload: Upload,
  view: Eye,
  hide: EyeOff,
  money: DollarSign,
  card: CreditCard,
  wallet: Wallet,
  expense: TrendingDown,
  savings: PiggyBank,
  receipt: Receipt,
  paid: CheckCircle,
  pending: Clock,
  overdue: AlertCircle,
  cancelled: XCircle,
  warning: AlertTriangle,
  info: Info,
  user: User,
  addUser: UserPlus,
  team: Users2,
  company: Building2,
  email: Mail,
  phone: Phone,
  location: MapPin,
  project: Briefcase,
  folder: FolderOpen,
  taskComplete: CheckSquare,
  taskIncomplete: Circle,
  goal: Target,
  barChart: BarChart3,
  pieChart: PieChart,
  lineChart: LineChart,
  activity: Activity,
  controls: Sliders,
  theme: Palette,
  language: Globe,
  locked: Lock,
  unlocked: Unlock,
  security: Key,
  message: MessageSquare,
  share: Share2,
  link: Link,
  external: ExternalLink,
  calendarDays: CalendarDays,
  timer: Timer,
  time: Clock3,
  history: History,
  excel: FileSpreadsheet,
  pdf: FilePdf,
  image: FileImage,
  file: File,
  newFolder: FolderPlus,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  close: X,
  menu: Menu,
  search: Search,
  filter: Filter,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
  check: Check,
  save: Save,
  refresh: RefreshCw,
  archive: Archive,
  favorite: Star,
  like: Heart,
  ai: Sparkles,
  premium: Zap,
  achievement: Award,
  vip: Crown,
  launch: Rocket
};

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  color?: string;
}

// Using React.createElement instead of JSX to avoid syntax errors in .ts file extension
export function Icon({ 
  name, 
  size = 20, 
  className = '', 
  strokeWidth = 2,
  color 
}: IconProps) {
  const IconComponent = icons[name] as LucideIcon;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return React.createElement(IconComponent, {
    size,
    strokeWidth,
    className,
    color
  });
}
