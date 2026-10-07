import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Star } from 'lucide-react';
import { restaurantDailyStats, restaurantPopularItems } from '../../data/analytics';
import { formatCurrency } from '../../utils';

const AnalyticsPage: React.FC = () => {
  const totalRevenue = restaurantDailyStats.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = restaurantDailyStats.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-black text-surface-900 dark:text-white">Analytics</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign className="w-5 h-5 text-green-500" />, color: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Weekly Orders', value: totalOrders, icon: <ShoppingBag className="w-5 h-5 text-brand-500" />, color: 'bg-brand-100 dark:bg-brand-900/30' },
          { label: 'Avg Order Value', value: formatCurrency(avgOrder), icon: <TrendingUp className="w-5 h-5 text-blue-500" />, color: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Customer Rating', value: '4.8 ⭐', icon: <Star className="w-5 h-5 text-amber-500" />, color: 'bg-amber-100 dark:bg-amber-900/30' },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-semibold text-surface-500">{k.label}</p>
              <div className={`w-9 h-9 ${k.color} rounded-xl flex items-center justify-center`}>{k.icon}</div>
            </div>
            <p className="text-2xl font-black text-surface-900 dark:text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
        <h3 className="font-bold text-surface-900 dark:text-white mb-4">Weekly Revenue</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={restaurantDailyStats}>
            <defs>
              <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#revG)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders bar chart */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
        <h3 className="font-bold text-surface-900 dark:text-white mb-4">Daily Orders</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={restaurantDailyStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular items */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
        <h3 className="font-bold text-surface-900 dark:text-white mb-4">Popular Items</h3>
        <div className="space-y-4">
          {restaurantPopularItems.map((item, i) => (
            <div key={item.foodId} className="flex items-center gap-4">
              <span className="text-2xl font-black text-surface-200 w-8">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-surface-800 dark:text-white">{item.name}</span>
                  <span className="text-sm font-bold text-surface-600 dark:text-surface-400">{item.orders} orders</span>
                </div>
                <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                    style={{ width: `${(item.orders / restaurantPopularItems[0].orders) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400 w-24 text-right">
                {formatCurrency(item.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
