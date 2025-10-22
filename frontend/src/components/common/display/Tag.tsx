import React from "react";
import { Tag as AntTag } from "antd";

export type TagType = "success" | "warning" | "error" | "info" | "default";

export interface TagProps {
  label: string;
  type?: TagType;
  color?: string;
  icon?: React.ReactNode;
  bordered?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 Example usage:
 
 <Tag type="success" label="Approved" />
 <Tag label="Custom" color="#7c3aed" icon={<CheckIcon />} onClick={() => alert('clicked')} />
 <Tag type="warning" label="Pending" bordered={false} />
*/
const typeClassMap: Record<TagType, string> = {
  success: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:border-green-700",
  warning: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-700",
  error: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/10 dark:border-red-700",
  info: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/10 dark:border-blue-700",
  default: "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-900/10 dark:border-gray-700",
};

const isCssColor = (value?: string): value is string =>
  typeof value === "string" && (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl"));

const getContrastText = (hex: string) => {
  // minimal contrast check for hex colors -> returns either dark or light text
  try {
    const cleaned = hex.replace("#", "");
    const bigint = parseInt(cleaned.length === 3 ? cleaned.split("").map(c => c + c).join("") : cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    // luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#111827" : "#ffffff";
  } catch {
    return "#111827";
  }
};

const Tag: React.FC<TagProps> = ({
  label,
  type = "default",
  color,
  icon,
  bordered = true,
  className = "",
  onClick,
}) => {
  const clickable = typeof onClick === "function";
  const baseClasses =
    "inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium select-none text-sm";
  const interactiveClasses = clickable ? "cursor-pointer hover:opacity-80" : "cursor-default";
  const borderClasses = bordered ? "" : "border-transparent";

  // Resolve color: either Tailwind class(s) or inline style for hex/rgb
  const tailwindColorClasses = !isCssColor(color) && color ? color : "";
  const typeClasses = !color ? typeClassMap[type] : "";
  const combinedClassName = `${baseClasses} ${interactiveClasses} ${borderClasses} ${typeClasses} ${tailwindColorClasses} ${className}`.trim();

  const style: React.CSSProperties | undefined = isCssColor(color)
    ? {
        backgroundColor: color,
        color: isCssColor(color) && color.startsWith("#") ? getContrastText(color) : undefined,
        borderColor: bordered ? color : "transparent",
      }
    : undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <AntTag
      className={combinedClassName}
      style={style}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{label}</span>
    </AntTag>
  );
};

export default Tag;