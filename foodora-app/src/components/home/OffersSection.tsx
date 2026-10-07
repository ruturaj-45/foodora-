import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Truck, Gift, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

const offers = [
  {
    id: 1,
    icon: <Tag className="w-8 h-8" />,
    badge: 'LIMITED TIME',
    title: '20% OFF',
    subtitle: 'On orders above ₹300',
    code: 'FOOD20',
    bg: 'from-brand-500 to-orange-600',
    textColor: 'text-white',
  },
  {
    id: 2,
    icon: <Truck className="w-8 h-8" />,
    badge: 'ALWAYS FREE',
    title: 'Free Delivery',
    subtitle: 'No minimum order',
    code: 'FREEDELIVERY',
    bg: 'from-blue-500 to-indigo-600',
    textColor: 'text-white',
  },
  {
    id: 3,
    icon: <Gift className="w-8 h-8" />,
    badge: 'NEW USER',
    title: '₹50 OFF',
    subtitle: 'On your first order',
    code: 'WELCOME50',
    bg: 'from-green-500 to-emerald-600',
    textColor: 'text-white',
  },
  {
    id: 4,
    icon: <Zap className="w-8 h-8" />,
    badge: 'WEEKEND SPECIAL',
    title: 'BUY 1 GET 1',
    subtitle: 'On select restaurants',
    code: 'BIRYANI100',
    bg: 'from-purple-500 to-violet-600',
    textColor: 'text-white',
  },
];

export const OffersSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl font-black text-surface-900 dark:text-white mb-2">
            Today's Best Deals
          </h2>
          <p className="text-surface-500 dark:text-surface-400">
            Save big on your next order with these exclusive offers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`bg-gradient-to-br ${offer.bg} rounded-3xl p-6 cursor-pointer relative overflow-hidden`}
              onClick={() => navigate(`/restaurants`)}
            >
              {/* Background circle decoration */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -right-2 -top-4 w-20 h-20 rounded-full bg-white/10" />

              <div className={`relative z-10 ${offer.textColor}`}>
                <div className="mb-4 opacity-90">{offer.icon}</div>
                <span className="text-xs font-bold opacity-70 tracking-widest uppercase">
                  {offer.badge}
                </span>
                <h3 className="text-2xl font-black mt-1 mb-1">{offer.title}</h3>
                <p className="text-sm opacity-80 mb-4">{offer.subtitle}</p>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">
                    {offer.code}
                  </code>
                  <Button
                    size="xs"
                    className="!bg-white !text-surface-900 hover:!bg-opacity-90 font-bold"
                    onClick={(e) => { e.stopPropagation(); navigate('/restaurants'); }}
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
