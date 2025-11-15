import React from 'react';
import { Button } from 'antd';

interface SecondaryButtonProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'middle' | 'large';
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onClick,
  loading = false,
  icon,
  disabled = false,
  className = '',
  size = 'middle',
}) => {
  return (
    <Button
      type="default"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      size={size}
      className={`rounded-lg font-medium transition-all ${className}`}
    >
      {icon && <span className="mr-2 flex items-center">{icon}</span>}
      <span>{label}</span>
    </Button>
  );
};

export default SecondaryButton;