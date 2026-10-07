import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star, Heart, Truck, Tag } from 'lucide-react';
import type { Restaurant } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useToast } from '../../context/ToastContext';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { IMAGES } from '../../data/images';
import { cn } from '../../utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, className }) => {
  const navigate = useNavigate();
  const { isRestaurantFavorite, toggleRestaurant } = useFavorites();
  const { showToast } = useToast();
  const isFav = isRestaurantFavorite(restaurant.id);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRestaurant(restaurant.id);
    showToast(
      isFav ? 'info' : 'success',
      isFav ? 'Removed from favourites' : 'Added to favourites'
    );
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className={cn(
        'group bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card',
        'hover:shadow-card-hover transition-shadow cursor-pointer',
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={restaurant.coverImage}
          alt={restaurant.name}
          fallback={IMAGES.restaurantPlaceholder}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {restaurant.offer && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-full shadow-md">
              <Tag className="w-3 h-3" />
              {restaurant.offer}
            </span>
          )}
          {!restaurant.isOpen && (
            <span className="px-2.5 py-1 bg-black/70 text-white text-xs font-semibold rounded-full">
              Closed
            </span>
          )}
        </div>
        {/* Favorite button */}
        <button
          onClick={handleFav}
          className={cn(
            'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center',
            'bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm shadow-md',
            'transition-all duration-200 hover:scale-110',
            isFav ? 'text-red-500' : 'text-surface-400 hover:text-red-400'
          )}
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-surface-900 dark:text-white text-base leading-tight">
            {restaurant.name}
          </h3>
          <span className="text-sm text-surface-400 dark:text-surface-500 flex-shrink-0">
            {restaurant.priceRange}
          </span>
        </div>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-3 truncate">
          {restaurant.cuisine.join(' • ')}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-surface-800 dark:text-surface-200">
              {restaurant.rating}
            </span>
            <span className="text-surface-400 text-xs">({restaurant.ratingCount.toLocaleString()})</span>
          </div>
          <span className="text-surface-300 dark:text-surface-600">•</span>
          <div className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <span className="text-surface-300 dark:text-surface-600">•</span>
          <div className="flex items-center gap-1 text-surface-500 dark:text-surface-400">
            <Truck className="w-3.5 h-3.5" />
            <span>{restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
