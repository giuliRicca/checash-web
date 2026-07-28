import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/ui/cn';

interface MoneyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  { className, leading, ...props },
  ref,
): JSX.Element {
  return (
    <div className="flex overflow-hidden rounded-xl border border-border-strong bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background">
      {leading}
      <span className="flex items-center border-r border-border-strong px-4 text-lg font-bold text-muted" aria-hidden="true">$</span>
      <input ref={ref} className={cn('min-h-11 min-w-0 flex-1 bg-transparent px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground', className)} inputMode="decimal" {...props} />
    </div>
  );
});

MoneyInput.displayName = 'MoneyInput';
