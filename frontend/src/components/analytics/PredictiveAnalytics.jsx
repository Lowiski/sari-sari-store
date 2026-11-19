import { Activity, AlertTriangle, Users } from 'lucide-react';
import SalesForecastChart from './SalesForecastChart.jsx';
import StatCard from '../dashboard/StatCard.jsx';
import { RISK_COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function PredictiveAnalytics({ data }) {
  if (!data) return null;
  const { model, forecast, productRisks, churnRisk, insights, totalForecastRevenue, weekdayIndex } = data;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid grid-4">
        <StatCard label="7-day forecast" value={formatCurrency(totalForecastRevenue)} icon={Activity} foot="Blended model" />
        <StatCard label="Avg. daily revenue" value={formatCurrency(model.averageDailyRevenue)} tone="info" foot="Last 30 days" />
        <StatCard label="Trend slope" value={`₱${model.trendSlope}/day`} tone={model.trendSlope >= 0 ? 'primary' : 'danger'} foot="Linear regression" />
        <StatCard label="At-risk products" value={productRisks.filter((p) => p.risk !== 'LOW').length} tone="warning" icon={AlertTriangle} foot="Stockout prediction" />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3 className="card-title">Sales forecast with confidence band</h3>
            <p className="card-subtitle">{model.name} · trained on {model.trainedOnDays} days</p>
          </div>
          <span className="badge badge-info">PREDICTIVE</span>
        </div>
        <div className="card-body"><SalesForecastChart forecast={forecast} /></div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Product demand & stockout risk</h3></div>
          <div className="card-body">
            <div className="table-wrap" style={{ maxHeight: 340, overflowY: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Product</th><th className="text-right">Avg/day</th><th className="text-right">Stock</th><th className="text-right">Cover</th><th>Risk</th></tr></thead>
                <tbody>
                  {productRisks.slice(0, 15).map((p) => (
                    <tr key={p.productId}>
                      <td className="cell-strong">{p.name}</td>
                      <td className="text-right">{p.avgDailyDemand}</td>
                      <td className="text-right">{p.stockOnHand}</td>
                      <td className="text-right">{p.daysCover}d</td>
                      <td><span className={`badge badge-${RISK_COLORS[p.risk] || 'neutral'}`}>{p.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div><h3 className="card-title">Customer churn signals</h3><p className="card-subtitle">Repeat buyers with long recency</p></div>
            <Users size={16} color="var(--muted)" />
          </div>
          <div className="card-body">
            {churnRisk.length === 0 ? (
              <div className="empty-state">No churn warnings detected.</div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: 260, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Customer</th><th className="text-right">Last purchase</th><th className="text-right">Lifetime</th><th>Risk</th></tr></thead>
                  <tbody>
                    {churnRisk.slice(0, 12).map((c) => (
                      <tr key={c.customerId}>
                        <td className="cell-strong">{c.name}</td>
                        <td className="text-right">{c.daysSinceLastPurchase}d ago</td>
                        <td className="text-right">{formatCurrency(c.lifetimeSpend)}</td>
                        <td><span className={`badge badge-${RISK_COLORS[c.risk] || 'neutral'}`}>{c.risk}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="insight-list" style={{ marginTop: 14 }}>
              {insights.map((text, i) => <div className="insight" key={i}><span className="bullet" /><span>{text}</span></div>)}
            </div>
            <div className="kv-list" style={{ marginTop: 14 }}>
              {Object.entries(weekdayIndex).map(([day, index]) => (
                <div className="kv" key={day}><span>Day {day} seasonality</span><strong>{index}x</strong></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
