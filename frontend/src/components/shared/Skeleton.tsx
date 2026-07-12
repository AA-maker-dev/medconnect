import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-100', className)}
      {...props}
    />
  );
}

export function DoctorCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
