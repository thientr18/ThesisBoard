import React from 'react';
import { Typography as AntTypography } from 'antd';

const { Title: AntTitle, Text: AntText, Paragraph: AntParagraph } = AntTypography;

type TitleProps = {
  level?: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const Title: React.FC<TitleProps> = ({
  level = 1,
  children,
  className = '',
  style,
}) => {
  return (
    <AntTitle level={level} className={className} style={style}>
      {children}
    </AntTitle>
  );
};

type TextProps = {
  children: React.ReactNode;
  className?: string;
  type?: 'secondary' | 'success' | 'warning' | 'danger';
  strong?: boolean;
};

export const Text: React.FC<TextProps> = ({
  children,
  className = '',
  type,
  strong,
}) => {
  return (
    <AntText type={type} strong={strong} className={className}>
      {children}
    </AntText>
  );
};

type ParagraphProps = {
  children: React.ReactNode;
  className?: string;
  ellipsis?: boolean | { rows?: number };
  style?: React.CSSProperties;
};

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  className = '',
  ellipsis,
  style,
}) => {
  return (
    <AntParagraph ellipsis={ellipsis} className={className} style={style}>
      {children}
    </AntParagraph>
  );
};