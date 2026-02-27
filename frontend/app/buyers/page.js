'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, ShoppingBag, Scale } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';

function BuyerForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Buyer Name</label>
        <input className="form-input" placeholder="Company or individual name"
          {...register('name', { required: 'Name is required' })} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label className="form-label">Rate per KG (₹)</label>
        <input type="number" step="0.01" min="0" className="form-input" placeholder="0.00"
          {...register('ratePerKg', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
        {errors.ratePerKg && <p className="mt-1 text-xs text-red-500">{errors.ratePerKg.message}</p>}
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Buyer'}
        </button>
      </div>
    </form>
  );
}

export default function BuyersPage() {
  const { isOwner } = useAuth();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editBuyer, setEditBuyer] = useState(null);
  const [deleteBuyer, setDeleteBuyer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/buyers');
      setBuyers(res.data);
    } catch (err) {
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuyers(); }, []);

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editBuyer) {
        await api.put(`/buyers/${editBuyer._id}`, data);
        toast.success('Buyer updated');
      } else {
        await api.post('/buyers', data);
        toast.success('Buyer added');
      }
      setShowModal(false);
      setEditBuyer(null);
      fetchBuyers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/buyers/${deleteBuyer._id}`);
      toast.success('Buyer removed');
      setDeleteBuyer(null);
      fetchBuyers();
    } catch (err) {
      toast.error('Failed to remove buyer');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-tea-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-tea-500" /> Buyer Management
            </h1>
            <p className="text-tea-500 text-sm mt-1">Track buyers and their purchase history</p>
          </div>
          {isOwner && (
            <button className="btn-primary flex items-center gap-2" onClick={() => { setEditBuyer(null); setShowModal(true); }}>
              <Plus className="w-4 h-4" /> Add Buyer
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 text-tea-400">Loading...</div>
        ) : buyers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-tea-100">
            <ShoppingBag className="w-12 h-12 text-tea-200 mx-auto mb-3" />
            <p className="text-tea-400">No buyers added yet</p>
            {isOwner && <button className="btn-primary mt-4" onClick={() => setShowModal(true)}>Add First Buyer</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {buyers.map((buyer) => (
              <div key={buyer._id} className="bg-white rounded-xl p-5 shadow-sm border border-tea-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-tea-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-tea-600" />
                  </div>
                  {isOwner && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditBuyer(buyer); setShowModal(true); }}
                        className="p-1.5 hover:bg-tea-50 rounded-lg text-tea-400 hover:text-tea-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteBuyer(buyer)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-tea-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-tea-900">{buyer.name}</h3>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-tea-500">Rate per KG</span>
                    <span className="font-semibold text-tea-700">₹{buyer.ratePerKg}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-tea-500 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" /> Total Purchased
                    </span>
                    <span className="font-semibold text-tea-700">{buyer.totalQuantityPurchased?.toLocaleString()} KG</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <>
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditBuyer(null); }}
              title={editBuyer ? 'Edit Buyer' : 'Add New Buyer'}>
              <BuyerForm
                onSubmit={handleSubmit}
                loading={formLoading}
                defaultValues={editBuyer ? { name: editBuyer.name, ratePerKg: editBuyer.ratePerKg } : {}}
              />
            </Modal>

            <ConfirmDialog
              isOpen={!!deleteBuyer}
              onClose={() => setDeleteBuyer(null)}
              onConfirm={handleDelete}
              title="Remove Buyer"
              message={`Remove ${deleteBuyer?.name} from buyer list?`}
              loading={deleteLoading}
            />
          </>
        )}
      </div>
    </ProtectedLayout>
  );
}
