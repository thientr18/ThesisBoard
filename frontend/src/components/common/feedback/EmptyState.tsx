import React from 'react';
import { Empty } from 'antd';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Example:
 * <EmptyState
 *   title="No Thesis Found"
 *   description="You don’t have any thesis projects yet."
 *   action={<Button type="primary">Create New</Button>}
 * />
 */

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description,
  icon,
  action,
  className,
}) => {
  const containerClasses = [
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'py-8',
    'space-y-3',
    'text-center',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const antdDescription = (
    <div className="space-y-1">
      <div className="text-lg font-medium">{title}</div>
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
    </div>
  );

  return (
    <div className={containerClasses}>
      <Empty image={icon ?? undefined} description={antdDescription}>
        {action && <div>{action}</div>}
      </Empty>
    </div>
  );
};

export default EmptyState;