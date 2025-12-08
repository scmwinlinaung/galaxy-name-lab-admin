import { ReactNode } from 'react';
import { cn_fallback as cn } from '../utils/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  hover = false,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={cn(
        'rounded-lg bg-white border border-gray-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        hover && 'transition-shadow hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, actions, children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
        {children}
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-6 pt-6 border-t border-gray-200', className)}>
      {children}
    </div>
  );
}