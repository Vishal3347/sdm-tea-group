'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { Plus, Edit2, Trash2, Sprout, IndianRupee } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function ProductionForm({ onSubmit, defaultValues, loading, buyers }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues });
  const totalKg = parseFloat(watch('totalKg') || 0);
  const ratePerKg = parseFloat(watch('ratePerKg') || 0);
  const totalRevenue = (totalKg * ratePerKg).toFixed(2);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" {...register('date', { required: 'Required' })} />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
        </div>
        <div>
          <label className="form-label">Section</label>
          <input className="form-input" placeholder="e.g. Block A" {...register('section', { required: 'Required' })} />
          {errors.section && <p className="mt-1 text-xs text-red-500">{errors.section.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Total KG</label>
          <input type="number" step="0.01" min="0" className="form-input" placeholder="0.00"
            {...register('totalKg', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
          {errors.totalKg && <p className="mt-1 text-xs text-red-500">{errors.totalKg.message}</p>}
        </div>
        <div>
          <label className="form-label">Rate per KG (₹)</label>
          <input type="number" step="0.01" min="0" className="form-input" placeholder="0.00"
            {...register('ratePerKg', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
          {errors.ratePerKg && <p className="mt-1 text-xs text-red-500">{errors.ratePerKg.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">Buyer</label>
        <select className="form-input" {...register('buyerId', { required: 'Select a buyer' })}>
          <option value="">-- Select Buyer --</option>
          {buyers.map(b => <option key={b._id} value={b._id}>{b.name} (₹{b.ratePerKg}/kg)</option>)}
        </select>
        {errors.buyerId && <p className="mt-1 text-xs text-red-500">{errors.buyerId.message}</p>}
      </div>
      <div className="bg-tea-50 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm text-tea-600 font-medium">Auto-calculated Revenue</span>
        <span className="text-lg font-bold text-tea-700">₹{parseFloat(totalRevenue).toLocaleString()}</span>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}

export default function ProductionPage() {
  const { isOwner } = useAuth();
  const [entries, setEntries] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const [prodRes, buyerRes] = await Promise.all([
        api.get(`/production?page=${p}&limit=15`),
        api.get('/buyers'),
      ]);
      setEntries(prodRes.data.entries);
      setPages(prodRes.data.pages);
      setBuyers(buyerRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editEntry) {
        await api.put(`/production/${editEntry._id}`, data);
        toast.success('Entry updated');
      } else {
        await api.post('/production', data);
        toast.success('Entry added');
      }
      setShowModal(false);
      setEditEntry(null);
      fetchData(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/production/${deleteEntry._id}`);
      toast.success('Entry deleted');
      setDeleteEntry(null);
      fetchData(page);
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-tea-900 flex items-center gap-2">
              <Sprout className="w-6 h-6 text-tea-500" /> Leaf Production
            </h1>
            <p className="text-tea-500 text-sm mt-1">Daily production records and revenue tracking</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditEntry(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-tea-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tea-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Section</th>
                  <th className="table-header">KG</th>
                  <th className="table-header">Rate</th>
                  <th className="table-header">Revenue</th>
                  <th className="table-header">Buyer</th>
                  <th className="table-header">Added By</th>
                  {isOwner && <th className="table-header text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10 text-tea-400">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-tea-400">No production entries yet</td></tr>
                ) : entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-tea-50 transition-colors">
                    <td className="table-cell font-medium">{format(new Date(entry.date), 'dd MMM yyyy')}</td>
                    <td className="table-cell">{entry.section}</td>
                    <td className="table-cell font-semibold text-tea-700">{entry.totalKg?.toLocaleString()}</td>
                    <td className="table-cell">₹{entry.ratePerKg}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-0.5 text-green-700 font-semibold">
                        <IndianRupee className="w-3 h-3" />{entry.totalRevenue?.toLocaleString()}
                      </span>
                    </td>
                    <td className="table-cell text-tea-500">{entry.buyerId?.name || '—'}</td>
                    <td className="table-cell text-tea-500">{entry.createdBy?.name || '—'}</td>
                    {isOwner && (
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditEntry(entry); setShowModal(true); }}
                            className="p-1.5 hover:bg-tea-100 rounded-lg text-tea-500 hover:text-tea-700">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteEntry(entry)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-tea-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditEntry(null); }}
          title={editEntry ? 'Edit Production Entry' : 'Add Production Entry'} size="md">
          <ProductionForm
            onSubmit={handleSubmit}
            loading={formLoading}
            buyers={buyers}
            defaultValues={editEntry ? {
              date: format(new Date(editEntry.date), 'yyyy-MM-dd'),
              section: editEntry.section,
              totalKg: editEntry.totalKg,
              ratePerKg: editEntry.ratePerKg,
              buyerId: editEntry.buyerId?._id,
            } : { date: format(new Date(), 'yyyy-MM-dd') }}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteEntry}
          onClose={() => setDeleteEntry(null)}
          onConfirm={handleDelete}
          title="Delete Production Entry"
          message="This will also update the buyer's total quantity. Are you sure?"
          loading={deleteLoading}
        />
      </div>
    </ProtectedLayout>
  );
}
