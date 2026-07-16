import { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 font-body">
            {label}
          </label>
        )}
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id={inputId}
            ref={ref}
            type={visible ? 'text' : 'password'}
            aria-invalid={Boolean(error)}
            className={cn(
              'h-12 w-full rounded-lg border bg-paper-0 pl-11 pr-11 text-base text-slate-900 font-body placeholder:text-slate-400',
              'transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              error ? 'border-danger-600' : 'border-slate-300',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-fast"
            tabIndex={-1}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error ? (
          <p className="text-sm text-danger-600">{error}</p>
        ) : hint ? (
          <p className="text-sm text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
