import { forwardRef } from "react";
import { DatePicker as AntDatePicker } from "antd";
import type { Dayjs } from "dayjs";

type Props = {
  label?: string;
  value?: Dayjs;
  onChange?: (date: Dayjs | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const DatePicker = forwardRef<any, Props>(
  (
    {
      label,
      value,
      onChange,
      disabled = false,
      placeholder = "Select date",
      className,
      required = false,
    },
    ref
  ) => {
    return (
      <div className={cx("w-full", className)}>
        {label && (
          <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-200">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="w-full">
          <AntDatePicker
            ref={ref}
            value={value as any}
            onChange={(d: any) => onChange?.((d as Dayjs) ?? null)}
            disabled={disabled}
            placeholder={placeholder}
            className={cx(
              "w-full rounded-lg",
              // Apply some Tailwind-friendly styling for light/dark mode.
              // Ant Design controls some internal styling; these classes help keep spacing and rounded look.
              "border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800",
              "text-gray-900 dark:text-gray-100",
            )}
            inputReadOnly={false}
          />
        </div>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;