import React from 'react';
import { Alert as AntdAlert } from 'antd';
import type { AlertProps as AntdAlertProps } from 'antd';

export interface AlertProps {
  type?: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description?: string;
  closable?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * Example:
 * <Alert type="success" message="Saved successfully!" />
 */

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  description,
  closable = true,
  showIcon = true,
  className,
}) => {
  const classes = ['rounded-xl', 'mb-4', 'shadow-sm', className].filter(Boolean).join(' ');

  // Pass through to Ant Design's Alert component
  return (
    <AntdAlert
      type={type}
      message={message}
      description={description as AntdAlertProps['description']}
      closable={closable}
      showIcon={showIcon}
      className={classes}
    />
  );
};

export default Alert;