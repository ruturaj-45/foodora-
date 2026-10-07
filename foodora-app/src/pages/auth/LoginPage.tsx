import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, UtensilsCrossed, Zap, Shield, Store, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { UserRole } from '../../types';

interface PresetRole {
  role: UserRole;
  label: string;
  icon: React.ReactNode;
  email: string;
  pass: string;
  redirect: string;
}

const PRESETS: PresetRole[] = [
  {
    role: 'customer',
    label: 'Customer',
    icon: <UserIcon className="w-4 h-4" />,
    email: 'arjun@example.com',
    pass: 'customer123',
    redirect: '/',
  },
  {
    role: 'restaurant',
    label: 'Restaurant',
    icon: <Store className="w-4 h-4" />,
    email: 'biryanihouse@foodora.com',
    pass: 'rest123',
    redirect: '/restaurant/dashboard',
  },
  {
    role: 'admin',
    label: 'Admin',
    icon: <Shield className="w-4 h-4" />,
    email: 'admin@foodora.com',
    pass: 'admin123',
    redirect: '/admin/dashboard',
  },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithCredentials } = useAuth();
  const { showToast } = useToast();

  const [activePreset, setActivePreset] = useState<UserRole>('customer');
  const [email, setEmail] = useState('arjun@example.com');
  const [password, setPassword] = useState('customer123');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSelectPreset = (p: PresetRole) => {
    setActivePreset(p.role);
    setEmail(p.email);
    setPassword(p.pass);
    setErrors({});
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) {
      e.email = 'Email is required';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 4) {
      e.password = 'Password must be at least 4 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const result = await loginWithCredentials(email, password);
      if (result.success) {
        showToast('success', 'Welcome to Foodora!', 'Signed in successfully.');
        const targetRole = result.role || activePreset;
        if (targetRole === 'restaurant') {
          navigate('/restaurant/dashboard');
        } else if (targetRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        showToast('error', 'Login Notice', result.error || 'Please check credentials');
      }
    } catch {
      // Fallback
      await login(activePreset);
      showToast('success', 'Signed In', 'Welcome to Foodora!');
      navigate(activePreset === 'restaurant' ? '/restaurant/dashboard' : activePreset === 'admin' ? '/admin/dashboard' : '/');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: UserRole) => {
    setLoading(true);
    await login(role);
    showToast('success', `Signed In as ${role.toUpperCase()}`, 'Welcome to Foodora!');
    if (role === 'restaurant') navigate('/restaurant/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-surface-950 dark:to-surface-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-8 border border-surface-100 dark:border-surface-800"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-surface-900 dark:text-white">
              food<span className="text-brand-500">ora</span>
            </span>
          </Link>

          <h1 className="text-2xl font-black text-surface-900 dark:text-white text-center mb-1">
            Welcome back
          </h1>
          <p className="text-surface-400 text-center text-sm mb-6">
            Select a demo role or enter your credentials
          </p>

          {/* Quick Role Switcher */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-100 dark:bg-surface-800 rounded-2xl mb-6">
            {PRESETS.map((p) => {
              const isSelected = activePreset === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-surface-700 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  {p.icon}
                  {p.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-surface-400 hover:text-surface-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
            />
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-400"
                />
                <span className="text-surface-600 dark:text-surface-400">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => showToast('info', 'Demo Tip', `Preset password is: ${password}`)}
                className="text-brand-500 hover:text-brand-600 font-semibold"
              >
                Show credentials
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-surface-900 text-xs text-surface-400">
                1-CLICK INSTANT ACCESS
              </span>
            </div>
          </div>

          {/* Quick 1-click access buttons */}
          <div className="space-y-2">
            <Button
              variant="secondary"
              fullWidth
              size="md"
              leftIcon={<Zap className="w-4 h-4 text-brand-500" />}
              onClick={() => handleDemo('customer')}
            >
              Instant Demo Customer
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDemo('restaurant')}
                className="border border-surface-200 dark:border-surface-700"
              >
                🍽️ Restaurant Owner
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDemo('admin')}
                className="border border-surface-200 dark:border-surface-700"
              >
                👑 Platform Admin
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-surface-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-500 font-semibold hover:text-brand-600">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
