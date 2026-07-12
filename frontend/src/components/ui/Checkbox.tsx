import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className="flex items-center gap-2 text-sm text-slate-700 font-body cursor-pointer select-none"
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500',
            className
          )}
          {...props}
        />
        {label}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
