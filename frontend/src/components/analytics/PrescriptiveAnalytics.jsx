import { ArrowRight, CheckCircle2, Megaphone, PackagePlus, Tag } from 'lucide-react';
import RestockRecommendations from './RestockRecommendations.jsx';
import StatCard from '../dashboard/StatCard.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function PrescriptiveAnalytics({ data }) {
  if (!data) return null;
  const { chain, restock, markdown, marketing, promotions, priorityActions, summary, insights } = data;

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid grid-4">
        <StatCard label="Restock orders" value={restock.length} icon={PackagePlus} tone="warning" foot={formatCurrency(summary.totalRecommendedOrderCost)} />
        <StatCard label="Markdown items" value={markdown.length} icon={Tag} tone="info" foot="Slow movers" />
        <StatCard label="Channel decisions" value={marketing.length} icon={Megaphone} foot="Budget reallocation" />
        <StatCard label="Retention promos" value={promotions.length} icon={CheckCircle2} tone="primary" foot="At-risk customers" />
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg,#f0fdfa,#fff)', borderColor: '#99f6e4' }}>
        <div className="card-head"><h3 className="card-title">How the BA steps connect</h3><span className="badge badge-success">DECISION CHAIN</span></div>
        <div className="card-body">
          <div className="grid grid-3" style={{ gap: 12 }}>
            {[
              { label: '1 · Descriptive input', icon: '📊', value: `${formatCurrency(chain.descriptiveInput.revenue)} revenue`, detail: `Top product: ${chain.descriptiveInput.topProduct || '—'}` },
              { label: '2 · Predictive input', icon: '📈', value: `${formatCurrency(chain.predictiveInput.forecastRevenue)} forecast`, detail: `${chain.predictiveInput.atRiskProducts} at-risk products` },
              { label: '3 · Prescriptive output', icon: '✅', value: `${chain.decisionOutput.restockOrders} restock orders`, detail: `${chain.decisionOutput.promos} promos generated` },
            ].map((step, i) => (
              <div className="step-card" key={step.label}>
                <div className="step-top">
                  <span className="step-num">{i + 1}</span>
                  <div><h4>{step.label}</h4><div className="step-q">{step.icon} {step.value}</div></div>
                </div>
                <p>{step.detail}</p>
                {i < 2 ? <ArrowRight size={15} style={{ marginTop: 8, color: 'var(--primary)' }} /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div><h3 className="card-title">Restock plan</h3><p className="card-subtitle">Target: 21 days of demand cover · generated from predictive stockout risk</p></div>
        </div>
        <div className="card-body" style={{ paddingTop: 8 }}><RestockRecommendations items={restock} /></div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Marketing budget reallocation</h3></div>
          <div className="card-body">
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Channel</th><th className="text-right">Current</th><th className="text-right">Suggested</th><th className="text-right">ROAS</th><th>Decision</th></tr></thead>
                <tbody>
                  {marketing.map((m) => (
                    <tr key={m.channel}>
                      <td className="cell-strong">{m.channel}</td>
                      <td className="text-right">{formatCurrency(m.currentSpend)}</td>
                      <td className="text-right cell-strong">{formatCurrency(m.suggestedBudget)}</td>
                      <td className="text-right">{m.roas}x</td>
                      <td><span className={`badge badge-${m.decision === 'INCREASE' ? 'success' : m.decision === 'REDUCE' ? 'danger' : 'neutral'}`}>{m.decision}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="kv-list" style={{ marginTop: 14 }}>
              {insights.map((text, i) => <div className="kv" key={i}><span>Insight {i + 1}</span><strong style={{ textAlign: 'right' }}>{text}</strong></div>)}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3 className="card-title">Priority actions & promotions</h3></div>
          <div className="card-body">
            <div className="insight-list">
              {priorityActions.map((action, i) => (
                <div className="insight" key={i}>
                  <span className="bullet" style={{ background: action.priority === 'P1' ? 'var(--danger)' : action.priority === 'P2' ? 'var(--warning)' : 'var(--primary)' }} />
                  <div>
                    <span className={`badge badge-${action.priority === 'P1' ? 'danger' : action.priority === 'P2' ? 'warning' : 'info'}`} style={{ marginRight: 6 }}>{action.priority}</span>
                    <strong>{action.type}</strong><br />
                    {action.message}<br />
                    <span className="cell-muted">{action.impact}</span>
                  </div>
                </div>
              ))}
            </div>
            {promotions.length ? (
              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table className="data-table">
                  <thead><tr><th>Customer</th><th>Offer</th><th>Channel</th></tr></thead>
                  <tbody>
                    {promotions.slice(0, 6).map((p) => (
                      <tr key={p.customerId}>
                        <td className="cell-strong">{p.customer}</td>
                        <td>{p.offer}</td>
                        <td className="cell-muted">{p.channel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
