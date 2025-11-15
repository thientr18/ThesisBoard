import React from 'react';
import { Divider as AntDivider } from 'antd';

type Props = {
  orientation?: 'left' | 'right' | 'center';
  className?: string;
  children?: React.ReactNode;
};

const Divider: React.FC<Props> = ({ orientation, className = '', children }) => {
  return (
    <AntDivider orientation={orientation} className={className}>
      {children}
    </AntDivider>
  );
};

export default Divider;