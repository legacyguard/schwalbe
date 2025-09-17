import React from 'react';
export const Avatar = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const AvatarImage = () => null;
export const AvatarFallback = ({ children }) => React.createElement('span', null, children);
