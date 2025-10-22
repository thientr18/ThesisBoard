import React from "react";
import { Badge as AntBadge } from "antd";

type StatusType = "success" | "error" | "warning" | "processing" | "default";

export interface BadgeProps {
  status?: StatusType;
  count?: number;
  text?: string;
  color?: string; // custom Tailwind class or hex color
  dot?: boolean;
  size?: "small" | "default" | "large";
  className?: string;
}

/**
 * Reusable Badge component built on Ant Design's Badge + TailwindCSS.
 * - Count mode: when `count` is provided (unless `dot` is true).
 * - Status mode: when `status` is provided (or fallback to default).
 * - `color` overrides the dot/count background color when supplied.
 */
const Badge: React.FC<BadgeProps> = ({
  status = "default",
  count,
  text,
  color,
  dot = false,
  size = "default",
  className = "",
}) => {
  const isCountMode = typeof count === "number" && !dot;
  const useDot = dot && !isCountMode;

  // sensible defaults for status colors (used when color isn't provided)
  const defaultStatusColors: Record<StatusType, string> = {
    success: "#52c41a",
    error: "#ff4d4f",
    warning: "#faad14",
    processing: "#1890ff",
    default: "#d9d9d9",
  };

  const resolvedColor = color ?? defaultStatusColors[status ?? "default"];

  // Tailwind sizing helpers
  const wrapperSizeClass =
    size === "small" ? "text-sm" : size === "large" ? "text-base" : "text-sm";

  const antBadgeSizeProp = size === "large" ? "default" : (size as "small" | "default");

  // helper to render label text consistently
  const renderLabel = (children?: React.ReactNode) =>
    children ? (
      <span className={`select-none ${wrapperSizeClass} text-gray-700`}>{children}</span>
    ) : null;

  // Props that are passed to AntBadge for count-mode/style
  const commonBadgeClass = `inline-flex items-center gap-2 ${className}`;

  if (useDot) {
    // dot-only mode (can accept custom color)
    // AntBadge supports `color` (custom dot color) and `status` (preset status)
    return (
      <span className={commonBadgeClass}>
        <AntBadge
          dot
          color={color ? resolvedColor : undefined}
          status={!color ? (status === "default" ? undefined : status) : undefined}
          className="align-middle"
        />
        {renderLabel(text)}
      </span>
    );
  }

  if (isCountMode) {
    // numeric count mode — style the count bubble via `style` (Ant badge applies it to the count)
    return (
      <span className={commonBadgeClass}>
        <AntBadge
          count={count}
          overflowCount={999}
          showZero
          size={antBadgeSizeProp as "small" | "default"}
          className="align-middle"
          style={{ backgroundColor: resolvedColor }}
        />
        {renderLabel(text)}
      </span>
    );
  }

  // status mode (no count, no dot)
  // If a custom color is provided, use `color`, otherwise pass Ant's `status` preset
  return (
    <span className={commonBadgeClass}>
      <AntBadge
        color={color ? resolvedColor : undefined}
        status={!color ? (status === "default" ? undefined : status) : undefined}
        text={text ? undefined : undefined} // use our own label rendering below for consistent styling
        className="align-middle"
      />
      {renderLabel(text)}
    </span>
  );
};

export default Badge;