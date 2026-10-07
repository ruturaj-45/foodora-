import React from 'react';
import { cn } from '../../utils';

type BadgeVariant = 'brand' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'veg' | 'nonveg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  veg: 'bg-green-100 text-green-700 border border-green-500',
  nonveg: 'bg-red-100 text-red-700 border border-red-500',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  className,
  children,
}) => (
  <span
    className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variantClasses[variant],
      className
    )}
  >
    {children}
  </span>
);

// Veg / Non-Veg indicator dot
export const VegIndicator: React.FC<{ type: 'veg' | 'non-veg' | 'vegan'; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const dotDim = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center border-2 rounded-sm flex-shrink-0',
        dim,
        isVeg ? 'border-green-600' : 'border-red-600'
      )}
      title={type === 'vegan' ? 'Vegan' : type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={cn('rounded-full', dotDim, isVeg ? 'bg-green-600' : 'bg-red-600')}
      />
    </span>
  );
};
