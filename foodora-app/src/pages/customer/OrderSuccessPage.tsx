import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, ShoppingBag, Navigation } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDateTime } from '../../utils';

const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const order = id ? getOrderById(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-surface-800 dark:text-white mb-4">Order not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="text-center mb-8"
        >
          {/* Animated success icon */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, times: [0, 0.7, 1] }}
              className="w-28 h-28 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-14 h-14 text-green-500" />
            </motion.div>
            {/* Confetti dots */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 8)],
                  y: [0, -(20 + i * 10)],
                }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full ${
                  ['bg-brand-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-pink-400'][i]
                }`}
              />
            ))}
          </div>

          <h1 className="text-3xl font-black text-surface-900 dark:text-white mb-2">Order Confirmed!</h1>
          <p className="text-surface-500 dark:text-surface-400">
            Your order has been placed successfully.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-surface-900 rounded-3xl shadow-card overflow-hidden mb-5"
        >
          {/* Order ID */}
          <div className="bg-gradient-to-r from-brand-500 to-orange-500 p-4 text-center">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">Order ID</p>
            <p className="text-white text-2xl font-black">#{order.id}</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Restaurant */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="text-xs text-surface-400">Restaurant</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">{order.restaurantName}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl p-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-surface-600 dark:text-surface-400">{item.quantity}× {item.name}</span>
                  <span className="font-semibold text-surface-800 dark:text-white">{formatCurrency(item.total)}</span>
                </div>
              ))}
              <div className="border-t border-surface-200 dark:border-surface-700 mt-2 pt-2 flex justify-between font-black text-sm">
                <span className="text-surface-900 dark:text-white">Total</span>
                <span className="text-surface-900 dark:text-white">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Delivery estimate */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-surface-400">Estimated Delivery</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">
                  {order.estimatedDelivery}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-surface-400">Delivering to</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white">
                  {order.deliveryAddress.label}
                </p>
                <p className="text-xs text-surface-400">
                  {order.deliveryAddress.line1}, {order.deliveryAddress.city}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center justify-between py-3 border-t border-surface-100 dark:border-surface-800">
              <div>
                <p className="text-xs text-surface-400">Payment</p>
                <p className="text-sm font-bold text-surface-900 dark:text-white capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pay on Delivery'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            fullWidth
            size="lg"
            leftIcon={<Navigation className="w-5 h-5" />}
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            Track Order
          </Button>
          <Button
            fullWidth
            size="lg"
            variant="secondary"
            onClick={() => navigate('/restaurants')}
          >
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
