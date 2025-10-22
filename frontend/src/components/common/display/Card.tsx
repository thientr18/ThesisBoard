import React from "react";
import { Card as AntCard } from "antd";

export interface CardProps {
  title?: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 Example usage:
 
 <Card
   title="Project Alpha"
   extra={<Button size="small">Manage</Button>}
   hoverable
   onClick={() => console.log('open')}
 >
   <p className="text-sm text-gray-600">Short project summary or stats go here.</p>
 </Card>
*/
const Card: React.FC<CardProps> = ({
  title,
  extra,
  children,
  loading = false,
  hoverable = false,
  bordered = true,
  className = "",
  onClick,
}) => {
  const baseClasses =
    "w-full sm:w-auto bg-white text-gray-800 rounded-2xl shadow-sm overflow-hidden";
  const hoverClasses = hoverable
    ? "hover:shadow-md hover:scale-[1.01] transition-transform transition-shadow duration-150 ease-in-out"
    : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const combined = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`.trim();

  // keyboard accessibility for clickable card
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={combined}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-pressed={onClick ? false : undefined}
    >
      <AntCard
        title={title}
        extra={extra}
        loading={loading}
        bordered={bordered}
        hoverable={false} // we manage visual hover via Tailwind to keep consistent rounded/shadow
        bodyStyle={{ padding: 16 }}
        headStyle={{ padding: "12px 16px", borderBottom: bordered ? undefined : "none" }}
        className="bg-transparent shadow-none"
      >
        <div className="min-h-[48px]">{children}</div>
      </AntCard>
    </div>
  );
};

export default Card;