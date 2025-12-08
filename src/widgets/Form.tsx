import { ReactNode } from 'react';
import { cn_fallback as cn } from '../utils/cn';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  helperText,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

export function Form({ onSubmit, children, className }: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6', className)}
    >
      {children}
    </form>
  );
}

export interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}