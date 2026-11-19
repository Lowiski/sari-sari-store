import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, pages = 1, total = 0, limit = 10, onPageChange }) {
  const visible = Array.from({ length: Math.min(pages, 5) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, pages - 4));
    return start + i;
  }).filter((p) => p >= 1 && p <= pages);

  return (
    <div className="pagination">
      <span>
        Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </span>
      <div className="pagination-controls">
        <button className="page-num" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft size={13} />
        </button>
        {visible.map((p) => (
          <button
            key={p}
            className={`page-num ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button className="page-num" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
