import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { restaurantOffers as initialOffers } from '../../data/offers';
import type { Offer } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { formatDate, cn } from '../../utils';

const OffersPage: React.FC = () => {
  const { showToast } = useToast();
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [isOpen, setIsOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [deleteOffer, setDeleteOffer] = useState<Offer | null>(null);
  const [form, setForm] = useState<Partial<Offer>>({});

  const openAdd = () => {
    setForm({ title: '', type: 'percentage', value: 20, minOrder: 200, startDate: '', endDate: '', isActive: true });
    setEditOffer(null);
    setIsOpen(true);
  };
  const openEdit = (o: Offer) => { setForm({ ...o }); setEditOffer(o); setIsOpen(true); };

  const handleSave = () => {
    if (!form.title) { showToast('error', 'Offer name required'); return; }
    if (editOffer) {
      setOffers((prev) => prev.map((o) => o.id === editOffer.id ? { ...o, ...form } as Offer : o));
      showToast('success', 'Offer updated');
    } else {
      setOffers((prev) => [{ ...form as Offer, id: `offer-${Date.now()}`, restaurantId: 'rest-2' }, ...prev]);
      showToast('success', 'Offer created');
    }
    setIsOpen(false);
  };

  const toggleActive = (id: string) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, isActive: !o.isActive } : o));
    const offer = offers.find((o) => o.id === id);
    showToast('info', offer?.isActive ? 'Offer deactivated' : 'Offer activated');
  };

  const handleDelete = () => {
    if (!deleteOffer) return;
    setOffers((prev) => prev.filter((o) => o.id !== deleteOffer.id));
    showToast('info', 'Offer deleted');
    setDeleteOffer(null);
  };

  const typeLabel: Record<Offer['type'], string> = {
    percentage: '% OFF', flat: '₹ OFF', bogo: 'BOGO', free_delivery: 'Free Delivery',
  };
  const typeBadge: Record<Offer['type'], 'brand' | 'success' | 'info' | 'warning'> = {
    percentage: 'brand', flat: 'info', bogo: 'warning', free_delivery: 'success',
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-surface-900 dark:text-white">Offers & Promotions</h2>
          <p className="text-surface-500 text-sm">{offers.length} offers · {offers.filter((o) => o.isActive).length} active</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Create Offer</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <motion.div
            key={offer.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'bg-white dark:bg-surface-900 rounded-2xl p-5 shadow-card border-2 transition-all',
              offer.isActive ? 'border-brand-200 dark:border-brand-800' : 'border-surface-200 dark:border-surface-800 opacity-70'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${offer.isActive ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-surface-100 dark:bg-surface-800'}`}>
                  <Tag className={`w-5 h-5 ${offer.isActive ? 'text-brand-500' : 'text-surface-400'}`} />
                </div>
                <Badge variant={typeBadge[offer.type]}>{typeLabel[offer.type]}</Badge>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(offer)} className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteOffer(offer)} className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-surface-900 dark:text-white mb-1">{offer.title}</h3>
            <p className="text-xs text-surface-400 mb-3">{offer.description}</p>
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-surface-400">Discount</span>
                <span className="font-semibold text-surface-700 dark:text-surface-300">
                  {offer.type === 'percentage' ? `${offer.value}%` : offer.type === 'flat' ? `₹${offer.value}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-surface-400">Min Order</span>
                <span className="font-semibold text-surface-700 dark:text-surface-300">₹{offer.minOrder}</span>
              </div>
              {offer.couponCode && (
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">Code</span>
                  <code className="font-bold text-brand-500 bg-brand-50 dark:bg-brand-900/20 px-1.5 rounded">{offer.couponCode}</code>
                </div>
              )}
            </div>
            <button
              onClick={() => toggleActive(offer.id)}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all',
                offer.isActive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-red-50 hover:text-red-500' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-brand-50 hover:text-brand-600'
              )}
            >
              {offer.isActive ? <><ToggleRight className="w-4 h-4" /> Active</> : <><ToggleLeft className="w-4 h-4" /> Inactive</>}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editOffer ? 'Edit Offer' : 'Create Offer'} size="sm">
        <div className="p-6 space-y-4">
          <Input label="Offer Name" value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Select
            label="Offer Type"
            value={form.type ?? 'percentage'}
            options={[
              { value: 'percentage', label: 'Percentage OFF' },
              { value: 'flat', label: 'Flat Amount OFF' },
              { value: 'bogo', label: 'Buy 1 Get 1' },
              { value: 'free_delivery', label: 'Free Delivery' },
            ]}
            onChange={(e) => setForm({ ...form, type: e.target.value as Offer['type'] })}
          />
          {(form.type === 'percentage' || form.type === 'flat') && (
            <Input
              label={form.type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
              type="number"
              value={form.value ?? ''}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            />
          )}
          <Input label="Minimum Order (₹)" type="number" value={form.minOrder ?? ''} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          <Input label="Coupon Code (optional)" value={form.couponCode ?? ''} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate ?? ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={form.endDate ?? ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleSave}>{editOffer ? 'Save' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteOffer}
        onClose={() => setDeleteOffer(null)}
        onConfirm={handleDelete}
        title="Delete Offer"
        message={`Delete "${deleteOffer?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default OffersPage;
