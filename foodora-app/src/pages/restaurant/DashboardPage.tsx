import React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, DollarSign, Clock, CheckCircle, TrendingUp, Star, Users
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { restaurantDailyStats, restaurantPopularItems, orderStatusData } from '../../data/analytics';
import { useOrders } from '../../context/OrdersContext';
import { formatCurrency } from '../../utils';

const StatCard: React.FC<{
  title: string; value: string | number; change?: string; positive?: boolean;
  icon: React.ReactNode; color: string;
}> = ({ title, value, change, positive, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card"
  >
    <div className="flex items-start justify-between mb-4">
      <p className="text-sm font-semibold text-surface-500 dark:text-surface-400">{title}</p>
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>{icon}</div>
    </div>
    <p className="text-2xl font-black text-surface-900 dark:text-white mb-1">{value}</p>
    {change && (
      <p className={`text-xs font-semibold ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {positive ? '↑' : '↓'} {change} vs yesterday
      </p>
    )}
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { orders } = useOrders();
  const restaurantOrders = orders.filter((o) => o.restaurantId === 'rest-2');
  const todayOrders = restaurantOrders.length;
  const todayRevenue = restaurantOrders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingOrders = restaurantOrders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length;
  const completedOrders = restaurantOrders.filter((o) => o.status === 'delivered').length;

  const recentOrders = [...restaurantOrders].slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-surface-900 dark:text-white">Dashboard</h2>
        <p className="text-surface-500 dark:text-surface-400 text-sm">Good afternoon, Rahul! Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Orders"
          value={todayOrders || 128}
          change="12%"
          positive
          icon={<ShoppingBag className="w-5 h-5 text-brand-500" />}
          color="bg-brand-100 dark:bg-brand-900/30"
        />
        <StatCard
          title="Today's Revenue"
          value={todayRevenue > 0 ? formatCurrency(todayRevenue) : '₹24,850'}
          change="8%"
          positive
          icon={<DollarSign className="w-5 h-5 text-green-500" />}
          color="bg-green-100 dark:bg-green-900/30"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders || 12}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          title="Completed"
          value={completedOrders || 116}
          change="5%"
          positive
          icon={<CheckCircle className="w-5 h-5 text-blue-500" />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white mb-1">Revenue This Week</h3>
          <p className="text-xs text-surface-400 mb-4">Daily revenue trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={restaurantDailyStats}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white mb-1">Order Status</h3>
          <p className="text-xs text-surface-400 mb-4">Distribution today</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {orderStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {orderStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-surface-600 dark:text-surface-400">{d.name}</span>
                </div>
                <span className="font-semibold text-surface-800 dark:text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular items + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Popular items */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" /> Popular Items
          </h3>
          <div className="space-y-3">
            {restaurantPopularItems.map((item, i) => (
              <div key={item.foodId} className="flex items-center gap-3">
                <span className="text-lg font-black text-surface-300 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 dark:text-white truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex-1 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${(item.orders / restaurantPopularItems[0].orders) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">{item.orders} orders</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-surface-800 dark:text-white">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-500" /> Recent Orders
          </h3>
          {recentOrders.length === 0 ? (
            <div className="space-y-3">
              {[
                { id: 'FD20481', customer: 'Arjun S.', items: 3, total: 739, status: 'delivered' },
                { id: 'FD20480', customer: 'Sneha R.', items: 2, total: 560, status: 'out_for_delivery' },
                { id: 'FD20479', customer: 'Kiran P.', items: 1, total: 280, status: 'preparing' },
              ].map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-surface-800 dark:text-white">#{o.id}</p>
                    <p className="text-xs text-surface-400">{o.customer} · {o.items} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-900 dark:text-white">{formatCurrency(o.total)}</p>
                    <span className={`text-xs font-semibold ${o.status === 'delivered' ? 'text-green-500' : o.status === 'preparing' ? 'text-brand-500' : 'text-blue-500'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-surface-800 dark:text-white">#{o.id}</p>
                    <p className="text-xs text-surface-400">{o.customerName} · {o.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-900 dark:text-white">{formatCurrency(o.total)}</p>
                    <span className="text-xs font-semibold text-brand-500 capitalize">{o.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
