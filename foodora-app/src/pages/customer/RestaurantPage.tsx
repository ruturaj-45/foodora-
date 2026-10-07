import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Share2, Star, Clock, Truck, Tag,
  Search, X, ChevronUp, ShoppingCart
} from 'lucide-react';
import { getRestaurantById } from '../../data/restaurants';
import { getFoodsByRestaurant } from '../../data/foods';
import type { Food } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { FoodCard } from '../../components/restaurant/FoodCard';
import { FoodDetailModal } from './FoodDetailModal';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { Badge } from '../../components/ui/Badge';
import { StarRating } from '../../components/ui/StarRating';
import { Button } from '../../components/ui/Button';
import { IMAGES } from '../../data/images';
import { cn, formatCurrency } from '../../utils';

const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRestaurantFavorite, toggleRestaurant } = useFavorites();
  const { items, itemCount, getSubtotal } = useCart();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  const restaurant = id ? getRestaurantById(id) : undefined;
  const allFoods = id ? getFoodsByRestaurant(id) : [];
  const isFav = id ? isRestaurantFavorite(id) : false;

  useEffect(() => {
    const onScroll = () => setHeaderCollapsed(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-surface-800 dark:text-white mb-4">Restaurant not found</p>
          <Button onClick={() => navigate('/restaurants')}>Back to Restaurants</Button>
        </div>
      </div>
    );
  }

  const categories = ['Recommended', ...restaurant.menuCategories.map((c) => c.name).filter((n) => n !== 'Recommended')];

  const getFoodsByCategory = (cat: string) => {
    let foods = allFoods;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      foods = foods.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }
    if (cat === 'Recommended') return foods.filter((f) => f.isBestseller || f.rating >= 4.5);
    return foods.filter((f) => f.category.toLowerCase() === cat.toLowerCase() ||
      f.category.toLowerCase().includes(cat.toLowerCase()));
  };

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const el = categoryRefs.current[cat];
    if (el) {
      const offset = 200;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const cartItemsFromHere = items.filter((i) => i.restaurantId === restaurant.id);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Hero Cover */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <ImageWithFallback
          src={restaurant.coverImage}
          alt={restaurant.name}
          fallback={IMAGES.restaurantPlaceholder}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back & Actions */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => showToast('info', 'Link copied!', 'Share this restaurant with friends.')}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                toggleRestaurant(restaurant.id);
                showToast(isFav ? 'info' : 'success', isFav ? 'Removed from favourites' : 'Added to favourites');
              }}
              className={cn(
                'w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all',
                isFav ? 'text-red-400' : 'text-white hover:bg-white/30'
              )}
              aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart className={cn('w-5 h-5', isFav && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-surface-900 rounded-3xl -mt-12 relative z-10 p-6 shadow-card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-surface-800 shadow-md flex-shrink-0">
              <ImageWithFallback
                src={restaurant.logo}
                alt={`${restaurant.name} logo`}
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-2xl font-black text-surface-900 dark:text-white">{restaurant.name}</h1>
                {restaurant.offer && (
                  <Badge variant="brand" className="mt-1">
                    <Tag className="w-3 h-3 mr-1" />
                    {restaurant.offer}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
                {restaurant.cuisine.join(' • ')}
              </p>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-4">
                {restaurant.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4">
                <StarRating rating={restaurant.rating} count={restaurant.ratingCount} size="md" />
                <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>{restaurant.deliveryFee === 0 ? 'Free delivery' : `₹${restaurant.deliveryFee} delivery`}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-surface-600 dark:text-surface-400">
                  <span className="font-semibold text-surface-700 dark:text-surface-300">{restaurant.priceRange}</span>
                  <span>· Min. order ₹{restaurant.minOrder}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content + sticky sidebar layout */}
        <div className="flex gap-6 pb-32">
          {/* Category sidebar — desktop */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-[140px] bg-white dark:bg-surface-900 rounded-2xl p-3 shadow-card">
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-2 mb-2">Menu</p>
              <nav className="space-y-0.5">
                {categories.map((cat) => {
                  const count = getFoodsByCategory(cat).length;
                  if (count === 0 && cat !== 'Recommended') return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => scrollToCategory(cat)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left',
                        activeCategory === cat
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                          : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                      )}
                    >
                      <span>{cat}</span>
                      <span className="text-xs text-surface-400">{count}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Menu items */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search within menu..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile category scroll */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                    activeCategory === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food sections */}
            {categories.map((cat) => {
              const catFoods = getFoodsByCategory(cat);
              if (catFoods.length === 0) return null;
              return (
                <div
                  key={cat}
                  ref={(el) => { categoryRefs.current[cat] = el; }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-black text-surface-900 dark:text-white">{cat}</h2>
                    <span className="text-sm text-surface-400">({catFoods.length})</span>
                  </div>
                  <div className="space-y-3">
                    {catFoods.map((food) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        layout="horizontal"
                        onOpenDetail={setSelectedFood}
                        onAddToCart={(f) => setSelectedFood(f)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating cart bar */}
      <AnimatePresence>
        {cartItemsFromHere.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
          >
            <button
              onClick={() => navigate('/cart')}
              className="w-full flex items-center justify-between bg-brand-500 hover:bg-brand-600 text-white px-5 py-4 rounded-2xl shadow-brand transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center font-bold text-sm">
                  {cartItemsFromHere.reduce((s, i) => s + i.quantity, 0)}
                </div>
                <span className="font-semibold">View Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{formatCurrency(getSubtotal())}</span>
                <ShoppingCart className="w-5 h-5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          restaurant={restaurant}
          isOpen={!!selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
};

export default RestaurantPage;
