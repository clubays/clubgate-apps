/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />,
    error: <AlertCircle className="text-rose-500 shrink-0" size={18} />,
    info: <Info className="text-amber-500 shrink-0" size={18} />,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg text-sm text-stone-800 dark:text-stone-200 animate-in slide-in-from-bottom-5 duration-200"
    >
      {icons[type]}
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 rounded"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
}
