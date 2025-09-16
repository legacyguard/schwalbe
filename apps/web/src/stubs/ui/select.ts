import React from 'react'
export const Select: React.FC<{ value?: string; onValueChange?: (v: string) => void; children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const SelectItem: React.FC<{ value: string; children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => React.createElement('span', null, placeholder)
