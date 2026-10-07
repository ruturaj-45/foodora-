import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  count,
  size = 'sm',
  showCount = true,
  className,
}) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star className={cn(starSize, 'fill-amber-400 text-amber-400')} />
      <span className={cn('font-semibold text-surface-800 dark:text-white', textSize)}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn('text-surface-400', textSize)}>({count.toLocaleString()})</span>
      )}
    </div>
  );
};

interface InteractiveStarProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export const InteractiveStar: React.FC<InteractiveStarProps> = ({
  value,
  onChange,
  max = 5,
}) => {
  const [hovered, setHovered] = React.useState(0);

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < (hovered || value);
        return (
          <button
            key={i}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${i + 1} stars`}
          >
            <Star
              className={cn(
                'w-7 h-7 transition-colors',
                filled ? 'fill-amber-400 text-amber-400' : 'text-surface-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
