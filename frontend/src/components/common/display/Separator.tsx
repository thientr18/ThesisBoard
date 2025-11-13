import React from 'react';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Simple Tailwind separator (horizontal by default).
 */
const Separator: React.FC<SeparatorProps> = ({ className = '', orientation = 'horizontal' }) => {
  if (orientation === 'vertical') {
    return <div aria-hidden className={`h-full w-px bg-gray-200 ${className}`} />;
  }
  return <div aria-hidden className={`w-full h-px bg-gray-200 ${className}`} />;
};

export default Separator;