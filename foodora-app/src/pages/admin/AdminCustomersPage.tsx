import React, { useState } from 'react';
import { Search, UserX, UserCheck } from 'lucide-react';
import { mockCustomers } from '../../data/users';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils';

const AdminCustomersPage: React.FC = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const filtered = mockCustomers.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (id: string, defaultStatus: string) => statuses[id] ?? defaultStatus;

  const handleToggle = (id: string, current: string) => {
    const next = current === 'active' ? 'banned' : 'active';
    setStatuses((prev) => ({ ...prev, [id]: next }));
    const user = mockCustomers.find((c) => c.id === id);
    showToast(next === 'active' ? 'success' : 'info', next === 'active' ? 'Customer activated' : 'Customer banned', user?.name);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-surface-900 dark:text-white">Customers</h2>
        <p className="text-surface-500 text-sm">{mockCustomers.length} registered customers</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
        />
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800">
                {['Customer', 'Email', 'Orders', 'Spent', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const status = getStatus(c.id, c.status);
                return (
                  <tr key={c.id} className="border-b border-surface-50 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                        <span className="font-semibold text-surface-900 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-surface-500 truncate max-w-[160px]">{c.email}</td>
                    <td className="px-4 py-3 font-semibold text-surface-800 dark:text-white">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant={status === 'active' ? 'danger' : 'success'}
                        size="xs"
                        leftIcon={status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        onClick={() => handleToggle(c.id, status)}
                      >
                        {status === 'active' ? 'Ban' : 'Unban'}
                      </Button>
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

export default AdminCustomersPage;
