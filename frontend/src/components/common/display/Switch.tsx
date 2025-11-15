import React from 'react';
import { Switch as AntSwitch } from 'antd';

type Props = {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'default';
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

const Switch: React.FC<Props> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className,
  size = 'default',
}) => {
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <AntSwitch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        size={size}
        className="bg-gray-300"
      />
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
    </div>
  );
};

export default Switch;