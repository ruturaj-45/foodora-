import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  MapPin,
  Phone,
  CreditCard,
  TrendingUp,
  Receipt,
  User,
  UtensilsCrossed,
  X
} from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils';
import type { Order, OrderStatus } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Compute live KPIs
  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
  );
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.restaurantName.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'active') {
        return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status);
      }
      if (statusFilter === 'delivered') return o.status === 'delivered';
      if (statusFilter === 'cancelled') return o.status === 'cancelled';
      return true;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'out_for_delivery':
        return <Badge variant="info">Out for Delivery</Badge>;
      case 'preparing':
      case 'ready':
        return <Badge variant="warning">Preparing</Badge>;
      case 'confirmed':
      case 'pending':
        return <Badge variant="brand">Pending / Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-brand-500" />
            Orders Management
          </h1>
          <p className="text-surface-500 text-sm">
            Live tracker of all customer orders placed across the Foodora network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Sync Active
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card border border-surface-100 dark:border-surface-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">
              Total Orders Placed
            </span>
            <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-surface-900 dark:text-white">
            {totalOrdersCount}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
            Across all restaurants
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card border border-surface-100 dark:border-surface-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">
              Active Orders
            </span>
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-surface-900 dark:text-white">
            {activeOrders.length}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
            In kitchen or delivery
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card border border-surface-100 dark:border-surface-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">
              Delivered
            </span>
            <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-surface-900 dark:text-white">
            {deliveredOrders.length}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
            Successfully completed
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card border border-surface-100 dark:border-surface-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">
              Orders Volume
            </span>
            <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-surface-900 dark:text-white">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-1">
            Total sales generated
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-card border border-surface-100 dark:border-surface-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer, Restaurant..."
            className="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900 dark:text-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-brand-500 text-white shadow-brand'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900'
            }`}
          >
            All ({totalOrdersCount})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900'
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'delivered'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900'
            }`}
          >
            Delivered ({deliveredOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900'
            }`}
          >
            Cancelled ({cancelledOrders.length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-card border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800/60 border-b border-surface-100 dark:border-surface-800">
              <tr>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Order ID</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Customer</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Restaurant</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Items</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Amount</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Payment</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Status</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase">Placed At</th>
                <th className="py-3 px-4 font-bold text-xs text-surface-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-surface-400">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-base text-surface-600 dark:text-surface-300">
                      No orders found
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      {search ? 'Try adjusting your search criteria.' : 'Placed orders will appear here in real time.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  const firstItemName = order.items[0]?.name || 'Item';
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-50/60 dark:hover:bg-surface-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 text-xs">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-surface-800 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-surface-400 truncate max-w-[140px]">
                          {order.deliveryAddress?.city || 'Bangalore'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-surface-700 dark:text-surface-300">
                        {order.restaurantName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-surface-800 dark:text-surface-200 text-xs font-medium">
                          {firstItemName}
                          {order.items.length > 1 && (
                            <span className="text-surface-400 ml-1">
                              +{order.items.length - 1} more
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-surface-400">{itemCount} items total</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-surface-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs uppercase font-semibold text-surface-600 dark:text-surface-300 block">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3.5 px-4 text-xs text-surface-500 whitespace-nowrap">
                        {formatDate(order.placedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-surface-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-surface-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-surface-100 dark:border-surface-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-surface-100 dark:border-surface-800">
                <div>
                  <h3 className="text-lg font-black text-surface-900 dark:text-white">
                    Order #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-surface-400">
                    Placed on {formatDate(selectedOrder.placedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 hover:text-surface-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status and Restaurant */}
              <div className="py-4 space-y-3">
                <div className="flex justify-between items-center bg-surface-50 dark:bg-surface-800/50 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-xs text-surface-400 block">Restaurant</span>
                    <span className="font-bold text-surface-900 dark:text-white">
                      {selectedOrder.restaurantName}
                    </span>
                  </div>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="bg-surface-50 dark:bg-surface-800/50 p-3.5 rounded-2xl space-y-1">
                  <div className="text-xs text-surface-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-500" /> Customer Details
                  </div>
                  <p className="text-sm font-bold text-surface-800 dark:text-white">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-xs text-surface-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedOrder.deliveryAddress?.line1}, {selectedOrder.deliveryAddress?.city}
                  </p>
                </div>
              </div>

              {/* Item Breakdown */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider">
                  Ordered Items ({selectedOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm py-1.5 border-b border-surface-50 dark:border-surface-800 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="font-semibold text-surface-800 dark:text-white">
                            {item.name}
                          </p>
                          {item.customizations && item.customizations.length > 0 && (
                            <p className="text-[11px] text-surface-400">
                              {item.customizations.map((c) => c.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-surface-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="border-t border-surface-100 dark:border-surface-800 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-surface-500 text-xs">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Discount ({selectedOrder.couponCode || 'PROMO'})</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-surface-500 text-xs">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-surface-900 dark:text-white pt-2 border-t border-surface-100 dark:border-surface-800">
                  <span>Total Paid</span>
                  <span className="text-brand-500">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Update Quick Action */}
              <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800">
                <p className="text-xs font-semibold text-surface-500 mb-2">Change Order Status:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'preparing' ? 'primary' : 'ghost'}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'preparing');
                      setSelectedOrder({ ...selectedOrder, status: 'preparing' });
                    }}
                    className="text-xs"
                  >
                    Preparing
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'out_for_delivery' ? 'primary' : 'ghost'}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'out_for_delivery');
                      setSelectedOrder({ ...selectedOrder, status: 'out_for_delivery' });
                    }}
                    className="text-xs"
                  >
                    Out for Delivery
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedOrder.status === 'delivered' ? 'primary' : 'ghost'}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'delivered');
                      setSelectedOrder({ ...selectedOrder, status: 'delivered' });
                    }}
                    className="text-xs"
                  >
                    Delivered
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;
