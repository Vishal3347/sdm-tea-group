'use client';
import { useState, useEffect, useRef } from 'react';
import ProtectedLayout from '../../../components/layout/ProtectedLayout';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Pagination from '../../../components/ui/Pagination';
import { Plus, Edit2, Trash2, Bug, Camera, Image as ImageIcon } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Image from 'next/image';

function PestForm({ onSubmit, defaultValues, loading }) {
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Date</label>
          <input type="date" name="date" className="form-input"
            defaultValue={defaultValues?.date || format(new Date(), 'yyyy-MM-dd')} required />
        </div>
        <div>
          <label className="form-label">Section</label>
          <input name="section" className="form-input" placeholder="e.g. Block B"
            defaultValue={defaultValues?.section} required />
        </div>
      </div>
      <div>
        <label className="form-label">Pest Type</label>
        <input name="pestType" className="form-input" placeholder="e.g. Red Spider Mite"
          defaultValue={defaultValues?.pestType} required />
      </div>
      <div>
        <label className="form-label">Notes</label>
        <textarea rows={3} name="notes" className="form-input" placeholder="Severity, affected area..."
          defaultValue={defaultValues?.notes} />
      </div>
      <div>
        <label className="form-label">Photo (Optional)</label>
        <div
          className="border-2 border-dashed border-tea-200 rounded-lg p-4 text-center cursor-pointer hover:border-tea-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-32 mx-auto rounded object-cover" />
          ) : defaultValues?.imageUrl ? (
            <div className="space-y-2">
              <img src={defaultValues.imageUrl} alt="current" className="max-h-32 mx-auto rounded object-cover" />
              <p className="text-xs text-tea-400">Click to replace</p>
            </div>
          ) : (
            <div className="text-tea-400">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Click to upload photo</p>
              <p className="text-xs mt-1">JPG, PNG up to 5MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Report'}
        </button>
      </div>
    </form>
  );
}

export default function PestPage() {
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
  const [viewImage, setViewImage] = useState(null);

  const fetchEntries = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/pest?page=${p}&limit=12`);
      setEntries(res.data.entries);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load pest reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(page); }, [page]);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editEntry) {
        await api.put(`/pest/${editEntry._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Report updated');
      } else {
        await api.post('/pest', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Pest report added');
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
      await api.delete(`/pest/${deleteEntry._id}`);
      toast.success('Report deleted');
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
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-tea-900 flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-500" /> Pest Reports
            </h1>
            <p className="text-tea-500 text-sm mt-1">Crop health monitoring and pest tracking</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditEntry(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Report Pest
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-tea-400">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-tea-100">
            <Bug className="w-12 h-12 text-tea-200 mx-auto mb-3" />
            <p className="text-tea-400">No pest reports yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <div key={entry._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-tea-100 hover:shadow-md transition-shadow">
                {entry.imageUrl ? (
                  <div
                    className="h-40 overflow-hidden cursor-pointer group relative"
                    onClick={() => setViewImage(entry.imageUrl)}
                  >
                    <img src={entry.imageUrl} alt={entry.pestType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                    <Bug className="w-8 h-8 text-red-300" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-tea-900 text-sm">{entry.pestType}</h3>
                      <p className="text-xs text-tea-500 mt-0.5">Section: {entry.section}</p>
                    </div>
                    {isOwner && (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditEntry(entry); setShowModal(true); }}
                          className="p-1 hover:bg-tea-50 rounded text-tea-400 hover:text-tea-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteEntry(entry)}
                          className="p-1 hover:bg-red-50 rounded text-tea-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {entry.notes && <p className="text-xs text-tea-500 mt-2 italic">"{entry.notes}"</p>}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-tea-50">
                    <span className="text-xs text-tea-400">{format(new Date(entry.date), 'dd MMM yyyy')}</span>
                    <span className="text-xs text-tea-400">{entry.createdBy?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pages} onPageChange={setPage} />

        {/* Image View Modal */}
        {viewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setViewImage(null)}>
            <img src={viewImage} alt="Pest" className="max-w-full max-h-full rounded-xl shadow-2xl" />
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditEntry(null); }}
          title={editEntry ? 'Edit Pest Report' : 'Report Pest Issue'} size="md">
          <PestForm
            onSubmit={handleSubmit}
            loading={formLoading}
            defaultValues={editEntry ? {
              date: format(new Date(editEntry.date), 'yyyy-MM-dd'),
              section: editEntry.section,
              pestType: editEntry.pestType,
              notes: editEntry.notes,
              imageUrl: editEntry.imageUrl,
            } : null}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteEntry}
          onClose={() => setDeleteEntry(null)}
          onConfirm={handleDelete}
          title="Delete Pest Report"
          message="Delete this pest report permanently?"
          loading={deleteLoading}
        />
      </div>
    </ProtectedLayout>
  );
}
