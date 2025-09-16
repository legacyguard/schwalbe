import React from 'react'
export const Tabs: React.FC<{ defaultValue?: string; className?: string; value?: string; onValueChange?: (v: string) => void; children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
export const TabsTrigger: React.FC<{ value: string; children?: React.ReactNode }> = ({ children }) => React.createElement('button', null, children)
export const TabsContent: React.FC<{ value: string; className?: string; children?: React.ReactNode }> = ({ children }) => React.createElement('div', null, children)
