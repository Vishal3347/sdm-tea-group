'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ProtectedLayout from '../../../components/layout/ProtectedLayout';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Pagination from '../../../components/ui/Pagination';
import { Plus, Edit2, Trash2, Droplets } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function IrrigationForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues });
  const irrigationDone = watch('irrigationDone');

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
          <input className="form-input" placeholder="e.g. Block C" {...register('section', { required: 'Required' })} />
          {errors.section && <p className="mt-1 text-xs text-red-500">{errors.section.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">Irrigation Done?</label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="true" {...register('irrigationDone', { required: true })} className="text-tea-600" />
            <span className="text-sm text-tea-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="false" {...register('irrigationDone', { required: true })} className="text-tea-600" />
            <span className="text-sm text-tea-700">No</span>
          </label>
        </div>
      </div>
      {irrigationDone === 'true' && (
        <div>
          <label className="form-label">Duration (Hours)</label>
          <input type="number" step="0.5" min="0" className="form-input" placeholder="e.g. 2.5"
            {...register('duration', { min: { value: 0, message: 'Min 0' } })} />
        </div>
      )}
      <div>
        <label className="form-label">Notes</label>
        <textarea rows={3} className="form-input" placeholder="Additional remarks..."
          {...register('notes')} />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Log'}
        </button>
      </div>
    </form>
  );
}

export default function IrrigationPage() {
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
      const res = await api.get(`/irrigation?page=${p}&limit=15`);
      setEntries(res.data.entries);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load irrigation logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(page); }, [page]);

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      const payload = { ...data, irrigationDone: data.irrigationDone === 'true' };
      if (editEntry) {
        await api.put(`/irrigation/${editEntry._id}`, payload);
        toast.success('Log updated');
      } else {
        await api.post('/irrigation', payload);
        toast.success('Irrigation log added');
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
      await api.delete(`/irrigation/${deleteEntry._id}`);
      toast.success('Log deleted');
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
              <Droplets className="w-6 h-6 text-blue-500" /> Irrigation Logs
            </h1>
            <p className="text-tea-500 text-sm mt-1">Water management records</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditEntry(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Add Log
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-tea-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-tea-50">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Section</th>
                <th className="table-header">Status</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Notes</th>
                <th className="table-header">Added By</th>
                {isOwner && <th className="table-header text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-tea-400">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-tea-400">No irrigation logs yet</td></tr>
              ) : entries.map((entry) => (
                <tr key={entry._id} className="hover:bg-tea-50 transition-colors">
                  <td className="table-cell font-medium">{format(new Date(entry.date), 'dd MMM yyyy')}</td>
                  <td className="table-cell">{entry.section}</td>
                  <td className="table-cell">
                    <span className={entry.irrigationDone ? 'badge-green' : 'badge-red'}>
                      {entry.irrigationDone ? 'Done' : 'Not Done'}
                    </span>
                  </td>
                  <td className="table-cell">{entry.duration ? `${entry.duration}h` : '—'}</td>
                  <td className="table-cell text-tea-500 max-w-xs truncate">{entry.notes || '—'}</td>
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
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditEntry(null); }}
          title={editEntry ? 'Edit Irrigation Log' : 'Add Irrigation Log'}>
          <IrrigationForm
            onSubmit={handleSubmit}
            loading={formLoading}
            defaultValues={editEntry ? {
              date: format(new Date(editEntry.date), 'yyyy-MM-dd'),
              section: editEntry.section,
              irrigationDone: editEntry.irrigationDone ? 'true' : 'false',
              duration: editEntry.duration,
              notes: editEntry.notes,
            } : { date: format(new Date(), 'yyyy-MM-dd'), irrigationDone: 'true' }}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteEntry}
          onClose={() => setDeleteEntry(null)}
          onConfirm={handleDelete}
          title="Delete Irrigation Log"
          message="Delete this irrigation log permanently?"
          loading={deleteLoading}
        />
      </div>
    </ProtectedLayout>
  );
}
