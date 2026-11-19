import { ReceiptText, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function SalesTable({ sales = [], onView }) {
  if (!sales.length) {
    return <div className="empty-state"><ReceiptText /><div>No sales recorded for this period.</div></div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Payment</th>
            <th className="text-right">Subtotal</th>
            <th className="text-right">Discount</th>
            <th className="text-right">Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="cell-strong">{sale.invoice_no}</td>
              <td className="cell-muted">{formatDate(sale.sale_date)}</td>
              <td>{sale.customer_name}</td>
              <td>{sale.item_count}</td>
              <td><span className="badge badge-neutral">{sale.payment_method}</span></td>
              <td className="text-right cell-muted">{formatCurrency(sale.subtotal)}</td>
              <td className="text-right cell-muted">{formatCurrency(sale.discount)}</td>
              <td className="text-right cell-strong">{formatCurrency(sale.total)}</td>
              <td>
                <button className="icon-btn" title="View receipt" onClick={() => onView?.(sale)}><Eye size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
