import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import {
  ConfirmOptions,
  FeedbackTone,
  ToastItem,
  registerConfirmListener,
  subscribeToasts,
} from '../utils/feedback';

const TONE_STYLES: Record<
  FeedbackTone,
  {
    wrapper: string;
    iconColor: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  success: {
    wrapper: 'border-emerald-600/45 bg-theme-panel text-theme-primary shadow-xl',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    Icon: CheckCircle2,
  },
  error: {
    wrapper: 'border-red-600/45 bg-theme-panel text-theme-primary shadow-xl',
    iconColor: 'text-red-700 dark:text-red-300',
    Icon: XCircle,
  },
  warning: {
    wrapper: 'border-amber-600/45 bg-theme-panel text-theme-primary shadow-xl',
    iconColor: 'text-amber-700 dark:text-amber-300',
    Icon: AlertTriangle,
  },
  info: {
    wrapper: 'border-theme-accent/50 bg-theme-panel text-theme-primary shadow-xl',
    iconColor: 'text-theme-accent',
    Icon: Info,
  },
};

export default function FeedbackHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmReq, setConfirmReq] = useState<{
    id: string;
    options: ConfirmOptions;
    resolve: (confirmed: boolean) => void;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToasts((toast) => {
      setToasts((prev) => {
        // Deduplicate identical messages stacked in rapid clicks
        const filtered = prev.filter((item) => item.message !== toast.message);
        return [...filtered.slice(-2), toast];
      });
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.duration);
    });

    registerConfirmListener((req) => {
      setConfirmReq(req);
    });

    return () => {
      unsubscribe();
      registerConfirmListener(null);
    };
  }, []);

  useEffect(() => {
    if (!confirmReq) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        confirmReq.resolve(false);
        setConfirmReq(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        confirmReq.resolve(true);
        setConfirmReq(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmReq]);

  const closeConfirm = (result: boolean) => {
    if (!confirmReq) return;
    confirmReq.resolve(result);
    setConfirmReq(null);
  };

  return (
    <>
      {/* Non-blocking Toast Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed top-[max(0.75rem,env(safe-area-inset-top,12px))] right-3 left-3 sm:left-auto sm:right-5 sm:max-w-sm z-[120] flex flex-col gap-2 pointer-events-none"
        >
          {toasts.map((toast) => {
            const style = TONE_STYLES[toast.tone];
            const Icon = style.Icon;
            return (
              <div
                key={toast.id}
                role="status"
                className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 ${style.wrapper}`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
                <p className="flex-1 text-xs sm:text-sm font-medium leading-snug break-words">
                  {toast.message}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setToasts((prev) => prev.filter((item) => item.id !== toast.id))
                  }
                  aria-label="Đóng thông báo"
                  className="p-1 -m-1 rounded-lg text-theme-primary/50 hover:text-theme-primary hover:bg-theme-hover transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* In-app Accessible Confirmation Modal */}
      {confirmReq && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-confirm-title"
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 pt-safe pb-safe bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => closeConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-theme-panel border border-theme-subtle rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmReq.options.danger
                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                    : 'bg-theme-accent/15 text-theme-accent border border-theme-accent/30'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  id="feedback-confirm-title"
                  className="text-base sm:text-lg font-serif font-bold text-theme-primary"
                >
                  {confirmReq.options.title || 'Xác nhận thao tác'}
                </h3>
                <p className="text-xs sm:text-sm text-theme-primary/80 mt-1 leading-relaxed break-words">
                  {confirmReq.options.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-theme-subtle/60">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-theme-subtle bg-theme-base hover:bg-theme-hover text-theme-primary text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {confirmReq.options.cancelText || 'Hủy'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => closeConfirm(true)}
                className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-sm ${
                  confirmReq.options.danger
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted'
                }`}
              >
                {confirmReq.options.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
