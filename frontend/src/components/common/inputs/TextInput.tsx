// Example usage:
// <TextInput label="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />

import React from "react";
import { Input } from "antd";

type Props = {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  required?: boolean;
  className?: string;
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const TextInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  required = false,
  className,
}) => {
  return (
    <div className={cx("w-full", className)}>
      {label && (
        <label className="block text-sm font-['Open_Sans'] font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        className={cx(
          "w-full px-3 py-2 rounded-lg",
          "border border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-gray-100",
          "focus:ring-2 focus:ring-primary",
        )}
        aria-required={required}
        size="large" // Thêm dòng này
      />
    </div>
  );
};

export default TextInput;