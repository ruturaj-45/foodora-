import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Tag, ChevronRight, ShoppingBag, Plus, Minus, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { validateCoupon, calculateDiscount } from '../../data/coupons';
import type { Coupon, FoodCustomization } from '../../types';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency, cn } from '../../utils';

const DELIVERY_FEE = 40;
const TAX_RATE = 0.06; // 6%

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, restaurantName } = useCart();
  const { showToast } = useToast();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = appliedCoupon?.type === 'free_delivery' ? 0 : DELIVERY_FEE;
  const tax = Math.round(subtotal * TAX_RATE);
  const discount = appliedCoupon ? Math.round(calculateDiscount(appliedCoupon, subtotal, DELIVERY_FEE)) : 0;
  const grandTotal = subtotal + deliveryFee + tax - discount;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setTimeout(() => {
      const result = validateCoupon(couponInput.trim(), subtotal);
      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        showToast('success', 'Coupon applied!', result.coupon.description);
      } else {
        setCouponError(result.error ?? 'Invalid coupon');
        showToast('error', 'Invalid coupon', result.error);
      }
      setCouponLoading(false);
    }, 600);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    showToast('info', 'Coupon removed');
  };

  const itemPrice = (basePrice: number, customizations: FoodCustomization[]) =>
    basePrice + customizations.reduce((s, c) => s + c.price, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-6">
        <EmptyState
          icon={<ShoppingBag className="w-14 h-14" />}
          title="Your cart is empty"
          description="No delicious choices yet. Browse restaurants and add some food!"
          action={{ label: 'Browse Restaurants', onClick: () => navigate('/restaurants') }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-surface-900 dark:text-white mb-2">Your Cart</h1>
        {restaurantName && (
          <p className="text-surface-500 dark:text-surface-400 mb-8">
            Items from <span className="font-semibold text-surface-700 dark:text-surface-300">{restaurantName}</span>
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card">
              <div className="p-5 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <h2 className="font-bold text-surface-800 dark:text-white">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </h2>
                <button
                  onClick={() => { clearCart(); showToast('info', 'Cart cleared'); }}
                  className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Clear all
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const unitPrice = itemPrice(item.basePrice, item.customizations);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 p-5 border-b border-surface-50 dark:border-surface-800 last:border-0"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-surface-900 dark:text-white text-sm mb-0.5 truncate">
                          {item.name}
                        </h3>
                        {item.customizations.length > 0 && (
                          <p className="text-xs text-surface-400 mb-1">
                            {item.customizations.map((c) => c.name).join(', ')}
                          </p>
                        )}
                        <p className="text-xs text-surface-400 mb-3">{item.restaurantName}</p>

                        <div className="flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-600 hover:border-brand-300 transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold text-surface-900 dark:text-white w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center transition-colors hover:bg-brand-600"
                              aria-label="Increase"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-surface-900 dark:text-white text-sm">
                              {formatCurrency(unitPrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => {
                                removeItem(item.id);
                                showToast('info', 'Item removed', item.name);
                              }}
                              className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Coupon */}
            <div className="bg-white dark:bg-surface-900 rounded-3xl p-5 shadow-card">
              <h3 className="font-bold text-surface-800 dark:text-white mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-500" /> Apply Coupon
              </h3>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">
                      {appliedCoupon.code} applied!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">{appliedCoupon.description}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code (e.g. FOOD20)"
                        className={cn(
                          'w-full h-11 px-4 rounded-xl border text-sm font-medium uppercase tracking-widest',
                          'bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder:normal-case placeholder:tracking-normal',
                          'focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all',
                          couponError
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-surface-200 dark:border-surface-700'
                        )}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      loading={couponLoading}
                      disabled={!couponInput.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['FOOD20', 'WELCOME50', 'FREEDELIVERY'].map((code) => (
                      <button
                        key={code}
                        onClick={() => { setCouponInput(code); setCouponError(''); }}
                        className="px-2.5 py-1 bg-surface-100 dark:bg-surface-800 rounded-lg text-xs font-bold text-surface-600 dark:text-surface-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-surface-900 rounded-3xl p-5 shadow-card sticky top-[100px]">
              <h2 className="text-lg font-black text-surface-900 dark:text-white mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Subtotal</span>
                  <span className="font-semibold text-surface-800 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Delivery Fee</span>
                  <span className={cn('font-semibold', deliveryFee === 0 ? 'text-green-500' : 'text-surface-800 dark:text-white')}>
                    {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Taxes & Charges</span>
                  <span className="font-semibold text-surface-800 dark:text-white">{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Discount ({appliedCoupon?.code})</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">−{formatCurrency(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-surface-100 dark:border-surface-800 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-black text-surface-900 dark:text-white">Total</span>
                  <span className="text-2xl font-black text-surface-900 dark:text-white">{formatCurrency(grandTotal)}</span>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    You save {formatCurrency(discount)} on this order!
                  </p>
                )}
              </div>

              <Button
                fullWidth
                size="lg"
                rightIcon={<ChevronRight className="w-5 h-5" />}
                onClick={() => navigate('/checkout', {
                  state: {
                    subtotal, deliveryFee, tax, discount,
                    grandTotal, couponCode: appliedCoupon?.code
                  }
                })}
              >
                Proceed to Checkout
              </Button>

              <button
                onClick={() => navigate('/restaurants')}
                className="w-full mt-3 text-sm text-surface-500 dark:text-surface-400 hover:text-brand-500 transition-colors text-center"
              >
                + Add more items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
