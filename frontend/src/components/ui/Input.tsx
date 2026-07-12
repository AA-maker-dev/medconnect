import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 font-body"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'h-11 w-full rounded-md border bg-paper-0 px-3.5 text-base text-slate-900 font-body placeholder:text-slate-500',
            'transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
            error ? 'border-danger-600' : 'border-slate-300',
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-danger-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-sm text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
