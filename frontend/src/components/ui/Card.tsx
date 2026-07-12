import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-100 bg-paper-0 shadow-md',
        className
      )}
      {...props}
    />
  );
}
