'use client';

import { Button } from './Button';
import type { PageMeta } from '@/lib/types';

export function Pagination({ meta, onPageChange }: { meta: PageMeta; onPageChange: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      <Button
        variant="ghost"
        disabled={!meta.hasPrevPage}
        onClick={() => onPageChange(meta.page - 1)}
        aria-label="Previous page"
      >
        ← Prev
      </Button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="text-[var(--text-muted)] px-1">…</span>}
          <button
            onClick={() => onPageChange(p)}
            aria-current={p === meta.page ? 'page' : undefined}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
              p === meta.page ? 'bg-brand-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <Button
        variant="ghost"
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(meta.page + 1)}
        aria-label="Next page"
      >
        Next →
      </Button>
    </nav>
  );
}
