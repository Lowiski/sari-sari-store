import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function SalesReport({ report }) {
  if (!report) return null;
  const { summary, daily, products } = report;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid grid-4">
        {[
          ['Gross sales', formatCurrency(summary.revenue)],
          ['Orders', summary.orders],
          ['Average basket', formatCurrency(summary.avg_basket)],
          ['Units sold', summary.units_sold],
        ].map(([label, value]) => (
          <div className="card stat-card" key={label}>
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Daily revenue</h3><span className="card-subtitle">{daily.length} days in range</span></div>
        <div className="card-body">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => formatDate(v, { month: 'numeric', day: 'numeric' })} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={18} />
                <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
                <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(v) => formatDate(v)} />
                <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3 className="card-title">Product performance</h3></div>
        <div className="card-body">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Product</th><th>Category</th><th className="text-right">Units</th><th className="text-right">Orders</th><th className="text-right">Revenue</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td className="cell-strong">{p.product_name}</td>
                    <td className="cell-muted">{p.category_name}</td>
                    <td className="text-right">{p.units_sold}</td>
                    <td className="text-right">{p.times_sold}</td>
                    <td className="text-right cell-strong">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
