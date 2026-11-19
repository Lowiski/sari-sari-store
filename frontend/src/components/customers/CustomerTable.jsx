import { Pencil, Trash2, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function CustomerTable({ customers = [], onEdit, onDelete }) {
  if (!customers.length) {
    return <div className="empty-state"><Users /><div>No customers found.</div></div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th><th>Contact</th><th>Type</th>
            <th className="text-right">Orders</th><th className="text-right">Lifetime spend</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="cell-strong">{c.name}</div>
                <div className="cell-muted">{c.address || '—'}</div>
              </td>
              <td>
                <div>{c.phone || '—'}</div>
                <div className="cell-muted">{c.email || ''}</div>
              </td>
              <td><span className="badge badge-neutral">{c.customer_type}</span></td>
              <td className="text-right">{c.total_orders}</td>
              <td className="text-right cell-strong">{formatCurrency(c.total_spend)}</td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" title="Edit" onClick={() => onEdit(c)}><Pencil size={14} /></button>
                  <button className="icon-btn" title="Delete" onClick={() => onDelete(c)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
