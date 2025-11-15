// Example usage:
// <SelectInput label="Semester" options={semesterOptions} onChange={setSemester} />

import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
type Option = { label: string; value: string | number };

type Props = {
  label?: string;
  options: Option[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mode?: "multiple" | "tags";
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const SelectInput: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Please select",
  disabled = false,
  className,
  mode,
}) => {
  const handleChange: SelectProps<any>["onChange"] = (val) => {
    // Antd returns string | number | (string | number)[]
    if (Array.isArray(val)) {
      // Requirements specify onChange signature (value: string | number) => void.
      // For multiple/tags mode we forward the first selected value if present.
      onChange?.(val[0] as string | number);
    } else {
      onChange?.(val as string | number);
    }
  };

  return (
    <div className={cx("w-full", className)}>
      {label && (
        <label className="block text-sm font-['Open_Sans'] font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      <Select
        options={options}
        value={value as any}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        mode={mode}
        className={cx(
          "w-full rounded-lg",
          "bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-gray-100",
          "border border-gray-200 dark:border-gray-700"
        )}
        dropdownClassName="dark:bg-gray-800"
      />
    </div>
  );
};

export default SelectInput;