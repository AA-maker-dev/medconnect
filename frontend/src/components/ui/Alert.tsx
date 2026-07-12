import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AlertProps {
  variant: 'error' | 'success';
  children: ReactNode;
  className?: string;
}

export function Alert({ variant, children, className }: AlertProps) {
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-md border px-3.5 py-3 text-sm font-body',
        variant === 'error'
          ? 'border-danger-600/30 bg-danger-100 text-danger-600'
          : 'border-success-600/30 bg-success-100 text-success-600',
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
