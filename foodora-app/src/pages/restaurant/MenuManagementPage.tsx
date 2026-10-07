import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { foods as initialFoods } from '../../data/foods';
import type { Food } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { VegIndicator, Badge } from '../../components/ui/Badge';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { formatCurrency, cn } from '../../utils';

const CATEGORIES = ['Recommended', 'Starters', 'Biryani', 'Kebabs', 'Curries', 'Raita & Sides', 'Desserts', 'Beverages'];

const MenuManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [menuItems, setMenuItems] = useState<Food[]>(initialFoods.filter((f) => f.restaurantId === 'rest-2'));
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Food | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Food | null>(null);
  const [form, setForm] = useState<Partial<Food>>({});

  const filtered = menuItems.filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ name: '', description: '', price: 0, category: 'Biryani', vegType: 'non-veg', isAvailable: true, isBestseller: false, customizations: [], rating: 4.5, ratingCount: 0, restaurantId: 'rest-2', image: '' });
    setIsAdding(true);
    setEditItem(null);
  };

  const openEdit = (food: Food) => {
    setForm({ ...food });
    setEditItem(food);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!form.name || !form.price) { showToast('error', 'Required fields missing'); return; }
    if (isAdding) {
      const newFood: Food = {
        ...form as Food,
        id: `food-${Date.now()}`,
        ingredients: [],
        tags: [],
      };
      setMenuItems((prev) => [newFood, ...prev]);
      showToast('success', 'Item added', form.name);
    } else if (editItem) {
      setMenuItems((prev) => prev.map((f) => f.id === editItem.id ? { ...f, ...form } as Food : f));
      showToast('success', 'Item updated', form.name);
    }
    setIsAdding(false);
    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setMenuItems((prev) => prev.filter((f) => f.id !== deleteItem.id));
    showToast('info', 'Item deleted', deleteItem.name);
    setDeleteItem(null);
  };

  const toggleAvailability = (id: string) => {
    setMenuItems((prev) => prev.map((f) => f.id === id ? { ...f, isAvailable: !f.isAvailable } : f));
    const item = menuItems.find((f) => f.id === id);
    showToast('info', item?.isAvailable ? 'Item marked unavailable' : 'Item marked available');
  };

  const isOpen = isAdding || !!editItem;
  const modalTitle = isAdding ? 'Add Menu Item' : 'Edit Menu Item';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">Menu Management</h2>
          <p className="text-surface-500 text-sm">{menuItems.length} items · {menuItems.filter((f) => f.isAvailable).length} available</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Item</Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
        />
      </div>

      {/* Table / Cards */}
      <div className="space-y-2">
        {filtered.map((food) => (
          <motion.div
            key={food.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'flex items-center gap-4 p-4 bg-white dark:bg-surface-900 rounded-2xl shadow-card transition-opacity',
              !food.isAvailable && 'opacity-60'
            )}
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <ImageWithFallback src={food.image} alt={food.name} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <VegIndicator type={food.vegType} size="sm" />
                <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate">{food.name}</h4>
                {food.isBestseller && <Badge variant="warning" size="sm">Bestseller</Badge>}
              </div>
              <p className="text-xs text-surface-400 truncate">{food.category} · {food.description.slice(0, 60)}...</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-surface-900 dark:text-white text-sm">{formatCurrency(food.price)}</p>
              <span className={`text-xs font-semibold ${food.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                {food.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleAvailability(food.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                title={food.isAvailable ? 'Mark unavailable' : 'Mark available'}
              >
                {food.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => openEdit(food)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteItem(food)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={() => { setIsAdding(false); setEditItem(null); }} title={modalTitle} size="md">
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Food Name" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" type="number" value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            <Select
              label="Category"
              value={form.category ?? 'Biryani'}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <Select
            label="Type"
            value={form.vegType ?? 'non-veg'}
            options={[{ value: 'veg', label: 'Vegetarian' }, { value: 'non-veg', label: 'Non-Vegetarian' }, { value: 'vegan', label: 'Vegan' }]}
            onChange={(e) => setForm({ ...form, vegType: e.target.value as Food['vegType'] })}
          />
          <Input label="Image URL" value={form.image ?? ''} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable ?? true} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm text-surface-700 dark:text-surface-300 font-medium">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isBestseller ?? false} onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm text-surface-700 dark:text-surface-300 font-medium">Bestseller</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => { setIsAdding(false); setEditItem(null); }}>Cancel</Button>
            <Button fullWidth onClick={handleSave}>{isAdding ? 'Add Item' : 'Save Changes'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default MenuManagementPage;
