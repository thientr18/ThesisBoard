import React from "react";

interface ToggleInputProps {
  label?: string;
  value: boolean;
  onChange: (checked: boolean) => void;
  checkedLabel?: string;
  uncheckedLabel?: string;
  disabled?: boolean;
  className?: string;
}

const ToggleInput: React.FC<ToggleInputProps> = ({
  label,
  value,
  onChange,
  checkedLabel = "On",
  uncheckedLabel = "Off",
  disabled = false,
  className = "",
}) => {
  return (
    <label className={`flex items-center gap-3 ${className}`}>
      {label && <span className="font-medium">{label}</span>}
      <span className="text-sm">{value ? checkedLabel : uncheckedLabel}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200
          ${value ? "bg-blue-600" : "bg-gray-300"}
          focus:outline-none focus:ring-2 focus:ring-blue-400`}
        style={{ minWidth: "48px" }}
      >
        <span
          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
            ${value ? "translate-x-6" : ""}`}
        />
      </button>
    </label>
  );
};

export default ToggleInput;