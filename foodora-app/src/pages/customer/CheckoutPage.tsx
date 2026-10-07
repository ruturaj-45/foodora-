import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, CreditCard, Smartphone, Banknote, Check,
  ChevronRight, Plus, Lock, AlertCircle, ArrowLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useToast } from '../../context/ToastContext';
import { createNewOrder } from '../../data/orders';
import type { Address, PaymentMethod, OrderItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { formatCurrency, generateOrderId, cn } from '../../utils';

type PaymentStep = 'details' | 'processing' | 'success' | 'failed';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart, restaurantId, restaurantName } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { showToast } = useToast();

  const state = (location.state ?? {}) as {
    subtotal?: number; deliveryFee?: number; tax?: number;
    discount?: number; grandTotal?: number; couponCode?: string;
  };
  const { subtotal = 0, deliveryFee = 40, tax = 0, discount = 0, grandTotal = 0, couponCode } = state;

  const [selectedAddress, setSelectedAddress] = useState<Address>(
    user?.addresses[0] ?? {
      id: 'addr-default',
      label: 'Home',
      line1: 'Flat 4B, Sunrise Apartments',
      line2: 'Koramangala 5th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
    }
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [step, setStep] = useState<PaymentStep>('details');
  const [placedOrderId, setPlacedOrderId] = useState('');

  const paymentOptions: { value: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      value: 'upi',
      label: 'UPI',
      icon: <Smartphone className="w-5 h-5" />,
      desc: 'Pay with any UPI app',
    },
    {
      value: 'card',
      label: 'Credit / Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      desc: 'Visa, Mastercard, Amex',
    },
    {
      value: 'cod',
      label: 'Cash on Delivery',
      icon: <Banknote className="w-5 h-5" />,
      desc: 'Pay when your order arrives',
    },
  ];

  const handlePlaceOrder = () => {
    setStep('processing');

    setTimeout(() => {
      // 80% chance of success for demo
      const success = Math.random() < 0.8;

      if (success) {
        const orderId = generateOrderId();
        setPlacedOrderId(orderId);

        // Build order items
        const orderItems: OrderItem[] = items.map((i) => ({
          foodId: i.foodId,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          basePrice: i.basePrice,
          customizations: i.customizations,
          total: (i.basePrice + i.customizations.reduce((s, c) => s + c.price, 0)) * i.quantity,
        }));

        const newOrder = createNewOrder({
          id: orderId,
          customerId: user?.id ?? 'user-demo',
          customerName: user?.name ?? 'Guest',
          restaurantId: restaurantId ?? 'rest-2',
          restaurantName: restaurantName ?? 'Restaurant',
          items: orderItems,
          subtotal,
          deliveryFee,
          tax,
          discount,
          total: grandTotal,
          couponCode,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          status: 'pending',
          deliveryAddress: selectedAddress,
        });

        addOrder(newOrder);
        clearCart();
        setStep('success');
        showToast('success', 'Order placed!', `Order #${orderId} confirmed.`);
      } else {
        setStep('failed');
      }
    }, 2500);
  };

  // Processing state
  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full"
            />
          </div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white mb-2">Processing Payment</h2>
          <p className="text-surface-500 dark:text-surface-400">Please wait while we confirm your order...</p>
        </motion.div>
      </div>
    );
  }

  // Success → redirect to order success
  if (step === 'success') {
    navigate(`/order-success/${placedOrderId}`, { replace: true });
    return null;
  }

  // Failed state
  if (step === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white mb-2">Payment Failed</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-8">
            Something went wrong while processing your payment. Please try again.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button fullWidth onClick={() => setStep('details')}>
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>
        <h1 className="text-3xl font-black text-surface-900 dark:text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" /> Delivery Address
              </h2>
              <div className="space-y-3">
                {(user?.addresses ?? [selectedAddress]).map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={cn(
                      'w-full p-4 rounded-2xl border-2 text-left transition-all',
                      selectedAddress.id === addr.id
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-surface-200 dark:border-surface-700 hover:border-brand-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          selectedAddress.id === addr.id
                            ? 'border-brand-500 bg-brand-500'
                            : 'border-surface-300 dark:border-surface-600'
                        )}
                      >
                        {selectedAddress.id === addr.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-surface-900 dark:text-white">
                          {addr.label}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city} — {addr.pincode}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                <button className="w-full p-4 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700 text-surface-500 dark:text-surface-400 hover:border-brand-300 hover:text-brand-500 transition-all flex items-center gap-2 justify-center text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-500" /> Payment Method
              </h2>
              <div className="space-y-3">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                      paymentMethod === opt.value
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-surface-200 dark:border-surface-700 hover:border-brand-200'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        paymentMethod === opt.value
                          ? 'border-brand-500 bg-brand-500'
                          : 'border-surface-300 dark:border-surface-600'
                      )}
                    >
                      {paymentMethod === opt.value && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        paymentMethod === opt.value
                          ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'
                      )}
                    >
                      {opt.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-surface-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-surface-400">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* UPI demo input */}
              <AnimatePresence>
                {paymentMethod === 'upi' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <input
                      placeholder="Enter UPI ID (e.g. demo@upi)"
                      defaultValue="demo@upi"
                      className="w-full h-11 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                    />
                    <p className="text-xs text-surface-400 mt-1.5 ml-1">Demo mode — no real payment processed</p>
                  </motion.div>
                )}
                {paymentMethod === 'card' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 space-y-3"
                  >
                    <input
                      placeholder="Card number (demo)"
                      defaultValue="4242 4242 4242 4242"
                      className="w-full h-11 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        className="h-11 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                      />
                      <input
                        placeholder="CVV"
                        defaultValue="123"
                        type="password"
                        className="h-11 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                      />
                    </div>
                    <p className="text-xs text-surface-400 ml-1">Demo mode — no real payment processed</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-surface-900 rounded-3xl p-5 shadow-card sticky top-[100px]">
              <h2 className="text-lg font-black text-surface-900 dark:text-white mb-4">Order Summary</h2>

              {/* Items preview */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-surface-600 dark:text-surface-400 truncate mr-2">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-semibold text-surface-800 dark:text-white flex-shrink-0">
                      {formatCurrency((item.basePrice + item.customizations.reduce((s, c) => s + c.price, 0)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-surface-100 dark:border-surface-800 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="font-semibold text-surface-800 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Delivery</span>
                  <span className={cn('font-semibold', deliveryFee === 0 ? 'text-green-500' : 'text-surface-800 dark:text-white')}>
                    {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Tax</span>
                  <span className="font-semibold text-surface-800 dark:text-white">{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-semibold text-green-600">−{formatCurrency(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-surface-100 dark:border-surface-800 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-black text-surface-900 dark:text-white">Total</span>
                  <span className="text-2xl font-black text-surface-900 dark:text-white">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handlePlaceOrder}
                rightIcon={<Lock className="w-4 h-4" />}
                disabled={items.length === 0}
              >
                Place Order — {formatCurrency(grandTotal)}
              </Button>

              <p className="text-xs text-surface-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Demo mode · No real payment charged
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
