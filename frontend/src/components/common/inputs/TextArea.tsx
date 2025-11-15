import React from 'react';
import { Input } from 'antd';

const { TextArea: AntTextArea } = Input;

type Props = {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
  showCount?: boolean;
  maxLength?: number;
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

const TextArea: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  className,
  showCount = false,
  maxLength,
}) => {
  return (
    <div className={cx('w-full', className)}>
      {label && (
        <label className="block text-sm font-['Open_Sans'] font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <AntTextArea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        showCount={showCount}
        maxLength={maxLength}
        className={cx(
          'w-full px-3 py-2 rounded-lg',
          'border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          'focus:ring-2 focus:ring-primary',
        )}
        aria-required={required}
      />
    </div>
  );
};

export default TextArea;