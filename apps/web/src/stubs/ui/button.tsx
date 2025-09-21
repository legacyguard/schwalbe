import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${className}`}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
)
Button.displayName = "Button"

export interface SubmitButtonProps extends ButtonProps {
  isSubmitting?: boolean;
}

const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ isSubmitting, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        loading={isSubmitting}
        variant="primary"
        {...props}
      >
        {children}
      </Button>
    );
  }
);

SubmitButton.displayName = "SubmitButton";

export { Button, SubmitButton }