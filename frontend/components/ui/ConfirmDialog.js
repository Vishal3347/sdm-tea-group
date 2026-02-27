'use client';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-tea-900">{title}</h3>
        </div>
        <p className="text-tea-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="btn-danger flex-1" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
