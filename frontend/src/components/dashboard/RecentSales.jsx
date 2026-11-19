import { ReceiptText } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function RecentSales({ sales = [] }) {
  if (!sales.length) {
    return <div className="empty-state"><ReceiptText /><div>No recent sales yet.</div></div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Date</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="cell-strong">{sale.invoice_no}</td>
              <td>{sale.customer_name}</td>
              <td className="cell-muted">{formatDate(sale.sale_date)}</td>
              <td className="text-right cell-strong">{formatCurrency(sale.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
