import React from 'react';
import { Button } from 'antd';

type AntButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text';
type HtmlButtonType = 'button' | 'submit' | 'reset';

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: AntButtonType;
  htmlType?: HtmlButtonType;
  className?: string;
}

/**
 * Reusable primary action button built on Ant Design's Button.
 * - Uses AntD `type` prop (default "primary")
 * - Adds Tailwind styling for rounded corners, bold text and hover shadow
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onClick,
  loading = false,
  icon,
  disabled = false,
  type = 'primary',
  htmlType = 'button',
  className = '',
}) => {
  const handleClick = () => {
    if (disabled || loading) return;
    onClick?.();
  };

  return (
    <Button
      type={type}
      htmlType={htmlType}
      onClick={handleClick}
      loading={loading}
      disabled={disabled}
      className={`rounded-md font-semibold shadow-sm hover:shadow-md transition-shadow px-4 py-2 flex items-center justify-center ${className}`}
    >
      {icon ? <span className="mr-2 flex items-center">{icon}</span> : null}
      <span>{label}</span>
    </Button>
  );
};

export default PrimaryButton;