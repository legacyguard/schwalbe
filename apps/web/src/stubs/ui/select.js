import React from 'react';
export const Select = ({ children }) => React.createElement('div', null, children);
export const SelectTrigger = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const SelectContent = ({ children, ...props }) => React.createElement('div', { ...props }, children);
export const SelectItem = ({ children }) => React.createElement('div', null, children);
export const SelectValue = ({ placeholder }) => React.createElement('span', null, placeholder);
