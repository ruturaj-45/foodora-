import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronDown, Star,
  Clock, Truck, Leaf, Tag, UtensilsCrossed
} from 'lucide-react';
import { restaurants } from '../../data/restaurants';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils';

type SortOption = 'recommended' | 'rating' | 'delivery_time' | 'price_low' | 'price_high';

const priceMap: Record<string, number> = { '₹': 1, '₹₹': 2, '₹₹₹': 3, '₹₹₹₹': 4 };

const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Pizza', 'Burgers', 'Biryani', 'Italian', 'Mexican', 'Healthy', 'Desserts'];

const RestaurantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(() => {
    const c = searchParams.get('cuisine');
    return c ? [c] : [];
  });
  const [minRating, setMinRating] = useState(0);
  const [maxDelivery, setMaxDelivery] = useState(60);
  const [vegOnly, setVegOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let result = [...restaurants];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCuisines.length > 0) {
      result = result.filter((r) =>
        selectedCuisines.some((sc) =>
          r.cuisine.some((c) => c.toLowerCase().includes(sc.toLowerCase()))
        )
      );
    }

    if (minRating > 0) result = result.filter((r) => r.rating >= minRating);
    if (freeDelivery) result = result.filter((r) => r.deliveryFee === 0);
    if (offersOnly) result = result.filter((r) => !!r.offer);

    switch (sortBy) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'delivery_time':
        result.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime)); break;
      case 'price_low':
        result.sort((a, b) => priceMap[a.priceRange] - priceMap[b.priceRange]); break;
      case 'price_high':
        result.sort((a, b) => priceMap[b.priceRange] - priceMap[a.priceRange]); break;
    }

    return result;
  }, [searchQuery, selectedCuisines, minRating, freeDelivery, offersOnly, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCuisines([]);
    setMinRating(0);
    setMaxDelivery(60);
    setVegOnly(false);
    setOffersOnly(false);
    setFreeDelivery(false);
    setSearchParams({});
  };

  const hasFilters =
    searchQuery || selectedCuisines.length > 0 || minRating > 0 ||
    vegOnly || offersOnly || freeDelivery;

  const toggleCuisine = (c: string) =>
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'delivery_time', label: 'Fastest Delivery' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants or cuisines..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-11 pl-4 pr-10 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 appearance-none cursor-pointer min-w-[180px]"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <Button
              variant={filterOpen ? 'primary' : 'secondary'}
              size="md"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters
              {hasFilters && (
                <span className="ml-1 w-5 h-5 rounded-full bg-white text-brand-500 text-xs font-bold flex items-center justify-center">
                  {[searchQuery, ...selectedCuisines, minRating > 0 ? 1 : 0, vegOnly ? 1 : 0, offersOnly ? 1 : 0, freeDelivery ? 1 : 0].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-4">
                  {/* Quick filter pills */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFreeDelivery(!freeDelivery)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        freeDelivery
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                      )}
                    >
                      <Truck className="w-3.5 h-3.5" /> Free Delivery
                    </button>
                    <button
                      onClick={() => setOffersOnly(!offersOnly)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        offersOnly
                          ? 'bg-brand-500 border-brand-500 text-white'
                          : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                      )}
                    >
                      <Tag className="w-3.5 h-3.5" /> Offers
                    </button>
                    {[3.5, 4.0, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(minRating === r ? 0 : r)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                          minRating === r
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                        )}
                      >
                        <Star className="w-3.5 h-3.5" /> {r}+
                      </button>
                    ))}
                  </div>

                  {/* Cuisine filter */}
                  <div>
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Cuisines</p>
                    <div className="flex flex-wrap gap-2">
                      {CUISINES.map((c) => (
                        <button
                          key={c}
                          onClick={() => toggleCuisine(c)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                            selectedCuisines.includes(c)
                              ? 'bg-brand-500 border-brand-500 text-white'
                              : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X className="w-3.5 h-3.5" />}>
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              <span className="font-bold text-surface-900 dark:text-white">{filtered.length}</span> restaurants found
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-brand-500 hover:text-brand-600 font-semibold">
                Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="w-12 h-12" />}
            title="No restaurants found"
            description="Try adjusting your search or removing some filters."
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((restaurant, i) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
