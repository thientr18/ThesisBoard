import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullscreen?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip,
  fullscreen = false,
  className,
}) => {
  const sizeMap: Record<NonNullable<LoadingSpinnerProps['size']>, number> = {
    small: 16,
    default: 24,
    large: 36,
  };

  const spinnerSize = sizeMap[size];
  const indicator = <LoadingOutlined style={{ fontSize: spinnerSize, color: 'currentColor' }} spin />;

  const baseClasses = fullscreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-900/70'
    : 'flex items-center justify-center py-6';

  const containerClasses = [
    baseClasses,
    'transition-opacity duration-200 ease-in-out',
    'text-gray-700 dark:text-gray-200',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Only pass tip if fullscreen is true or we're using nested pattern
  const spinProps = fullscreen
    ? { indicator, tip, fullscreen: true }
    : { indicator };

  return (
    <div className={containerClasses}>
      <Spin {...spinProps} />
      {/* Show tip text manually when not in fullscreen mode */}
      {!fullscreen && tip && (
        <span className="ml-2 text-sm">{tip}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;