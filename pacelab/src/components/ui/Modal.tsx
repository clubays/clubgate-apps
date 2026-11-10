import React, { useEffect, useRef } from 'react';
import { CornerBrackets } from '@/components/brand/CornerBrackets';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className={cn(
          'relative w-full rounded-[6px] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 text-[var(--text)] shadow-2xl z-10 max-h-[90vh] flex flex-col',
          sizeStyles[size],
          className
        )}
      >
        <CornerBrackets />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--line)]">
          <div className="font-heading font-semibold text-base sm:text-lg text-[var(--text)]">
            {title}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 pr-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
