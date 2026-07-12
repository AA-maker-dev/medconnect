import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from './Input';

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input ref={ref} type={visible ? 'text' : 'password'} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3.5 top-[38px] text-slate-500 hover:text-slate-700"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
