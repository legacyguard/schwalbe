import React from 'react'
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => React.createElement('label', { ...props }, children)
