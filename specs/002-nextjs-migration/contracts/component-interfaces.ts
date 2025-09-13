// Next.js Migration - Component Interface Contracts
// This file defines TypeScript interfaces for React components

// Base Component Props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  'data-testid'?: string
}

// User Interface Components
export interface UserProfileProps extends BaseComponentProps {
  user: User
  onUpdate?: (user: Partial<User>) => void | Promise<void>
  isLoading?: boolean
  error?: string
}

export interface UserAvatarProps extends BaseComponentProps {
  user: User
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  onClick?: () => void
}

// Form Components
export interface FormFieldProps extends BaseComponentProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
}

export interface TextInputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
}

export interface SelectInputProps extends FormFieldProps {
  options: SelectOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  searchable?: boolean
}

export interface CheckboxProps extends FormFieldProps {
  checked: boolean
  onChange: (checked: boolean) => void
  indeterminate?: boolean
}

// Layout Components
export interface LayoutProps extends BaseComponentProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  isLoading?: boolean
}

export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[]
  activeItem?: string
  onItemClick?: (item: NavigationItem) => void
  collapsed?: boolean
}

// Data Display Components
export interface DataTableProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string
  pagination?: PaginationProps
  onRowClick?: (row: T) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortable?: boolean
}

export interface CardProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  media?: React.ReactNode
  loading?: boolean
}

// Feedback Components
export interface AlertProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export interface ToastProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  onClose?: () => void
  duration?: number
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  footer?: React.ReactNode
}

// Loading Components
export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  thickness?: number
}

export interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'rectangular' | 'circular'
  width?: number | string
  height?: number | string
  animation?: 'pulse' | 'wave' | false
}

// Server Component Props
export interface ServerComponentProps<T = any> {
  params?: Record<string, string>
  searchParams?: Record<string, string | string[]>
  data?: T
  error?: Error
}

// Page Component Props
export interface PageProps extends ServerComponentProps {
  title?: string
  description?: string
  canonical?: string
  structuredData?: object
}

// API Route Props
export interface ApiRouteProps {
  params: Record<string, string>
  searchParams?: Record<string, string | string[]>
}

// Supporting Types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: 'user' | 'admin' | 'moderator'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

export interface NavigationItem {
  id: string
  label: string
  href?: string
  icon?: React.ComponentType
  children?: NavigationItem[]
  disabled?: boolean
  badge?: string | number
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  showSizeSelector?: boolean
  pageSizeOptions?: number[]
}

// Event Handler Types
export type ChangeHandler<T = any> = (value: T) => void
export type ClickHandler = (event: React.MouseEvent) => void
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>
export type ErrorHandler = (error: Error) => void

// Custom Event Types
export interface CustomEventMap {
  'user:login': { user: User }
  'user:logout': { userId: string }
  'data:updated': { type: string; id: string; data: any }
  'notification:new': { notification: NotificationData }
  'error:occurred': { error: Error; context?: any }
}

export interface NotificationData {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  action?: {
    label: string
    href: string
  }
}

// Context Types
export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export interface ThemeContextValue {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  resolvedTheme: 'light' | 'dark'
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

// Utility Types
export type ComponentVariant<T extends string> = {
  [K in T]: string
}

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

// Higher-Order Component Types
export type WithAuthProps = {
  user: User
  isAuthenticated: boolean
}

export type WithLoadingProps = {
  loading: boolean
  error?: Error
}

export type WithDataProps<T> = {
  data: T
  refetch: () => Promise<void>
}

// Export React types for convenience
export type { ReactNode, ReactElement, ComponentProps, FC } from 'react'