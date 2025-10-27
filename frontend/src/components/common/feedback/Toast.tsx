import { message } from 'antd';
import type { ReactNode } from 'react';

message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading';

export interface ToastOptions {
  duration?: number;
  key?: string;
  onClose?: () => void;
}

/**
 * Simple global toast utility wrapping Ant Design's message API.
 *
 * Examples:
 * Toast.success('Saved successfully!');
 * const key = 'updating';
 * Toast.loading('Updating...', { key, duration: 0 });
 * // later
 * Toast.closeAll();
 */

const show = (type: ToastType, content: ReactNode, opts?: ToastOptions) =>
  message.open({
    type,
    content,
    duration: opts?.duration,
    key: opts?.key,
    onClose: opts?.onClose,
  });

export const Toast = {
  success: (content: ReactNode, opts?: ToastOptions) => show('success', content, opts),
  info: (content: ReactNode, opts?: ToastOptions) => show('info', content, opts),
  warning: (content: ReactNode, opts?: ToastOptions) => show('warning', content, opts),
  error: (content: ReactNode, opts?: ToastOptions) => show('error', content, opts),
  loading: (content: ReactNode, opts?: ToastOptions) => show('loading', content, opts),

  // Remove all toasts
  closeAll: () => message.destroy(),
};

export default Toast;