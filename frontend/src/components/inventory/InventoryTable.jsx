import { ArrowDownToLine, ArrowUpFromLine, Boxes } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function InventoryTable({ rows = [], mode = 'stock', onStockIn, onStockOut }) {
  if (!rows.length) {
    return <div className="empty-state"><Boxes /><div>No inventory records found.</div></div>;
  }

  if (mode === 'transactions') {
    return (
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th><th>Product</th><th>Type</th><th className="text-right">Quantity</th>
              <th>Reference</th><th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="cell-muted">{formatDate(row.txn_date)}</td>
                <td className="cell-strong">{row.product_name}</td>
                <td>
                  <span className={`badge ${row.txn_type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                    {row.txn_type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}
                  </span>
                </td>
                <td className="text-right cell-strong">{row.quantity}</td>
                <td className="cell-muted">{row.reference || '—'}</td>
                <td className="cell-muted">{row.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th><th>Product</th><th>Category</th><th className="text-right">Unit cost</th>
            <th className="text-right">On hand</th><th className="text-right">Reorder at</th>
            <th>Status</th><th className="text-right">Stock value</th><th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.product_id}>
              <td className="cell-muted">{row.sku}</td>
              <td className="cell-strong">{row.product_name}</td>
              <td>{row.category_name}</td>
              <td className="text-right cell-muted">{formatCurrency(row.cost)}</td>
              <td className="text-right cell-strong">{row.stock_on_hand}</td>
              <td className="text-right cell-muted">{row.reorder_level}</td>
              <td>
                <span className={`badge ${row.stock_status === 'OUT OF STOCK' ? 'badge-danger' : row.stock_status === 'LOW STOCK' ? 'badge-warning' : 'badge-success'}`}>
                  {row.stock_status}
                </span>
              </td>
              <td className="text-right">{formatCurrency(row.stock_value)}</td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" title="Stock in" onClick={() => onStockIn(row)} style={{ color: 'var(--success)' }}><ArrowDownToLine size={14} /></button>
                  <button className="icon-btn" title="Stock out" onClick={() => onStockOut(row)} style={{ color: 'var(--danger)' }}><ArrowUpFromLine size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
