import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  to?: string;
  accent?: 'teal' | 'coral' | 'amber' | 'success';
  isLoading?: boolean;
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  teal: 'bg-teal-100 text-teal-700',
  coral: 'bg-coral-100 text-coral-600',
  amber: 'bg-amber-100 text-amber-600',
  success: 'bg-success-100 text-success-600',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  to,
  accent = 'teal',
  isLoading,
}: StatCardProps) {
  const content = (
    <motion.div
      whileHover={to ? { y: -3 } : undefined}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm hover:shadow-md transition-shadow duration-base h-full"
    >
      <div className={cn('h-11 w-11 rounded-md flex items-center justify-center shrink-0', ACCENT_CLASSES[accent])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-body truncate">{label}</p>
        <p className="font-display text-2xl text-slate-900">
          {isLoading ? '—' : value}
        </p>
      </div>
    </motion.div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
