import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Star, Clock, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { IMAGES } from '../../data/images';

const SUGGESTIONS = ['Chicken Biryani', 'Pizza', 'Burger', 'Chinese', 'Spice Villa', 'South Indian'];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  const handleSuggestion = (s: string) => {
    navigate(`/restaurants?search=${encodeURIComponent(s)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 pt-8 pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-100/40 dark:bg-brand-900/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-amber-100/50 dark:bg-amber-900/10 blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text + Search */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 rounded-full text-xs font-semibold mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Free delivery on first order
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-surface-900 dark:text-white leading-[1.05] tracking-tight mb-6">
              Good Food.{' '}
              <span className="text-brand-500">Great Mood.</span>{' '}
              Delivered.
            </h1>

            <p className="text-lg text-surface-500 dark:text-surface-400 leading-relaxed mb-8 max-w-lg">
              Discover delicious food from your favourite restaurants, order effortlessly, and track every bite from kitchen to doorstep.
            </p>

            {/* Search box */}
            <div className="relative mb-6">
              <form onSubmit={handleSearch}>
                <div className="flex gap-2 p-2 bg-white dark:bg-surface-800 rounded-2xl shadow-lg border border-surface-200 dark:border-surface-700">
                  <div className="flex items-center gap-2 px-3 border-r border-surface-200 dark:border-surface-700 cursor-pointer">
                    <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="text-sm text-surface-500 dark:text-surface-400 hidden sm:block whitespace-nowrap">
                      Bangalore
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-2">
                    <Search className="w-4 h-4 text-surface-400 flex-shrink-0" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Search for dishes, restaurants or cuisines..."
                      className="flex-1 bg-transparent text-sm text-surface-900 dark:text-white placeholder:text-surface-400 outline-none min-w-0"
                    />
                  </div>
                  <Button type="submit" size="sm" className="flex-shrink-0 rounded-xl">
                    Search
                  </Button>
                </div>
              </form>

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-700 overflow-hidden z-20"
                >
                  <div className="p-3">
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-2 mb-2">
                      Popular searches
                    </p>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => handleSuggestion(s)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 text-left transition-colors"
                      >
                        <Search className="w-4 h-4 text-surface-400" />
                        <span className="text-sm text-surface-700 dark:text-surface-300">{s}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate('/restaurants')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Explore Restaurants
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/orders')}
              >
                Track My Order
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-surface-200 dark:border-surface-800">
              {[
                { value: '500+', label: 'Restaurants' },
                { value: '50K+', label: 'Happy Customers' },
                { value: '4.8★', label: 'Avg Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-surface-900 dark:text-white">{value}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            {/* Main food image */}
            <div className="relative w-full max-w-md mx-auto">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <div className="w-72 h-72 rounded-full overflow-hidden mx-auto shadow-2xl ring-8 ring-white dark:ring-surface-800">
                  <ImageWithFallback
                    src={IMAGES.foods.chickenBiryani}
                    alt="Delicious Biryani"
                    className="w-full h-full"
                  />
                </div>
              </motion.div>

              {/* Floating card — restaurant */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-8 top-12 bg-white dark:bg-surface-800 rounded-2xl p-3 shadow-xl flex items-center gap-3 w-52"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={IMAGES.logos.biryaniHouse} alt="Biryani House" className="w-full h-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-surface-900 dark:text-white truncate">The Biryani House</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">4.8</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — delivery */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-4 top-1/3 bg-brand-500 text-white rounded-2xl p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <div>
                    <p className="text-xs font-bold leading-none">30 min</p>
                    <p className="text-[10px] opacity-80">delivery</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — offer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="absolute -right-2 bottom-12 bg-white dark:bg-surface-800 rounded-2xl p-3 shadow-xl flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Tag className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-surface-900 dark:text-white">20% OFF</p>
                  <p className="text-[10px] text-surface-400">Use FOOD20</p>
                </div>
              </motion.div>

              {/* Second food image */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 left-8 w-20 h-20 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white dark:ring-surface-800"
              >
                <ImageWithFallback src={IMAGES.foods.pepperoni} alt="Pizza" className="w-full h-full" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-0 right-12 w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white dark:ring-surface-800"
              >
                <ImageWithFallback src={IMAGES.foods.beefBurger} alt="Burger" className="w-full h-full" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
