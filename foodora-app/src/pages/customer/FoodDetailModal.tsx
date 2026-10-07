import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import type { Food, Restaurant, FoodCustomization } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { VegIndicator, Badge } from '../../components/ui/Badge';
import { StarRating } from '../../components/ui/StarRating';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { formatCurrency, cn } from '../../utils';

interface FoodDetailModalProps {
  food: Food;
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  restaurant,
  isOpen,
  onClose,
}) => {
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<FoodCustomization[]>([]);
  const [added, setAdded] = useState(false);

  const toggleCustomization = (c: FoodCustomization) => {
    setSelectedCustomizations((prev) =>
      prev.find((x) => x.id === c.id)
        ? prev.filter((x) => x.id !== c.id)
        : [...prev, c]
    );
  };

  const customizationTotal = selectedCustomizations.reduce((s, c) => s + c.price, 0);
  const unitPrice = food.price + customizationTotal;
  const total = unitPrice * quantity;

  const handleAddToCart = () => {
    // Warn if switching restaurant
    const existingRestaurant = items.length > 0 ? items[0].restaurantId : null;
    if (existingRestaurant && existingRestaurant !== restaurant.id) {
      // Clear and add — CartContext handles this
    }

    addItem({
      foodId: food.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: food.name,
      image: food.image,
      basePrice: food.price,
      customizations: selectedCustomizations,
      quantity,
    });

    setAdded(true);
    showToast('success', 'Added to cart', `${quantity}× ${food.name}`);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      <div className="max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative h-64 sm:h-72 overflow-hidden">
          <ImageWithFallback
            src={food.image}
            alt={food.name}
            className="w-full h-full rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-3xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
          {food.isBestseller && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="warning">⚡ Bestseller</Badge>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <VegIndicator type={food.vegType} size="md" />
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-surface-900 dark:text-white leading-tight">
                {food.name}
              </h2>
              <p className="text-sm text-surface-400 dark:text-surface-500 mt-0.5">
                {restaurant.name}
              </p>
            </div>
          </div>

          <StarRating rating={food.rating} count={food.ratingCount} size="md" className="mb-4" />

          <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed mb-5">
            {food.description}
          </p>

          {/* Ingredients */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                Key Ingredients
              </p>
              <div className="flex flex-wrap gap-1.5">
                {food.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="px-2.5 py-1 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 rounded-full text-xs font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Customizations */}
          {food.customizations.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-bold text-surface-800 dark:text-white mb-3">
                Customise Your Order
              </p>
              <div className="space-y-2">
                {food.customizations.map((c) => {
                  const isSelected = selectedCustomizations.some((x) => x.id === c.id);
                  return (
                    <motion.button
                      key={c.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleCustomization(c)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-800'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                            isSelected
                              ? 'border-brand-500 bg-brand-500'
                              : 'border-surface-300 dark:border-surface-600'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-semibold text-surface-800 dark:text-white">
                          {c.name}
                        </span>
                      </div>
                      <span className={cn(
                        'text-sm font-bold',
                        c.price > 0
                          ? 'text-brand-500'
                          : 'text-green-500'
                      )}>
                        {c.price > 0 ? `+${formatCurrency(c.price)}` : 'Free'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Price */}
          <div className="flex items-center justify-between py-4 border-t border-surface-100 dark:border-surface-800 mb-5">
            <div>
              <p className="text-xs text-surface-400 mb-1">Base price</p>
              <p className="text-xl font-black text-surface-900 dark:text-white">
                {formatCurrency(food.price)}
                {customizationTotal > 0 && (
                  <span className="text-sm font-normal text-brand-500 ml-1">
                    +{formatCurrency(customizationTotal)}
                  </span>
                )}
              </p>
            </div>
            {/* Quantity control */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full border-2 border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-400 hover:border-brand-300 transition-colors disabled:opacity-40"
                aria-label="Decrease"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-black text-surface-900 dark:text-white w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors"
                aria-label="Increase"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Total + CTA */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-surface-400">Total</p>
              <p className="text-2xl font-black text-surface-900 dark:text-white">
                {formatCurrency(total)}
              </p>
            </div>
            <Button
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              disabled={!food.isAvailable}
              leftIcon={added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              className={cn(
                'flex-1 transition-all',
                added && '!bg-green-500 hover:!bg-green-500'
              )}
            >
              {!food.isAvailable
                ? 'Currently Unavailable'
                : added
                ? 'Added!'
                : `Add to Cart — ${formatCurrency(total)}`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FoodDetailModal;
