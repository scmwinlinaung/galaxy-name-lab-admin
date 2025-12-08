import { InputHTMLAttributes, forwardRef } from 'react';
import { cn_fallback as cn } from '../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">{leftIcon}</div>
            </div>
          )}

          <input
            id={inputId}
            className={cn(
              'block w-full rounded-lg border border-gray-300 py-2 px-3 text-sm placeholder-gray-400 shadow-sm transition-colors',
              'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className={cn('text-gray-400', error && 'text-red-400')}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };