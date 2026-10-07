import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, UtensilsCrossed, Plus } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { restaurants } from '../../data/restaurants';
import { foods } from '../../data/foods';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { VegIndicator, Badge } from '../../components/ui/Badge';
import { StarRating } from '../../components/ui/StarRating';
import { formatCurrency, cn } from '../../utils';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favoriteRestaurants, favoriteFoods, toggleRestaurant, toggleFood, isFoodFavorite } = useFavorites();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('restaurants');

  const favRests = restaurants.filter((r) => favoriteRestaurants.includes(r.id));
  const favFoods = foods.filter((f) => favoriteFoods.includes(f.id));

  const handleAddFood = (food: typeof foods[0]) => {
    const rest = restaurants.find((r) => r.id === food.restaurantId);
    if (!rest) return;
    addItem({
      foodId: food.id,
      restaurantId: food.restaurantId,
      restaurantName: rest.name,
      name: food.name,
      image: food.image,
      basePrice: food.price,
      customizations: [],
      quantity: 1,
    });
    showToast('success', 'Added to cart', food.name);
  };

  const tabs = [
    { id: 'restaurants', label: 'Restaurants', count: favRests.length },
    { id: 'foods', label: 'Dishes', count: favFoods.length },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </div>
          <h1 className="text-3xl font-black text-surface-900 dark:text-white">Favourites</h1>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

        <AnimatePresence mode="wait">
          {activeTab === 'restaurants' && (
            <motion.div key="restaurants" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {favRests.length === 0 ? (
                <EmptyState
                  icon={<UtensilsCrossed className="w-12 h-12" />}
                  title="No favourite restaurants yet"
                  description="Save restaurants you love and find them here quickly."
                  action={{ label: 'Browse Restaurants', onClick: () => navigate('/restaurants') }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {favRests.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <RestaurantCard restaurant={r} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'foods' && (
            <motion.div key="foods" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {favFoods.length === 0 ? (
                <EmptyState
                  icon={<Heart className="w-12 h-12" />}
                  title="No favourite dishes yet"
                  description="Save dishes you love and add them to cart with one tap."
                  action={{ label: 'Explore Menus', onClick: () => navigate('/restaurants') }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favFoods.map((food, i) => {
                    const rest = restaurants.find((r) => r.id === food.restaurantId);
                    const isFav = isFoodFavorite(food.id);
                    return (
                      <motion.div
                        key={food.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="group bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer"
                        onClick={() => navigate(`/restaurant/${food.restaurantId}`)}
                      >
                        <div className="relative h-40 overflow-hidden">
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFood(food.id);
                              showToast('info', 'Removed from favourites', food.name);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-surface-800/90 flex items-center justify-center text-red-500 hover:scale-110 transition-all shadow-md"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <VegIndicator type={food.vegType} size="sm" />
                            <h3 className="text-sm font-bold text-surface-900 dark:text-white truncate flex-1">
                              {food.name}
                            </h3>
                          </div>
                          <p className="text-xs text-surface-400 mb-2">{rest?.name}</p>
                          <StarRating rating={food.rating} count={food.ratingCount} size="sm" className="mb-3" />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-surface-900 dark:text-white">
                              {formatCurrency(food.price)}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddFood(food); }}
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FavoritesPage;
