import { PackagePlus } from 'lucide-react';
import { RISK_COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function RestockRecommendations({ items = [] }) {
  if (!items.length) {
    return <div className="empty-state"><PackagePlus /><div>No restock actions needed. All products have sufficient cover.</div></div>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th><th>Action</th><th className="text-right">Stock</th><th className="text-right">Cover</th>
            <th className="text-right">Order qty</th><th className="text-right">Est. cost</th><th>Urgency</th><th>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td>
                <div className="cell-strong">{item.product}</div>
                <div className="cell-muted">{item.sku}</div>
              </td>
              <td style={{ maxWidth: 190, fontSize: 11 }}>{item.action}</td>
              <td className="text-right">{item.currentStock}</td>
              <td className="text-right">{item.daysCover}d</td>
              <td className="text-right cell-strong">{item.recommendedOrder}</td>
              <td className="text-right">{formatCurrency(item.estimatedCost)}</td>
              <td><span className={`badge badge-${RISK_COLORS[item.urgency] || 'neutral'}`}>{item.urgency}</span></td>
              <td className="cell-muted" style={{ fontSize: 10.5 }}>{item.supplier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
