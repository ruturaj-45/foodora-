import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 20,
  size = 'md',
  className,
}) => {
  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-sm w-6' : 'text-base w-8';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        className={cn(
          btnSize,
          'rounded-full flex items-center justify-center transition-all duration-200',
          'bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'border border-surface-200 dark:border-surface-700'
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={iconSize} />
      </button>
      <span className={cn('font-bold text-center text-surface-900 dark:text-white', textSize)}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= max}
        className={cn(
          btnSize,
          'rounded-full flex items-center justify-center transition-all duration-200',
          'bg-brand-500 hover:bg-brand-600 text-white',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label="Increase quantity"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
};
