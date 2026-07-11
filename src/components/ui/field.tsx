import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/ui/cn';

interface FieldProps {
  children: ReactNode;
  className?: string;
}

interface FieldTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

function FieldRoot({ children, className }: FieldProps): JSX.Element {
  return <label className={cn('flex flex-col gap-2 text-sm', className)}>{children}</label>;
}

function FieldLabel({ children, className, ...props }: FieldTextProps): JSX.Element {
  return <span className={cn('font-medium text-muted', className)} {...props}>{children}</span>;
}

function FieldError({ children, className, ...props }: FieldTextProps): JSX.Element {
  return <span className={cn('text-sm text-danger', className)} {...props}>{children}</span>;
}

export const fieldControlClassName = 'min-h-11 rounded-xl border border-border-strong bg-background px-4 py-3 text-foreground outline-none transition duration-200 placeholder:text-muted-foreground focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60';

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Error: FieldError,
});
