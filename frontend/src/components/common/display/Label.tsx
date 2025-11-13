import React from 'react';

interface LabelProps {
  className?: string;
  htmlFor?: string;
  children?: React.ReactNode;
}

/**
 * Minimal label component for form/info rows.
 */
const Label: React.FC<LabelProps> = ({ className = '', htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>
      {children}
    </label>
  );
};

export default Label;