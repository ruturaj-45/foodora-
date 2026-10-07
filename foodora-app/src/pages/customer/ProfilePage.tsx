import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, ShoppingBag, Heart, Settings,
  Bell, Moon, LogOut, Edit3, Check, X, Plus, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useOrders } from '../../context/OrdersContext';
import { useFavorites } from '../../context/FavoritesContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { orders } = useOrders();
  const { favoriteRestaurants, favoriteFoods } = useFavorites();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-brand-500" />
          </div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white mb-2">Sign in to view profile</h2>
          <p className="text-surface-500 mb-6">Access your orders, favourites, and account settings.</p>
          <Button fullWidth size="lg" onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateUser({ name: form.name, email: form.email, phone: form.phone });
    setEditOpen(false);
    showToast('success', 'Profile updated!');
  };

  const userOrders = orders.filter((o) => o.customerId === user?.id || o.customerId === 'user-demo');
  const totalSpent = userOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Orders', value: userOrders.length, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-brand-500 bg-brand-100 dark:bg-brand-900/30' },
    { label: 'Favourites', value: favoriteRestaurants.length + favoriteFoods.length, icon: <Heart className="w-5 h-5" />, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
    { label: 'Total Spent', value: formatCurrency(totalSpent), icon: <ShoppingBag className="w-5 h-5" />, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-900 rounded-3xl p-6 shadow-card"
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-100 dark:ring-brand-900/30"
              />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-md">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-surface-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-surface-400 truncate">{user?.email}</p>
              <p className="text-sm text-surface-400">{user?.phone}</p>
              <span className="inline-flex items-center mt-2 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                ✓ Verified Account
              </span>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<Edit3 className="w-4 h-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-card text-center"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                {stat.icon}
              </div>
              <p className="text-lg font-black text-surface-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-surface-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Saved addresses */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl p-5 shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" /> Saved Addresses
          </h3>
          <div className="space-y-3">
            {user?.addresses.map((addr) => (
              <div key={addr.id} className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-2xl">
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-surface-900 dark:text-white">{addr.label}</p>
                  <p className="text-xs text-surface-400 truncate">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}
                  </p>
                </div>
              </div>
            ))}
            <button className="w-full flex items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700 text-surface-400 hover:border-brand-300 hover:text-brand-500 transition-all text-sm font-semibold">
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl overflow-hidden shadow-card">
          <h3 className="font-bold text-surface-900 dark:text-white px-5 pt-5 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </h3>
          {[
            { icon: <ShoppingBag className="w-4 h-4" />, label: 'My Orders', onClick: () => navigate('/orders'), chevron: true },
            { icon: <Heart className="w-4 h-4" />, label: 'Favourites', onClick: () => navigate('/favorites'), chevron: true },
            {
              icon: <Moon className="w-4 h-4" />,
              label: 'Dark Mode',
              onClick: toggleTheme,
              toggle: true,
              toggled: isDark,
            },
            { icon: <Bell className="w-4 h-4" />, label: 'Notifications', onClick: () => {}, chevron: true },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors border-t border-surface-50 dark:border-surface-800"
            >
              <div className="w-9 h-9 bg-surface-100 dark:bg-surface-700 rounded-xl flex items-center justify-center text-surface-600 dark:text-surface-400">
                {item.icon}
              </div>
              <span className="flex-1 text-sm font-semibold text-surface-800 dark:text-white text-left">{item.label}</span>
              {item.toggle ? (
                <div className={`w-12 h-6 rounded-full transition-colors relative ${item.toggled ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.toggled ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              ) : item.chevron ? (
                <ChevronRight className="w-4 h-4 text-surface-400" />
              ) : null}
            </button>
          ))}
          <button
            onClick={() => { logout(); navigate('/login'); showToast('info', 'Signed out'); }}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-surface-50 dark:border-surface-800"
          >
            <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-500">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="flex-1 text-sm font-semibold text-red-500 text-left">Log Out</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="sm">
        <div className="p-6 space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} leftIcon={<User className="w-4 h-4" />} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} leftIcon={<Mail className="w-4 h-4" />} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} leftIcon={<Phone className="w-4 h-4" />} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setEditOpen(false)} leftIcon={<X className="w-4 h-4" />}>Cancel</Button>
            <Button fullWidth onClick={handleSave} leftIcon={<Check className="w-4 h-4" />}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
