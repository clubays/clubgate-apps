import React from 'react';
import { CornerBrackets } from '@/components/brand/CornerBrackets';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withBrackets?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, withBrackets = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-[6px] border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] transition-colors',
          className
        )}
        {...props}
      >
        {withBrackets && <CornerBrackets />}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
