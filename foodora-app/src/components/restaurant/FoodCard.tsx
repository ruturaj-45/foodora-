import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart } from 'lucide-react';
import type { Food } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import { VegIndicator, Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { formatCurrency, cn } from '../../utils';

interface FoodCardProps {
  food: Food;
  onAddToCart?: (food: Food) => void;
  onOpenDetail?: (food: Food) => void;
  showRestaurant?: boolean;
  restaurantName?: string;
  layout?: 'horizontal' | 'vertical';
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onAddToCart,
  onOpenDetail,
  showRestaurant = false,
  restaurantName,
  layout = 'horizontal',
}) => {
  const { isFoodFavorite, toggleFood } = useFavorites();
  const { showToast } = useToast();
  const isFav = isFoodFavorite(food.id);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFood(food.id);
    showToast(
      isFav ? 'info' : 'success',
      isFav ? 'Removed from favourites' : 'Added to favourites'
    );
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(food);
  };

  if (layout === 'vertical') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={() => onOpenDetail?.(food)}
        className="group bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
      >
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={food.image}
            alt={food.name}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {food.isBestseller && (
            <div className="absolute top-3 left-3">
              <Badge variant="warning">⚡ Bestseller</Badge>
            </div>
          )}
          <button
            onClick={handleFav}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
              'bg-white/90 dark:bg-surface-900/90 shadow-md',
              'transition-all hover:scale-110',
              isFav ? 'text-red-500' : 'text-surface-400'
            )}
          >
            <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <VegIndicator type={food.vegType} size="sm" />
            <h3 className="font-bold text-surface-900 dark:text-white text-sm flex-1 truncate">
              {food.name}
            </h3>
          </div>
          {showRestaurant && restaurantName && (
            <p className="text-xs text-surface-400 mb-1">{restaurantName}</p>
          )}
          <StarRating rating={food.rating} count={food.ratingCount} className="mb-3" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-surface-900 dark:text-white">
              {formatCurrency(food.price)}
            </span>
            <button
              onClick={handleAdd}
              className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
              aria-label={`Add ${food.name} to cart`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Horizontal layout (used in menu)
  return (
    <div
      onClick={() => onOpenDetail?.(food)}
      className={cn(
        'group flex gap-4 p-4 bg-white dark:bg-surface-900 rounded-2xl cursor-pointer',
        'border border-surface-100 dark:border-surface-800',
        'hover:border-brand-200 dark:hover:border-brand-800 transition-all hover:shadow-sm',
        !food.isAvailable && 'opacity-60'
      )}
    >
      <div className="relative w-28 h-24 flex-shrink-0 rounded-2xl overflow-hidden">
        <ImageWithFallback
          src={food.image}
          alt={food.name}
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {!food.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">Unavailable</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <VegIndicator type={food.vegType} size="sm" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-surface-900 dark:text-white text-sm leading-tight">
              {food.name}
            </h4>
            {food.isBestseller && (
              <Badge variant="warning" className="mt-0.5">⚡ Bestseller</Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-surface-400 dark:text-surface-500 line-clamp-2 mb-2">
          {food.description}
        </p>
        <StarRating rating={food.rating} count={food.ratingCount} size="sm" />

        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-surface-900 dark:text-white text-sm">
            {formatCurrency(food.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={!food.isAvailable}
            className={cn(
              'px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
              food.isAvailable
                ? 'bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-200 hover:border-brand-500'
                : 'bg-surface-100 text-surface-400 cursor-not-allowed'
            )}
            aria-label={`Add ${food.name} to cart`}
          >
            ADD
          </button>
        </div>
      </div>

      <button
        onClick={handleFav}
        className={cn(
          'self-start mt-1 p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors',
          isFav ? 'text-red-500' : 'text-surface-300 hover:text-red-400'
        )}
        aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
      >
        <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
      </button>
    </div>
  );
};
