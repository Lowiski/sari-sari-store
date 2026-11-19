import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function InventoryReport({ report }) {
  if (!report) return null;
  const { stock, valuation, movements } = report;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="card-head"><h3 className="card-title">Inventory valuation by category</h3></div>
        <div className="card-body">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Category</th><th className="text-right">Products</th><th className="text-right">Units</th><th className="text-right">Cost value</th><th className="text-right">Retail value</th></tr></thead>
              <tbody>
                {valuation.map((v) => (
                  <tr key={v.category_name}>
                    <td className="cell-strong">{v.category_name}</td>
                    <td className="text-right">{v.products}</td>
                    <td className="text-right">{v.total_units}</td>
                    <td className="text-right">{formatCurrency(v.total_cost_value)}</td>
                    <td className="text-right cell-strong">{formatCurrency(v.total_retail_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Stock on hand</h3></div>
          <div className="card-body">
            <div className="table-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Product</th><th className="text-right">Stock</th><th className="text-right">Value</th><th>Status</th></tr></thead>
                <tbody>
                  {stock.map((s) => (
                    <tr key={s.product_id}>
                      <td className="cell-strong">{s.product_name}</td>
                      <td className="text-right">{s.stock_on_hand}</td>
                      <td className="text-right">{formatCurrency(s.stock_value)}</td>
                      <td><span className={`badge ${s.stock_status === 'OUT OF STOCK' ? 'badge-danger' : s.stock_status === 'LOW STOCK' ? 'badge-warning' : 'badge-success'}`}>{s.stock_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Stock movement summary</h3></div>
          <div className="card-body">
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Type</th><th className="text-right">Transactions</th><th className="text-right">Units</th></tr></thead>
                <tbody>
                  {movements.slice(0, 30).map((m, i) => (
                    <tr key={`${m.date}-${m.txn_type}-${i}`}>
                      <td className="cell-muted">{formatDate(m.date)}</td>
                      <td><span className={`badge ${m.txn_type === 'IN' ? 'badge-success' : 'badge-danger'}`}>{m.txn_type}</span></td>
                      <td className="text-right">{m.transactions}</td>
                      <td className="text-right cell-strong">{m.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
