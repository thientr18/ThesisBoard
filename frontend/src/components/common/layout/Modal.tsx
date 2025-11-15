import React from 'react';
import { Modal as AntModal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

type Props = {
  title?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  className?: string;
  maskClosable?: boolean;
  closeIcon?: React.ReactNode | null; // Allow hiding close icon
};

const Modal: React.FC<Props> = ({
  title,
  open,
  onClose,
  children,
  footer = null,
  width = 600,
  className,
  maskClosable = true,
  closeIcon,
}) => {
  return (
    <AntModal
      title={title}
      open={open}
      onCancel={onClose}
      footer={footer}
      width={width}
      maskClosable={maskClosable}
      closeIcon={closeIcon !== undefined ? closeIcon : <CloseOutlined className="text-gray-400 hover:text-gray-600" />}
      className={className}
      styles={{
        mask: { backdropFilter: 'blur(4px)' },
      }}
    >
      {children}
    </AntModal>
  );
};

export default Modal;