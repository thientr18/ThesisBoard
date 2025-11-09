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

  // overlay support
  children?: React.ReactNode;
  offset?: [number, number];
  overflowCount?: number;
  showZero?: boolean;
}

/**
 * Reusable Badge component built on Ant Design's Badge + TailwindCSS.
 * - Supports overlay mode when `children` is provided.
 * - Count mode: when `count` is provided (unless `dot` is true).
 * - Status mode: when `status` is provided (or fallback to default).
 * - `color` overrides the dot/status color when supplied.
 */
const Badge: React.FC<BadgeProps> = ({
  status = "default",
  count,
  text,
  color,
  dot = false,
  size = "default",
  className = "",
  children,
  offset,
  overflowCount = 999,
  showZero = true,
}) => {
  const isCountMode = typeof count === "number" && !dot;
  const useDot = dot && !isCountMode;

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

  const renderLabel = (childrenNode?: React.ReactNode) =>
    childrenNode ? (
      <span className={`select-none ${wrapperSizeClass} text-gray-700`}>{childrenNode}</span>
    ) : null;

  const commonBadgeClass = `inline-flex items-center gap-2 ${className}`;

  if (useDot) {
    const badgeEl = (
      <AntBadge
        dot
        color={color ? resolvedColor : undefined}
        status={!color ? (status === "default" ? undefined : status) : undefined}
        className="align-middle"
        offset={offset}
      >
        {children}
      </AntBadge>
    );

    if (children) return badgeEl;
    return (
      <span className={commonBadgeClass}>
        {badgeEl}
        {renderLabel(text)}
      </span>
    );
  }

  if (isCountMode) {
    const badgeEl = (
      <AntBadge
        count={count}
        overflowCount={overflowCount}
        showZero={showZero}
        size={antBadgeSizeProp as "small" | "default"}
        className="align-middle"
        offset={offset}
      >
        {children}
      </AntBadge>
    );

    if (children) return badgeEl;
    return (
      <span className={commonBadgeClass}>
        {badgeEl}
        {renderLabel(text)}
      </span>
    );
  }

  // status mode (no count, no dot)
  return (
    <span className={commonBadgeClass}>
      <AntBadge
        color={color ? resolvedColor : undefined}
        status={!color ? (status === "default" ? undefined : status) : undefined}
        className="align-middle"
      />
      {renderLabel(text)}
    </span>
  );
};

export default Badge;