import { Pencil, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function ProductTable({ products = [], onEdit, onDelete }) {
  if (!products.length) {
    return <div className="empty-state"><Package /><div>No products match your filters.</div></div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Category</th>
            <th className="text-right">Price</th>
            <th className="text-right">Cost</th>
            <th>Stock</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = Number(p.stock_on_hand || 0);
            const reorder = Number(p.reorder_level || 0);
            const stockClass = stock === 0 ? 'out' : stock <= reorder ? 'low' : '';
            const pct = reorder > 0 ? Math.min(100, Math.round((stock / (reorder * 3)) * 100)) : 100;
            return (
              <tr key={p.id}>
                <td className="cell-muted">{p.sku}</td>
                <td>
                  <div className="cell-strong">{p.name}</div>
                  <div className="cell-muted">per {p.unit}</div>
                </td>
                <td>{p.category_name || '—'}</td>
                <td className="text-right">{formatCurrency(p.price)}</td>
                <td className="text-right cell-muted">{formatCurrency(p.cost)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="cell-strong" style={{ minWidth: 28 }}>{stock}</span>
                    <div className={`stock-bar ${stockClass}`}><span style={{ width: `${pct}%` }} /></div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${stock === 0 ? 'badge-danger' : stock <= reorder ? 'badge-warning' : 'badge-success'}`}>
                    {p.stock_status || (stock === 0 ? 'OUT' : stock <= reorder ? 'LOW' : 'OK')}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" title="Edit" onClick={() => onEdit(p)}><Pencil size={14} /></button>
                    <button className="icon-btn" title="Delete" onClick={() => onDelete(p)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
