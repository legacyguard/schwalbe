import React from 'react'
export const DropdownMenu: React.FC<{ children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
export const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children?: React.ReactNode }> = ({ children }) => React.createElement('button', null, children)
export const DropdownMenuContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
export const DropdownMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
