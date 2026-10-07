import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, ChefHat, Bike, Package, RefreshCw } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor } from '../../utils';
import type { Order, OrderStatus } from '../../types';
import { mockOrders, createNewOrder } from '../../data/orders';
import { IMAGES } from '../../data/images';

const STATUS_ACTIONS: Record<OrderStatus, { next?: OrderStatus; label?: string; icon?: React.ReactNode; variant?: 'primary' | 'success' | 'danger' | 'secondary' }[]> = {
  pending: [
    { next: 'confirmed', label: 'Accept', icon: <Check className="w-4 h-4" />, variant: 'success' },
    { next: 'cancelled', label: 'Reject', icon: <X className="w-4 h-4" />, variant: 'danger' },
  ],
  confirmed: [
    { next: 'preparing', label: 'Start Preparing', icon: <ChefHat className="w-4 h-4" />, variant: 'primary' },
  ],
  preparing: [
    { next: 'ready', label: 'Mark Ready', icon: <Check className="w-4 h-4" />, variant: 'success' },
  ],
  ready: [
    { next: 'out_for_delivery', label: 'Out for Delivery', icon: <Bike className="w-4 h-4" />, variant: 'primary' },
  ],
  out_for_delivery: [
    { next: 'delivered', label: 'Mark Delivered', icon: <Check className="w-4 h-4" />, variant: 'success' },
  ],
  delivered: [],
  cancelled: [],
};

const OrderRow: React.FC<{ order: Order }> = ({ order }) => {
  const { updateOrderStatus } = useOrders();
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const actions = STATUS_ACTIONS[order.status] ?? [];

  const handleAction = (next: OrderStatus) => {
    updateOrderStatus(order.id, next);
    showToast('success', `Order #${order.id} updated`, `Status: ${getOrderStatusLabel(next)}`);
  };

  return (
    <motion.div layout className="bg-white dark:bg-surface-900 rounded-2xl overflow-hidden shadow-card">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Order info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-surface-900 dark:text-white text-sm">#{order.id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
            {order.customerName} · {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
          </p>
          <p className="text-xs text-surface-400 mt-0.5">{formatDateTime(order.placedAt)}</p>
        </div>

        {/* Amount + payment */}
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-surface-900 dark:text-white text-sm">{formatCurrency(order.total)}</p>
          <p className={`text-xs font-semibold ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
            {order.paymentStatus === 'paid' ? '✓ Paid' : 'COD'}
          </p>
          <p className="text-xs text-surface-400 capitalize">{order.paymentMethod}</p>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-surface-100 dark:border-surface-800 pt-3 space-y-3">
              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-surface-800 dark:text-white">
                        {item.quantity}× {item.name}
                      </p>
                      {item.customizations.length > 0 && (
                        <p className="text-xs text-surface-400">{item.customizations.map((c) => c.name).join(', ')}</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-surface-800 dark:text-white">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Address */}
              <p className="text-xs text-surface-400">
                📍 {order.deliveryAddress.line1}, {order.deliveryAddress.city}
              </p>

              {/* Actions */}
              {actions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {actions.map((action) => (
                    action.next && (
                      <Button
                        key={action.next}
                        variant={action.variant ?? 'secondary'}
                        size="sm"
                        leftIcon={action.icon}
                        onClick={() => handleAction(action.next!)}
                      >
                        {action.label}
                      </Button>
                    )
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RestaurantOrdersPage: React.FC = () => {
  const { orders, addOrder } = useOrders();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const allOrders = orders.filter((o) => o.restaurantId === 'rest-2');

  const filtered = allOrders.filter((o) => {
    if (filter === 'active') return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status);
    if (filter === 'done') return ['delivered', 'cancelled'].includes(o.status);
    return true;
  });

  const handleNewDemo = () => {
    const newOrder = createNewOrder({
      id: `FD${Math.floor(Math.random() * 90000) + 10000}`,
      customerName: ['Sneha R.', 'Kiran P.', 'Rohan M.', 'Ayesha K.'][Math.floor(Math.random() * 4)],
      items: [
        { foodId: 'food-201', name: 'Chicken Biryani', image: IMAGES.foods.chickenBiryani, quantity: 1, basePrice: 280, customizations: [], total: 280 },
      ],
      subtotal: 280,
      deliveryFee: 0,
      tax: 17,
      discount: 0,
      total: 297,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'pending',
    });
    addOrder(newOrder);
    showToast('info', 'New order received!', `#${newOrder.id} is waiting for acceptance.`);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">Orders</h2>
          <p className="text-surface-500 text-sm">{filtered.length} orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={handleNewDemo}>
            Simulate New Order
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${
              filter === f
                ? 'bg-brand-500 text-white'
                : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700'
            }`}
          >
            {f === 'all' ? 'All Orders' : f === 'active' ? 'Active' : 'Completed'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="font-semibold text-surface-500">No orders yet</p>
            <Button className="mt-4" size="sm" onClick={handleNewDemo}>Simulate an Order</Button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((order) => <OrderRow key={order.id} order={order} />)}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrdersPage;
