import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, CheckCircle, XCircle, Star } from 'lucide-react';
import { restaurants } from '../../data/restaurants';
import type { Restaurant } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { cn } from '../../utils';

const AdminRestaurantsPage: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const getStatus = (r: Restaurant) => statuses[r.id] ?? r.status;

  const filtered = restaurants.filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const handleAction = (id: string, action: 'approve' | 'disable') => {
    setStatuses((prev) => ({ ...prev, [id]: action === 'approve' ? 'active' : 'suspended' }));
    const r = restaurants.find((x) => x.id === id);
    showToast('success', action === 'approve' ? 'Restaurant approved' : 'Restaurant suspended', r?.name);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">Restaurants</h2>
          <p className="text-surface-500 text-sm">{restaurants.length} total restaurants</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search restaurants..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
        />
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Restaurant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase hidden md:table-cell">Cuisine</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase hidden sm:table-cell">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const status = getStatus(r);
                return (
                  <tr key={r.id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                          <ImageWithFallback src={r.logo} alt={r.name} className="w-full h-full" />
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 dark:text-white">{r.name}</p>
                          <p className="text-xs text-surface-400">{r.totalOrders.toLocaleString()} orders</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-500 hidden md:table-cell">{r.cuisine[0]}</td>
                    <td className="px-4 py-3 text-surface-500 hidden lg:table-cell">{r.city}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-surface-800 dark:text-white">{r.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[status] ?? statusColors.inactive}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="xs" leftIcon={<Eye className="w-3.5 h-3.5" />}>View</Button>
                        {status !== 'active' ? (
                          <Button variant="success" size="xs" leftIcon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handleAction(r.id, 'approve')}>
                            Approve
                          </Button>
                        ) : (
                          <Button variant="danger" size="xs" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => handleAction(r.id, 'disable')}>
                            Disable
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantsPage;
