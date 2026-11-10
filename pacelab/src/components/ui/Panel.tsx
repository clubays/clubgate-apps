import React from 'react';
import { CornerBrackets } from '@/components/brand/CornerBrackets';
import { cn } from '@/utils/cn';

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  withBrackets?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  badge,
  actions,
  withBrackets = true,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative rounded-[6px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 text-[var(--text)]',
        className
      )}
      {...props}
    >
      {withBrackets && <CornerBrackets />}

      {(title || actions || badge) && (
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5 min-w-0">
            {typeof title === 'string' ? (
              <h3 className="font-heading font-semibold text-sm sm:text-base text-[var(--text)] tracking-tight truncate">
                {title}
              </h3>
            ) : (
              title
            )}
            {badge}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}

      {subtitle && <p className="text-xs text-[var(--muted)] mb-3">{subtitle}</p>}

      {children}
    </div>
  );
};
