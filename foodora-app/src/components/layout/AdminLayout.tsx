import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, UtensilsCrossed, Users, ShoppingBag, BarChart3, Settings, Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ToastContainer } from '../ui/Toast';
import { cn } from '../../utils';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/restaurants', icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Restaurants' },
  { to: '/admin/customers', icon: <Users className="w-5 h-5" />, label: 'Customers' },
  { to: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders' },
  { to: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
  { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black text-white">food<span className="text-brand-400">ora</span></span>
            <p className="text-xs text-surface-500 -mt-0.5">Admin Portal</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 border-b border-surface-800 flex items-center gap-3">
        <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-xl object-cover" />
        <div>
          <p className="text-sm font-bold text-white">{user?.name}</p>
          <p className="text-xs text-surface-500">Platform Admin</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                isActive ? 'bg-brand-500 text-white shadow-brand' : 'text-surface-400 hover:bg-surface-800 hover:text-white')
            }
          >
            {item.icon}{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-surface-800">
        <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-400 hover:text-white hover:bg-surface-800 transition-colors mb-1">
          <UtensilsCrossed className="w-5 h-5" />Customer App
        </NavLink>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-400 hover:text-red-400 hover:bg-surface-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-100 dark:bg-surface-950 overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-surface-950 flex-col flex-shrink-0"><SidebarContent /></aside>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-surface-950 flex flex-col lg:hidden"><SidebarContent /></motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 sm:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-600"><Menu className="w-5 h-5" /></button>
          <div className="flex-1"><h1 className="text-base font-bold text-surface-900 dark:text-white hidden sm:block">Foodora Admin Panel</h1></div>
          <button className="relative w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-600"><Bell className="w-4 h-4" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
          <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-xl object-cover" />
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
      <ToastContainer />
    </div>
  );
};
