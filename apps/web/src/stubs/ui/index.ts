// Minimal stubs to satisfy typecheck in web app without pulling full UI library at build time.
// Components are typed but return basic HTML elements. Adjust as needed.

import React from 'react'

type WithChildren<P = Record<string, never>> = P & { children?: React.ReactNode }

// Button
export interface ButtonProps extends WithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
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

// Dark mode hook stub
export const useDarkMode = () => ({ isDark: false, toggleDarkMode: () => {} })
export const withDarkMode = <P extends object>(Component: React.ComponentType<P>) => Component
