import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plus } from 'lucide-react';
import { getTrendingFoods } from '../../data/foods';
import { restaurants } from '../../data/restaurants';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useFavorites } from '../../context/FavoritesContext';
import { VegIndicator, Badge } from '../ui/Badge';
import { StarRating } from '../ui/StarRating';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils';
import { Heart } from 'lucide-react';
import { cn } from '../../utils';

export const TrendingDishes: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { isFoodFavorite, toggleFood } = useFavorites();
  const trendingFoods = getTrendingFoods();

  const handleAdd = (food: ReturnType<typeof getTrendingFoods>[0]) => {
    const restaurant = restaurants.find((r) => r.id === food.restaurantId);
    if (!restaurant) return;
    addItem({
      foodId: food.id,
      restaurantId: food.restaurantId,
      restaurantName: restaurant.name,
      name: food.name,
      image: food.image,
      basePrice: food.price,
      customizations: [],
      quantity: 1,
    });
    showToast('success', 'Added to cart', food.name);
  };

  return (
    <section className="py-16 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-black text-surface-900 dark:text-white mb-2">
              Trending Right Now 🔥
            </h2>
            <p className="text-surface-500 dark:text-surface-400">
              The most-loved dishes this week.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/restaurants')}
            className="hidden sm:flex"
          >
            View All
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {trendingFoods.slice(0, 8).map((food, i) => {
            const rest = restaurants.find((r) => r.id === food.restaurantId);
            const isFav = isFoodFavorite(food.id);

            return (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="group bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer"
                onClick={() => navigate(`/restaurant/${food.restaurantId}`)}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <ImageWithFallback
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {food.isBestseller && <Badge variant="warning">⚡ Bestseller</Badge>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFood(food.id);
                      showToast(isFav ? 'info' : 'success', isFav ? 'Removed from favourites' : 'Saved to favourites');
                    }}
                    className={cn(
                      'absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-surface-800/90 flex items-center justify-center shadow-md transition-all hover:scale-110',
                      isFav ? 'text-red-500' : 'text-surface-400'
                    )}
                  >
                    <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <VegIndicator type={food.vegType} size="sm" />
                    <h3 className="text-sm font-bold text-surface-900 dark:text-white truncate flex-1">
                      {food.name}
                    </h3>
                  </div>
                  <p className="text-xs text-surface-400 mb-2 truncate">
                    {rest?.name}
                  </p>
                  <StarRating rating={food.rating} count={food.ratingCount} size="sm" className="mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-surface-900 dark:text-white text-sm">
                      {formatCurrency(food.price)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAdd(food); }}
                      className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors shadow-brand"
                      aria-label={`Add ${food.name} to cart`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
