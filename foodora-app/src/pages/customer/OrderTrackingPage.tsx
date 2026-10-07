import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Package, CheckCircle, ChefHat, Bike,
  Home, Clock, MapPin, User, Phone, Star
} from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { Button } from '../../components/ui/Button';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { formatCurrency, formatDateTime, getOrderStatusLabel, cn } from '../../utils';
import type { OrderStatus } from '../../types';

const statusSteps: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
];

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; description: string }> = {
  pending: { label: 'Order Placed', icon: <Package className="w-5 h-5" />, description: 'We received your order.' },
  confirmed: { label: 'Restaurant Confirmed', icon: <CheckCircle className="w-5 h-5" />, description: 'Restaurant has accepted your order.' },
  preparing: { label: 'Preparing', icon: <ChefHat className="w-5 h-5" />, description: 'Your food is being prepared.' },
  ready: { label: 'Ready for Pickup', icon: <CheckCircle className="w-5 h-5" />, description: 'Order ready, rider on the way.' },
  out_for_delivery: { label: 'Out for Delivery', icon: <Bike className="w-5 h-5" />, description: 'Your rider has picked up the order.' },
  delivered: { label: 'Delivered', icon: <Home className="w-5 h-5" />, description: 'Order delivered. Enjoy your meal!' },
  cancelled: { label: 'Cancelled', icon: <Package className="w-5 h-5" />, description: 'This order was cancelled.' },
};

const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const order = id ? getOrderById(id) : undefined;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Order not found</p>
          <Button onClick={() => navigate('/orders')}>View All Orders</Button>
        </div>
      </div>
    );
  }

  const currentStepIndex = order.status === 'cancelled'
    ? -1
    : statusSteps.indexOf(order.status as OrderStatus);

  const isActiveStep = (status: OrderStatus) =>
    statusSteps.indexOf(status) <= currentStepIndex;

  const isCurrentStep = (status: OrderStatus) =>
    statusSteps.indexOf(status) === currentStepIndex;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white dark:bg-surface-800 flex items-center justify-center text-surface-600 dark:text-surface-400 shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-surface-900 dark:text-white">Track Order</h1>
            <p className="text-sm text-surface-400">Order #{order.id}</p>
          </div>
        </div>

        {/* Live status card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-card mb-5"
        >
          {/* Restaurant info */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-100 dark:border-surface-800">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={order.restaurantImage}
                alt={order.restaurantName}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-surface-900 dark:text-white">{order.restaurantName}</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-surface-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{order.estimatedDelivery}</span>
                </div>
                {order.deliveryPartner && (
                  <div className="flex items-center gap-1 text-xs text-surface-400">
                    <User className="w-3.5 h-3.5" />
                    <span>{order.deliveryPartner}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold',
              order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
            )}>
              {getOrderStatusLabel(order.status)}
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' ? (
            <div className="space-y-0">
              {statusSteps.map((status, i) => {
                const config = statusConfig[status];
                const isActive = isActiveStep(status);
                const isCurrent = isCurrentStep(status);
                const isLast = i === statusSteps.length - 1;

                return (
                  <div key={status} className="flex gap-4">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor: isActive ? '#f97316' : 'transparent',
                          borderColor: isActive ? '#f97316' : '#e5e7eb',
                        }}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all',
                          isActive ? 'text-white' : 'text-surface-300 dark:text-surface-600',
                          isCurrent && 'ring-4 ring-brand-100 dark:ring-brand-900/30'
                        )}
                      >
                        {isActive ? (
                          i < currentStepIndex ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            config.icon
                          )
                        ) : (
                          config.icon
                        )}
                      </motion.div>
                      {!isLast && (
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: isActiveStep(statusSteps[i + 1]) ? 1 : 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          style={{ transformOrigin: 'top' }}
                          className="w-0.5 flex-1 bg-brand-500 my-1 min-h-[24px]"
                        />
                      )}
                      {!isLast && !isActiveStep(statusSteps[i + 1]) && (
                        <div className="w-0.5 flex-1 bg-surface-200 dark:bg-surface-700 my-1 min-h-[24px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn('pb-5 flex-1 pt-1.5', isLast && 'pb-0')}>
                      <p className={cn(
                        'text-sm font-bold',
                        isActive ? 'text-surface-900 dark:text-white' : 'text-surface-400 dark:text-surface-600'
                      )}>
                        {config.label}
                      </p>
                      <p className={cn(
                        'text-xs mt-0.5',
                        isActive ? 'text-surface-500 dark:text-surface-400' : 'text-surface-300 dark:text-surface-700'
                      )}>
                        {config.description}
                      </p>
                      {order.timeline.find((t) => t.status === status) && (
                        <p className="text-xs text-brand-400 mt-0.5 font-medium">
                          {formatDateTime(order.timeline.find((t) => t.status === status)!.timestamp)}
                        </p>
                      )}
                      {isCurrent && order.status !== 'delivered' && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                          <span className="text-xs text-brand-500 font-semibold">In progress</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-red-500 font-semibold">This order was cancelled</p>
              {order.timeline.find((t) => t.status === 'cancelled') && (
                <p className="text-xs text-surface-400 mt-1">
                  {formatDateTime(order.timeline.find((t) => t.status === 'cancelled')!.timestamp)}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Order details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-card mb-5"
        >
          <h3 className="font-bold text-surface-900 dark:text-white mb-4">Order Details</h3>
          <div className="space-y-3 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 dark:text-white truncate">
                    {item.quantity}× {item.name}
                  </p>
                  {item.customizations.length > 0 && (
                    <p className="text-xs text-surface-400">
                      {item.customizations.map((c) => c.name).join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-surface-800 dark:text-white">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-100 dark:border-surface-800 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Subtotal</span>
              <span className="text-surface-800 dark:text-white">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Discount</span>
                <span className="text-green-500">−{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Delivery + Tax</span>
              <span className="text-surface-800 dark:text-white">{formatCurrency(order.deliveryFee + order.tax)}</span>
            </div>
            <div className="flex justify-between font-black text-base pt-2 border-t border-surface-100 dark:border-surface-800">
              <span className="text-surface-900 dark:text-white">Total</span>
              <span className="text-surface-900 dark:text-white">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* Delivery address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-card mb-6"
        >
          <h3 className="font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" /> Delivery Address
          </h3>
          <p className="text-sm text-surface-700 dark:text-surface-300 font-semibold">
            {order.deliveryAddress.label}
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {order.deliveryAddress.line1}
            {order.deliveryAddress.line2 && `, ${order.deliveryAddress.line2}`},{' '}
            {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
          </p>
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          {order.status === 'delivered' && !order.rating && (
            <Button fullWidth size="lg" leftIcon={<Star className="w-5 h-5" />}>
              Rate This Order
            </Button>
          )}
          <Button
            fullWidth
            variant="secondary"
            size="lg"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
