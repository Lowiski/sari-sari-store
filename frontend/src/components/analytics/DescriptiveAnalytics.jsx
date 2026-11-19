import { TrendingUp } from 'lucide-react';
import StatCard from '../dashboard/StatCard.jsx';
import SalesChart from '../dashboard/SalesChart.jsx';
import TopProductsChart from '../dashboard/TopProductsChart.jsx';
import CategoryChart from '../dashboard/CategoryChart.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function DescriptiveAnalytics({ data }) {
  if (!data) return null;
  const { kpis, dailySales, topProducts, categoryMix, customerSegments, marketing, insights } = data;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid grid-4">
        <StatCard label="Total revenue" value={formatCurrency(kpis.totalRevenue)} icon={TrendingUp} foot={`${kpis.totalOrders} orders`} />
        <StatCard label="Average basket" value={formatCurrency(kpis.averageBasket)} tone="info" foot="Per transaction" />
        <StatCard label="Units sold" value={kpis.unitsSold} tone="warning" foot="All products" />
        <StatCard label="Active customers" value={kpis.activeCustomers} tone="primary" foot={`of ${kpis.totalCustomers} records`} />
      </div>

      <div className="card">
        <div className="card-head">
          <div><h3 className="card-title">Daily sales history</h3><p className="card-subtitle">Last 90 days of observed revenue — input to the forecasting model</p></div>
          <span className="badge badge-info">DESCRIPTIVE</span>
        </div>
        <div className="card-body"><SalesChart data={dailySales} /></div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Top products by revenue</h3></div>
          <div className="card-body"><TopProductsChart data={topProducts} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Category revenue mix</h3></div>
          <div className="card-body"><CategoryChart data={categoryMix} /></div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Customer segments</h3></div>
          <div className="card-body">
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Segment</th><th className="text-right">Customers</th><th className="text-right">Orders</th><th className="text-right">Spend</th></tr></thead>
                <tbody>
                  {customerSegments.map((s) => (
                    <tr key={s.segment}>
                      <td className="cell-strong">{s.segment}</td>
                      <td className="text-right">{s.customers}</td>
                      <td className="text-right">{s.orders}</td>
                      <td className="text-right cell-strong">{formatCurrency(s.spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Marketing channel performance</h3></div>
          <div className="card-body">
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Channel</th><th className="text-right">Spend</th><th className="text-right">Conversions</th><th className="text-right">ROAS</th></tr></thead>
                <tbody>
                  {marketing.channels.map((c) => (
                    <tr key={c.channel}>
                      <td className="cell-strong">{c.channel}</td>
                      <td className="text-right">{formatCurrency(c.spend)}</td>
                      <td className="text-right">{c.conversions}</td>
                      <td className="text-right">
                        <span className={`badge ${c.roas >= 3 ? 'badge-success' : c.roas < 1.5 ? 'badge-danger' : 'badge-warning'}`}>{c.roas}x</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="insight-list" style={{ marginTop: 14 }}>
              {insights.map((text, i) => (
                <div className="insight" key={i}><span className="bullet" /><span>{text}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
