'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let idCounter = 0;

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />,
  error:   <XCircle    className="h-5 w-5 shrink-0 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />,
  info:    <Info       className="h-5 w-5 shrink-0 text-blue-500" />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-l-emerald-500 bg-white dark:bg-[#1d2320]',
  error:   'border-l-red-500    bg-white dark:bg-[#1d2320]',
  warning: 'border-l-amber-500  bg-white dark:bg-[#1d2320]',
  info:    'border-l-blue-500   bg-white dark:bg-[#1d2320]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast: toast }}>
      {children}

      {/* Toast portal — always on top of everything including CookieBanner (z-50) */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.93,
                y: 8,
                transition: { duration: 0.18 },
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              role="status"
              className={`
                pointer-events-auto
                flex items-start gap-3
                px-4 py-3.5
                rounded-2xl
                border border-[var(--border)]
                border-l-4
                shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
                text-sm font-medium
                text-stone-800 dark:text-stone-100
                ${TOAST_STYLES[t.type]}
              `}
            >
              {/* Icon */}
              <span className="mt-0.5">{TOAST_ICONS[t.type]}</span>

              {/* Message */}
              <span className="flex-1 leading-snug">{t.message}</span>

              {/* Dismiss button */}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="ml-1 mt-0.5 shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
