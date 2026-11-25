export type FeedbackTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  tone: FeedbackTone;
  message: string;
  duration: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

type ToastListener = (toast: ToastItem) => void;
type ConfirmListener = (req: {
  id: string;
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
}) => void;

const toastListeners = new Set<ToastListener>();
let confirmListener: ConfirmListener | null = null;

export function subscribeToasts(listener: ToastListener) {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

export function registerConfirmListener(listener: ConfirmListener | null) {
  confirmListener = listener;
}

function emitToast(tone: FeedbackTone, message: string, duration = 3600) {
  const cleanMsg = String(message || '').trim();
  if (!cleanMsg) return;

  if (toastListeners.size === 0) {
    // Graceful fallback if emitted before FeedbackHost mounts
    console.info(`[${tone}] ${cleanMsg}`);
    return;
  }

  const item: ToastItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tone,
    message: cleanMsg,
    duration,
  };
  toastListeners.forEach((fn) => fn(item));
}

export const notify = {
  success: (message: string, duration = 3400) => emitToast('success', message, duration),
  error: (message: string, duration = 4500) => emitToast('error', message, duration),
  warning: (message: string, duration = 4200) => emitToast('warning', message, duration),
  info: (message: string, duration = 3600) => emitToast('info', message, duration),
};

export function confirmAction(options: ConfirmOptions | string): Promise<boolean> {
  const normalized: ConfirmOptions =
    typeof options === 'string' ? { message: options } : options;

  return new Promise((resolve) => {
    if (!confirmListener) {
      resolve(false);
      return;
    }
    confirmListener({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      options: normalized,
      resolve,
    });
  });
}
