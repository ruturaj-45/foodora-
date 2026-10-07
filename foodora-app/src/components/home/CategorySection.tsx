import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { IMAGES } from '../../data/images';

const categories = [
  { id: 'pizza', name: 'Pizza', image: IMAGES.categories.pizza, count: 48, emoji: '🍕' },
  { id: 'burger', name: 'Burgers', image: IMAGES.categories.burger, count: 62, emoji: '🍔' },
  { id: 'biryani', name: 'Biryani', image: IMAGES.categories.biryani, count: 35, emoji: '🍛' },
  { id: 'chinese', name: 'Chinese', image: IMAGES.categories.chinese, count: 41, emoji: '🥢' },
  { id: 'south indian', name: 'South Indian', image: IMAGES.categories.southIndian, count: 29, emoji: '🫓' },
  { id: 'desserts', name: 'Desserts', image: IMAGES.categories.desserts, count: 53, emoji: '🍨' },
  { id: 'beverages', name: 'Beverages', image: IMAGES.categories.beverages, count: 38, emoji: '🥤' },
  { id: 'healthy', name: 'Healthy', image: IMAGES.categories.healthy, count: 24, emoji: '🥗' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const CategorySection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white dark:bg-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl font-black text-surface-900 dark:text-white mb-2">
            What are you craving?
          </h2>
          <p className="text-surface-500 dark:text-surface-400">
            Browse by cuisine — we've got something for every mood.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              variants={item}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              onClick={() => navigate(`/restaurants?cuisine=${encodeURIComponent(cat.id)}`)}
              className="flex flex-col items-center gap-2 group focus:outline-none"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 shadow-card group-hover:shadow-card-hover transition-shadow">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-surface-700 dark:text-surface-300 text-center leading-tight">
                {cat.name}
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500 -mt-1">
                {cat.count}+ items
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
