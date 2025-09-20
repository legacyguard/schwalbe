import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx } from 'clsx'

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium",
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800",
    "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
    "active:scale-95"
  ],
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
        secondary: "bg-slate-600 text-white hover:bg-slate-700 shadow-sm hover:shadow-md",
        outline: "border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500",
        ghost: "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white",
        link: "bg-transparent text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline p-0 h-auto",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm hover:shadow-md",
      },
      size: {
        sm: "h-8 px-3 text-sm min-w-[2rem]",
        md: "h-10 px-4 text-base min-w-[2.5rem]",
        lg: "h-12 px-6 text-lg min-w-[3rem]",
        xl: "h-14 px-8 text-xl min-w-[3.5rem]",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
        className={clsx(buttonVariants({ variant, size, fullWidth, loading }), className)}
        disabled={isDisabled}
        aria-busy={loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && (
          <span className="mr-2 -ml-1" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span>
          {loading && loadingText ? loadingText : children}
        </span>

        {!loading && rightIcon && (
          <span className="ml-2 -mr-1" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Specialized button components
export const SubmitButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'type'>>(
  (props, ref) => (
    <Button type="submit" ref={ref} {...props} />
  )
)
SubmitButton.displayName = "SubmitButton"

export const CancelButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button variant="outline" ref={ref} {...props} />
  )
)
CancelButton.displayName = "CancelButton"

export const DeleteButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <Button variant="danger" ref={ref} {...props} />
  )
)
DeleteButton.displayName = "DeleteButton"

export const LoadingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading = true, loadingText = "Loading...", children, ...props }, ref) => (
    <Button loading={loading} loadingText={loadingText} ref={ref} {...props}>
      {children}
    </Button>
  )
)
LoadingButton.displayName = "LoadingButton"

// Button group component
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  variant?: 'attached' | 'separated'
}

export function ButtonGroup({
  children,
  className = '',
  orientation = 'horizontal',
  variant = 'attached'
}: ButtonGroupProps) {
  const groupClasses = clsx(
    'inline-flex',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
      // Attached variant removes spacing and rounds only outer edges
      '[&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md [&>button:not(:last-child)]:border-r-0':
        variant === 'attached' && orientation === 'horizontal',
      '[&>button]:rounded-none [&>button:first-child]:rounded-t-md [&>button:last-child]:rounded-b-md [&>button:not(:last-child)]:border-b-0':
        variant === 'attached' && orientation === 'vertical',
      // Separated variant adds spacing
      'gap-2': variant === 'separated'
    },
    className
  )

  return (
    <div className={groupClasses} role="group">
      {children}
    </div>
  )
}

// Icon button component
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => (
    <Button size={size} ref={ref} {...props}>
      {icon}
    </Button>
  )
)
IconButton.displayName = "IconButton"

export { Button, buttonVariants }