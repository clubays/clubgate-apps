import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warn' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icon = {
            success: <CheckCircle2 className="w-4 h-4 text-[var(--speed)] flex-shrink-0" />,
            warn: <AlertTriangle className="w-4 h-4 text-[var(--warn)] flex-shrink-0" />,
            error: <AlertCircle className="w-4 h-4 text-[var(--danger)] flex-shrink-0" />,
            info: <Info className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />,
          }[t.type];

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-center justify-between gap-2.5 p-3 rounded-[6px] border border-[var(--line)] bg-[var(--surface-2)] shadow-xl text-xs sm:text-sm text-[var(--text)] transition-all'
              )}
            >
              <div className="flex items-center gap-2">
                {icon}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
