import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, CreditCard, MapPin } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <Search className="w-7 h-7" />,
    title: 'Discover',
    description: 'Browse hundreds of restaurants and cuisines near you.',
    color: 'bg-brand-50 dark:bg-brand-900/20 text-brand-500',
    border: 'border-brand-200 dark:border-brand-800',
  },
  {
    number: '02',
    icon: <ShoppingCart className="w-7 h-7" />,
    title: 'Choose',
    description: 'Pick your favourite dishes, customise, and add to cart.',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    number: '03',
    icon: <CreditCard className="w-7 h-7" />,
    title: 'Order',
    description: 'Checkout securely with UPI, card, or cash on delivery.',
    color: 'bg-green-50 dark:bg-green-900/20 text-green-500',
    border: 'border-green-200 dark:border-green-800',
  },
  {
    number: '04',
    icon: <MapPin className="w-7 h-7" />,
    title: 'Track',
    description: 'Follow your order live from kitchen to your doorstep.',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
    border: 'border-purple-200 dark:border-purple-800',
  },
];

export const HowItWorks: React.FC = () => (
  <section className="py-20 bg-surface-50 dark:bg-surface-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl font-black text-surface-900 dark:text-white mb-3">
          How Foodora Works
        </h2>
        <p className="text-surface-500 dark:text-surface-400 max-w-lg mx-auto">
          From discovery to delivery — four simple steps to your perfect meal.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Connecting line (desktop) */}
        <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-brand-200 via-blue-200 to-purple-200 dark:from-brand-800 dark:via-blue-800 dark:to-purple-800 z-0" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className={`w-24 h-24 rounded-3xl ${step.color} border-2 ${step.border} flex items-center justify-center mb-5 relative bg-white dark:bg-surface-900 shadow-card`}>
              {step.icon}
              <span className="absolute -top-2 -right-2 text-xs font-black text-white bg-brand-500 w-6 h-6 rounded-full flex items-center justify-center shadow-brand">
                {i + 1}
              </span>
            </div>
            <h3 className="text-lg font-black text-surface-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed max-w-xs">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
