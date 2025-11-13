import React from 'react';
import { Avatar as AntAvatar } from 'antd';

export interface AvatarProps {
  src?: string;
  name?: string;
  alt?: string;
  className?: string;
  size?: number | 'small' | 'default' | 'large';
  shape?: 'circle' | 'square';
  icon?: React.ReactNode;            // added
  children?: React.ReactNode;        // added
}

/**
 * Ant Design Avatar wrapper with initials fallback.
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  alt,
  className = '',
  size = 64,
  shape = 'circle',
  icon,
  children,
}) => {
  const initials =
    name?.trim()?.split(' ')?.map((n) => n[0])?.slice(0, 2)?.join('')?.toUpperCase() ||
    alt?.[0]?.toUpperCase() ||
    'U';

  return (
    <AntAvatar
      src={src}
      alt={alt ?? name}
      size={size}
      shape={shape}
      className={className}
      icon={icon}
    >
      {children ?? initials}
    </AntAvatar>
  );
};

export default Avatar;