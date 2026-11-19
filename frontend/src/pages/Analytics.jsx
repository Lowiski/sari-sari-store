import { useCallback, useEffect, useState } from 'react';
import { Activity, ClipboardCheck, RefreshCw, Target } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import DescriptiveAnalytics from '../components/analytics/DescriptiveAnalytics.jsx';
import PredictiveAnalytics from '../components/analytics/PredictiveAnalytics.jsx';
import PrescriptiveAnalytics from '../components/analytics/PrescriptiveAnalytics.jsx';
import { analyticsService } from '../services/index.js';

const STAGES = [
  { key: 'descriptive', label: '1 · Descriptive', icon: Target, question: 'What happened?' },
  { key: 'predictive', label: '2 · Predictive', icon: Activity, question: 'What will happen?' },
  { key: 'prescriptive', label: '3 · Prescriptive', icon: ClipboardCheck, question: 'What should we do?' },
];

export default function Analytics() {
  const [tab, setTab] = useState('descriptive');
  const [horizon, setHorizon] = useState(7);
  const [data, setData] = useState({ descriptive: null, predictive: null, prescriptive: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [descriptive, predictive, prescriptive] = await Promise.all([
        analyticsService.descriptive(),
        analyticsService.predictive({ horizon }),
        analyticsService.prescriptive({ horizon }),
      ]);
      setData({
        descriptive,
        predictive,
        prescriptive,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [horizon]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader
        title="Business Analytics"
        subtitle="Descriptive → Predictive → Prescriptive: a connected decision pipeline."
        actions={
          <>
            <select className="select horizon-select" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
              {[7, 14, 30].map((h) => <option key={h} value={h}>{h}-day horizon</option>)}
            </select>
            <Button variant="outline" onClick={load} icon={RefreshCw}>Recompute</Button>
          </>
        }
      />

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-body" style={{ padding: 14 }}>
          <div className="grid grid-3" style={{ gap: 10 }}>
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <button
                  key={stage.key}
                  className={`step-card ${tab === stage.key ? '' : ''}`}
                  style={{
                    textAlign: 'left',
                    borderColor: tab === stage.key ? 'var(--primary)' : 'var(--line)',
                    background: tab === stage.key ? '#f0fdfa' : '#fff',
                    boxShadow: tab === stage.key ? '0 0 0 2px rgba(13,148,136,.12)' : 'none',
                  }}
                  onClick={() => setTab(stage.key)}
                >
                  <div className="step-top">
                    <span className="step-num"><Icon size={13} /></span>
                    <div><h4>{stage.label}</h4><div className="step-q">{stage.question}</div></div>
                  </div>
                  <p>{stage.key === 'descriptive' ? 'KPIs, trends, top products and channel ROAS' : stage.key === 'predictive' ? 'Forecasts, demand velocity, stockout and churn risk' : 'Restock, markdown, marketing and retention actions'}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? (
        <div className="card"><Loading message="Running analytics models..." /></div>
      ) : (
        <>
          {tab === 'descriptive' ? <DescriptiveAnalytics data={data.descriptive} /> : null}
          {tab === 'predictive' ? <PredictiveAnalytics data={data.predictive} /> : null}
          {tab === 'prescriptive' ? <PrescriptiveAnalytics data={data.prescriptive} /> : null}
        </>
      )}
    </>
  );
}
