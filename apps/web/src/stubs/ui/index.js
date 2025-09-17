// Minimal stubs to satisfy typecheck in web app without pulling full UI library at build time.
// Components are typed but return basic HTML elements. Adjust as needed.
import React from 'react';
export const Button = React.forwardRef(({ children, ...props }, ref) => React.createElement('button', { ref, ...props }, children));
Button.displayName = 'Button';
// Card
export const Card = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const CardHeader = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const CardContent = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const CardFooter = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const CardTitle = ({ children, ...props }) => React.createElement('h3', { ...props }, children);
export const CardDescription = ({ children, ...props }) => React.createElement('p', { ...props }, children);
export const Input = React.forwardRef((props, ref) => React.createElement('input', { ref, ...props }));
Input.displayName = 'Input';
export const Dialog = ({ children }) => React.createElement('div', null, children);
export const DialogHeader = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const DialogTitle = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const DialogContent = ({ children, ...props }) => React.createElement('div', { ...props }, children);
// Dark mode hook stub
export const useDarkMode = () => ({ isDark: false, toggleDarkMode: () => { } });
export const withDarkMode = (Component) => Component;
