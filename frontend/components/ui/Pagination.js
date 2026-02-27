'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg border border-tea-200 hover:bg-tea-50 disabled:opacity-40 disabled:cursor-not-allowed text-tea-600"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-tea-600">Page {page} of {pages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="p-1.5 rounded-lg border border-tea-200 hover:bg-tea-50 disabled:opacity-40 disabled:cursor-not-allowed text-tea-600"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
