import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Navigation, RotateCcw, Eye, Star } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { foods } from '../../data/foods';
import { restaurants } from '../../data/restaurants';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '../../utils';
import type { Order } from '../../types';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { showToast } = useToast();

  const handleReorder = () => {
    clearCart();
    const rest = restaurants.find((r) => r.id === order.restaurantId);
    order.items.forEach((item) => {
      addItem({
        foodId: item.foodId,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        name: item.name,
        image: item.image,
        basePrice: item.basePrice,
        customizations: item.customizations,
        quantity: item.quantity,
      });
    });
    showToast('success', 'Added to cart', `${order.items.length} items from ${order.restaurantName}`);
    navigate('/cart');
  };

  const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-surface-50 dark:border-surface-800">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
          <ImageWithFallback src={order.restaurantImage} alt={order.restaurantName} className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-surface-900 dark:text-white truncate">{order.restaurantName}</h3>
          <p className="text-xs text-surface-400 mt-0.5">
            #{order.id} · {formatDate(order.placedAt)}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${getOrderStatusColor(order.status)}`}>
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      {/* Items */}
      <div className="px-5 py-3">
        <p className="text-sm text-surface-600 dark:text-surface-400 truncate">
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-surface-400">{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
          <span className="font-bold text-surface-900 dark:text-white">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-5">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          {isActive ? 'Track' : 'Details'}
        </Button>
        {isActive && (
          <Button
            size="sm"
            leftIcon={<Navigation className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            Track Order
          </Button>
        )}
        {(isDelivered || isCancelled) && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReorder}
          >
            Reorder
          </Button>
        )}
        {isDelivered && !order.rating && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Star className="w-3.5 h-3.5" />}
          >
            Review
          </Button>
        )}
      </div>
    </motion.div>
  );
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, getActiveOrders, getCompletedOrders, getCancelledOrders } = useOrders();
  const [activeTab, setActiveTab] = useState('active');

  const tabs = [
    { id: 'active', label: 'Active', count: getActiveOrders().length },
    { id: 'completed', label: 'Completed', count: getCompletedOrders().length },
    { id: 'cancelled', label: 'Cancelled', count: getCancelledOrders().length },
  ];

  const displayOrders =
    activeTab === 'active' ? getActiveOrders() :
    activeTab === 'completed' ? getCompletedOrders() :
    getCancelledOrders();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-surface-900 dark:text-white mb-6">My Orders</h1>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

        <AnimatePresence mode="popLayout">
          {displayOrders.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="w-12 h-12" />}
              title={activeTab === 'active' ? 'No active orders' : activeTab === 'completed' ? 'No completed orders' : 'No cancelled orders'}
              description="Your order history will appear here."
              action={{ label: 'Explore Restaurants', onClick: () => navigate('/restaurants') }}
            />
          ) : (
            <div className="space-y-4">
              {displayOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrdersPage;
