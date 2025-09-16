import React from 'react'
export const Avatar: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children, ...props }) => React.createElement('div', { ...props }, children)
export const AvatarImage: React.FC<{ src?: string }> = () => null
export const AvatarFallback: React.FC<{ className?: string; children?: React.ReactNode }> = ({ children }) => React.createElement('span', null, children)
