import React from 'react';
type WithChildren<P = Record<string, never>> = P & {
    children?: React.ReactNode;
};
export interface ButtonProps extends WithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const Card: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>>;
export declare const CardHeader: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>>;
export declare const CardContent: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>>;
export declare const CardFooter: React.FC<WithChildren<React.HTMLAttributes<HTMLDivElement>>>;
export declare const CardTitle: React.FC<WithChildren<React.HTMLAttributes<HTMLHeadingElement>>>;
export declare const CardDescription: React.FC<WithChildren<React.HTMLAttributes<HTMLParagraphElement>>>;
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}
export declare const Dialog: React.FC<DialogProps>;
export declare const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export declare const DialogTitle: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export declare const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export declare const useDarkMode: () => {
    isDark: boolean;
    toggleDarkMode: () => void;
};
export declare const withDarkMode: <P extends object>(Component: React.ComponentType<P>) => React.ComponentType<P>;
export {};
//# sourceMappingURL=index.d.ts.map