import React from 'react';
import { Popover as AntPopover } from 'antd';

type Props = {
  content: React.ReactNode;
  children: React.ReactNode;
  title?: React.ReactNode;
  trigger?: 'hover' | 'focus' | 'click' | 'contextMenu';
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  overlayClassName?: string;
  arrow?: boolean;
};

const Popover: React.FC<Props> = ({
  content,
  children,
  title,
  trigger = 'click',
  placement = 'top',
  open,
  onOpenChange,
  overlayClassName,
  arrow = true,
}) => (
  <AntPopover
    content={content}
    title={title}
    trigger={trigger}
    placement={placement}
    open={open}
    onOpenChange={onOpenChange}
    overlayClassName={overlayClassName}
    arrow={arrow}
  >
    {children}
  </AntPopover>
);

export default Popover;