import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { restaurants } from '../../data/restaurants';
import { RestaurantCard } from '../restaurant/RestaurantCard';
import { Button } from '../ui/Button';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const FeaturedRestaurants: React.FC = () => {
  const navigate = useNavigate();
  const featured = restaurants.filter((r) => r.status === 'active').slice(0, 6);

  return (
    <section className="py-16 bg-white dark:bg-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-black text-surface-900 dark:text-white mb-2">
              Featured Restaurants
            </h2>
            <p className="text-surface-500 dark:text-surface-400">
              Top-rated picks from the best restaurants near you.
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

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featured.map((restaurant) => (
            <motion.div key={restaurant.id} variants={item}>
              <RestaurantCard restaurant={restaurant} />
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center mt-8 sm:hidden">
          <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/restaurants')}>
            View All Restaurants
          </Button>
        </div>
      </div>
    </section>
  );
};
