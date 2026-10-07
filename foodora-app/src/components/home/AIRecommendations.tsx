import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, MapPin, RotateCcw } from 'lucide-react';
import { foods } from '../../data/foods';
import { restaurants } from '../../data/restaurants';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { VegIndicator } from '../ui/Badge';
import { formatCurrency } from '../../utils';
import { Plus } from 'lucide-react';

const reasonIcons: Record<string, React.ReactNode> = {
  order: <RotateCcw className="w-3 h-3" />,
  trending: <TrendingUp className="w-3 h-3" />,
  location: <MapPin className="w-3 h-3" />,
  similar: <Sparkles className="w-3 h-3" />,
};

const recommendations = [
  { foodId: 'food-201', reason: 'order', reasonText: 'Because you ordered Biryani' },
  { foodId: 'food-302', reason: 'trending', reasonText: 'Highly rated this week' },
  { foodId: 'food-101', reason: 'location', reasonText: 'Popular near you' },
  { foodId: 'food-601', reason: 'similar', reasonText: 'You may also like' },
  { foodId: 'food-401', reason: 'trending', reasonText: 'Trending in your area' },
  { foodId: 'food-701', reason: 'similar', reasonText: 'Pairs well with your order' },
];

export const AIRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const items = recommendations
    .map(({ foodId, reason, reasonText }) => {
      const food = foods.find((f) => f.id === foodId);
      const rest = food ? restaurants.find((r) => r.id === food.restaurantId) : null;
      return food && rest ? { food, rest, reason, reasonText } : null;
    })
    .filter(Boolean) as Array<{ food: (typeof foods)[0]; rest: (typeof restaurants)[0]; reason: string; reasonText: string }>;

  const handleAdd = (item: typeof items[0]) => {
    addItem({
      foodId: item.food.id,
      restaurantId: item.food.restaurantId,
      restaurantName: item.rest.name,
      name: item.food.name,
      image: item.food.image,
      basePrice: item.food.price,
      customizations: [],
      quantity: 1,
    });
    showToast('success', 'Added to cart', item.food.name);
  };

  return (
    <section className="py-16 bg-white dark:bg-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-brand-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-black text-surface-900 dark:text-white">
              SmartBite AI Picks
            </h2>
          </div>
          <p className="text-surface-500 dark:text-surface-400">
            Personalised food suggestions based on your recent choices.{' '}
            <span className="text-xs text-surface-400 italic">(Demo recommendations)</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ food, rest, reason, reasonText }, i) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group flex gap-4 p-4 bg-surface-50 dark:bg-surface-800 rounded-2xl hover:bg-surface-100 dark:hover:bg-surface-750 transition-all cursor-pointer"
              onClick={() => navigate(`/restaurant/${food.restaurantId}`)}
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                {/* Reason tag */}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full mb-1.5">
                  {reasonIcons[reason]}
                  {reasonText}
                </span>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <VegIndicator type={food.vegType} size="sm" />
                  <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate">
                    {food.name}
                  </h4>
                </div>
                <p className="text-xs text-surface-400 mb-2 truncate">{rest.name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-surface-900 dark:text-white text-sm">
                    {formatCurrency(food.price)}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAdd({ food, rest, reason, reasonText }); }}
                    className="w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
