import { type ReactNode } from 'react';

type BadgeVariant = 'blue' | 'orange' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-dark-500/10 text-dark-200 border-dark-500/20',
};

export function Badge({ variant = 'blue', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
