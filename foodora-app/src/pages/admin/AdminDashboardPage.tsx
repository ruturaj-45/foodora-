import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UtensilsCrossed, ShoppingBag, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { platformStats, platformDailyStats } from '../../data/analytics';
import { restaurants } from '../../data/restaurants';
import { formatCurrency } from '../../utils';

import { useOrders } from '../../context/OrdersContext';
import { Link } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  const { orders } = useOrders();
  const totalLiveOrders = orders.length;

  const stats = [
    { label: 'Total Customers', value: platformStats.totalCustomers.toLocaleString(), icon: <Users className="w-5 h-5 text-blue-500" />, color: 'bg-blue-100 dark:bg-blue-900/30', change: '+12%' },
    { label: 'Total Restaurants', value: platformStats.totalRestaurants.toLocaleString(), icon: <UtensilsCrossed className="w-5 h-5 text-brand-500" />, color: 'bg-brand-100 dark:bg-brand-900/30', change: '+5%' },
    { label: 'Total Orders Placed', value: `${totalLiveOrders} live orders`, icon: <ShoppingBag className="w-5 h-5 text-purple-500" />, color: 'bg-purple-100 dark:bg-purple-900/30', change: 'Click to view all', link: '/admin/orders' },
    { label: 'Total Revenue', value: `₹${(platformStats.totalRevenue / 10000000).toFixed(1)}Cr`, icon: <DollarSign className="w-5 h-5 text-green-500" />, color: 'bg-green-100 dark:bg-green-900/30', change: '+22%' },
    { label: 'Active Orders', value: orders.filter(o => ['pending','confirmed','preparing','ready','out_for_delivery'].includes(o.status)).length.toString(), icon: <Activity className="w-5 h-5 text-amber-500" />, color: 'bg-amber-100 dark:bg-amber-900/30', link: '/admin/orders' },
    { label: 'Today Revenue', value: formatCurrency(platformStats.todayRevenue), icon: <TrendingUp className="w-5 h-5 text-indigo-500" />, color: 'bg-indigo-100 dark:bg-indigo-900/30', change: '+8%' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">Platform Overview</h2>
          <p className="text-surface-500 text-sm">Welcome, Priya. Here's the live platform summary.</p>
        </div>
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-brand transition-colors w-fit"
        >
          <ShoppingBag className="w-4 h-4" />
          Check Placed Orders ({totalLiveOrders})
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-semibold text-surface-500">{s.label}</p>
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-black text-surface-900 dark:text-white">{s.value}</p>
            {s.change && <p className="text-xs text-green-500 font-semibold mt-1">↑ {s.change} this month</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4">Platform Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={platformDailyStats}>
              <defs>
                <linearGradient id="pRevG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#pRevG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4">Daily Orders</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformDailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top restaurants */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card">
        <h3 className="font-bold text-surface-900 dark:text-white mb-4">Top Performing Restaurants</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-surface-400 uppercase">Restaurant</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-surface-400 uppercase">Cuisine</th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-surface-400 uppercase">Orders</th>
                <th className="text-right py-2 text-xs font-semibold text-surface-400 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.slice(0, 5).map((r) => (
                <tr key={r.id} className="border-b border-surface-50 dark:border-surface-800 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={r.logo} alt={r.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-surface-800 dark:text-white truncate max-w-[120px]">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-surface-500 truncate max-w-[100px]">{r.cuisine[0]}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-surface-800 dark:text-white">{r.totalOrders.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-green-600">{formatCurrency(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
