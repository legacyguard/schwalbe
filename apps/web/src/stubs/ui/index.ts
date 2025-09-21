// Minimal stubs to satisfy typecheck in web app without pulling full UI library at build time.
// Components are typed but return basic HTML elements. Adjust as needed.

import React from 'react'

type WithChildren<P = Record<string, never>> = P & { children?: React.ReactNode }

// Button
export interface ButtonProps extends WithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'danger' | 'success' | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => React.createElement('button', { ref, ...props }, children)
)
Button.displayName = 'Button'

// Card
export const Card: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const CardHeader: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const CardContent: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const CardFooter: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const CardTitle: React.FC<WithChildren<React.HTMLAttributes<HTMLHeadingElement>>> = ({ children, ...props }) => React.createElement('h3', { ...props }, children)
export const CardDescription: React.FC<WithChildren<React.HTMLAttributes<HTMLParagraphElement>>> = ({ children, ...props }) => React.createElement('p', { ...props }, children)

// Input
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => React.createElement('input', { ref, ...props }))
Input.displayName = 'Input'

// Dialog
export interface DialogProps { open?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }
export const Dialog: React.FC<DialogProps> = ({ children }) => React.createElement('div', null, children)
export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const DialogTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)

// Label
export interface LabelProps extends WithChildren<React.LabelHTMLAttributes<HTMLLabelElement>> {}
export const Label: React.FC<LabelProps> = ({ children, ...props }) => React.createElement('label', { ...props }, children)

// Badge
export interface BadgeProps extends WithChildren<React.HTMLAttributes<HTMLDivElement>> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}
export const Badge: React.FC<BadgeProps> = ({ children, ...props }) => React.createElement('div', { ...props }, children)

// Avatar
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Avatar: React.FC<AvatarProps> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt?: string
}
export const AvatarImage: React.FC<AvatarImageProps> = (props) => React.createElement('img', props)
export const AvatarFallback: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)

// Separator
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}
export const Separator: React.FC<SeparatorProps> = ({ children, ...props }) => React.createElement('div', { ...props }, children)

// Select
export interface SelectProps extends WithChildren<React.HTMLAttributes<HTMLDivElement>> {
  value?: string
  onValueChange?: (value: string) => void
}
export const Select: React.FC<SelectProps> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const SelectContent: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const SelectItem: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>> & { value?: string }> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const SelectTrigger: React.FC<WithChildren<React.HTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => React.createElement('button', { ...props }, children)
export const SelectValue: React.FC<WithChildren<React.HTMLAttributes<HTMLSpanElement>>> = ({ children, ...props }) => React.createElement('span', { ...props }, children)

// Checkbox
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}
export const Checkbox: React.FC<CheckboxProps> = (props) => React.createElement('input', { ...props, type: 'checkbox' })

// Tabs
export interface TabsProps extends WithChildren<React.HTMLAttributes<HTMLDivElement>> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}
export const Tabs: React.FC<TabsProps> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const TabsContent: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>> & { value?: string }> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const TabsList: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const TabsTrigger: React.FC<WithChildren<React.HTMLAttributes<HTMLButtonElement>> & { value?: string }> = ({ children, ...props }) => React.createElement('button', { ...props }, children)

// Progress
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  className?: string
}
export const Progress: React.FC<ProgressProps> = ({ children, ...props }) => React.createElement('div', { ...props }, children)

// Slider
export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
}
export const Slider: React.FC<SliderProps> = ({ children, ...props }) => React.createElement('div', { ...props }, children)

// Export all components from separate files
export * from './AccessibleForm'
export * from './ErrorMessage'
export * from './LoadingSpinner'

// Dark mode hook stub
export const useDarkMode = () => ({ isDark: false, toggleDarkMode: () => {} })
export const withDarkMode = <P extends object>(Component: React.ComponentType<P>) => Component
