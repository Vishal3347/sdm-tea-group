'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function LabourForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Date</label>
        <input type="date" className="form-input" {...register('date', { required: 'Date is required' })} />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
      </div>
      <div>
        <label className="form-label">Total Workers Present</label>
        <input type="number" min="0" className="form-input" placeholder="e.g. 120"
          {...register('totalWorkers', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
        {errors.totalWorkers && <p className="mt-1 text-xs text-red-500">{errors.totalWorkers.message}</p>}
      </div>
      <div>
        <label className="form-label">Notes (Optional)</label>
        <textarea rows={3} className="form-input" placeholder="Any remarks about today's labour..."
          {...register('notes')} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}

export default function LabourPage() {
  const { isOwner } = useAuth();
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEntries = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/labour?page=${p}&limit=15`);
      setEntries(res.data.entries);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load labour entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(page); }, [page]);

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editEntry) {
        await api.put(`/labour/${editEntry._id}`, data);
        toast.success('Entry updated');
      } else {
        await api.post('/labour', data);
        toast.success('Entry added');
      }
      setShowModal(false);
      setEditEntry(null);
      fetchEntries(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/labour/${deleteEntry._id}`);
      toast.success('Entry deleted');
      setDeleteEntry(null);
      fetchEntries(page);
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-tea-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-tea-500" /> Labour Records
            </h1>
            <p className="text-tea-500 text-sm mt-1">Daily worker attendance tracking</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditEntry(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-tea-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-tea-50">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Workers</th>
                <th className="table-header">Notes</th>
                <th className="table-header">Added By</th>
                {isOwner && <th className="table-header text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-tea-400">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-tea-400">No entries yet</td></tr>
              ) : entries.map((entry) => (
                <tr key={entry._id} className="hover:bg-tea-50 transition-colors">
                  <td className="table-cell font-medium">{format(new Date(entry.date), 'dd MMM yyyy')}</td>
                  <td className="table-cell">
                    <span className="font-semibold text-tea-700">{entry.totalWorkers}</span>
                  </td>
                  <td className="table-cell text-tea-500">{entry.notes || '—'}</td>
                  <td className="table-cell text-tea-500">{entry.createdBy?.name || '—'}</td>
                  {isOwner && (
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditEntry(entry); setShowModal(true); }}
                          className="p-1.5 hover:bg-tea-100 rounded-lg text-tea-500 hover:text-tea-700 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteEntry(entry)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-tea-500 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditEntry(null); }}
          title={editEntry ? 'Edit Labour Entry' : 'Add Labour Entry'}>
          <LabourForm
            onSubmit={handleSubmit}
            loading={formLoading}
            defaultValues={editEntry ? {
              date: format(new Date(editEntry.date), 'yyyy-MM-dd'),
              totalWorkers: editEntry.totalWorkers,
              notes: editEntry.notes,
            } : { date: format(new Date(), 'yyyy-MM-dd') }}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteEntry}
          onClose={() => setDeleteEntry(null)}
          onConfirm={handleDelete}
          title="Delete Entry"
          message={`Delete labour entry for ${deleteEntry ? format(new Date(deleteEntry.date), 'dd MMM yyyy') : ''}?`}
          loading={deleteLoading}
        />
      </div>
    </ProtectedLayout>
  );
}
