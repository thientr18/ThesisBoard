import React from 'react';
import { Button, Tooltip } from 'antd';

type AntButtonType = 'primary' | 'default' | 'dashed' | 'link' | 'text';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  type?: AntButtonType;
  danger?: boolean;
  shape?: 'circle' | 'default';
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * IconButton
 * - Small, focused button intended to primarily show an icon (optional label).
 * - Built on Ant Design Button + optional Tooltip.
 * - Tailwind for rounded/circle styles + subtle hover shadow.
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  tooltip,
  type = 'text',
  danger = false,
  shape = 'circle',
  label,
  disabled = false,
  loading = false,
  className = '',
  ariaLabel,
}) => {
  const isCircle = shape === 'circle';
  const computedAria = ariaLabel ?? tooltip ?? label ?? 'icon button';

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  const baseClasses = isCircle
    ? 'rounded-full p-2 flex items-center justify-center transition-shadow hover:shadow-sm'
    : 'rounded-md px-2 py-1 flex items-center gap-2 transition-shadow hover:shadow-sm';

  const content = (
    <Button
      type={type}
      onClick={handleClick}
      loading={loading}
      disabled={disabled}
      danger={danger}
      shape={isCircle ? 'circle' : undefined}
      aria-label={computedAria}
      title={tooltip} // provides native tooltip fallback for accessibility
      className={`${baseClasses} ${className}`}
    >
      <span className="flex items-center justify-center">{icon}</span>
      {label ? <span className="sr-only md:not-sr-only ml-2">{label}</span> : null}
    </Button>
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
};

export default IconButton;