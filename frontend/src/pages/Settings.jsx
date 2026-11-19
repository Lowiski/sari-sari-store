import { Database, FileText, KeyRound, Layers3, Server } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="System information, stack and project references." />

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><div><h3 className="card-title">System stack</h3><p className="card-subtitle">Technologies used in this capstone</p></div><Layers3 size={16} color="var(--muted)" /></div>
          <div className="card-body">
            <div className="kv-list">
              <div className="kv"><span>Frontend</span><strong>React 18 + Vite + React Router</strong></div>
              <div className="kv"><span>Visualization</span><strong>Recharts</strong></div>
              <div className="kv"><span>Backend</span><strong>Express.js (REST API)</strong></div>
              <div className="kv"><span>Database</span><strong>Neon Serverless PostgreSQL</strong></div>
              <div className="kv"><span>Authentication</span><strong>JWT + bcrypt</strong></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3 className="card-title">Demo credentials</h3><p className="card-subtitle">Seeded by database/seed.sql</p></div><KeyRound size={16} color="var(--muted)" /></div>
          <div className="card-body">
            <div className="kv-list">
              <div className="kv"><span>Username</span><strong>admin</strong></div>
              <div className="kv"><span>Password</span><strong>admin123</strong></div>
              <div className="kv"><span>Role</span><strong>admin</strong></div>
              <div className="kv"><span>Default API</span><strong>http://localhost:5000/api</strong></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3 className="card-title">Analytics pipeline</h3><p className="card-subtitle">How each stage feeds the next</p></div><Database size={16} color="var(--muted)" /></div>
          <div className="card-body">
            <div className="insight-list">
              <div className="insight"><span className="bullet" /><span><strong>Descriptive</strong> aggregates 180+ sales into revenue, trends, top products and channel ROAS.</span></div>
              <div className="insight"><span className="bullet" style={{ background: 'var(--warning)' }} /><span><strong>Predictive</strong> uses that history for regression + moving-average forecasts and stockout/churn risk.</span></div>
              <div className="insight"><span className="bullet" style={{ background: 'var(--danger)' }} /><span><strong>Prescriptive</strong> turns the risks into reorder quantities, markdowns, budget shifts and promos.</span></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3 className="card-title">Documentation</h3><p className="card-subtitle">Located in the /docs folder</p></div><FileText size={16} color="var(--muted)" /></div>
          <div className="card-body">
            <div className="kv-list">
              <div className="kv"><span>Case study</span><strong>docs/Case-Study-Problem.md</strong></div>
              <div className="kv"><span>BA process</span><strong>docs/BA-Process-Overview.md</strong></div>
              <div className="kv"><span>Project documentation</span><strong>docs/ProjectDocumentation.md</strong></div>
              <div className="kv"><span>Diagrams</span><strong>ERD.md · UseCaseDiagram.md · DataFlowDiagram.md</strong></div>
              <div className="kv"><span>Rating sheet</span><strong>docs/Rating-Sheet.md</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head"><div><h3 className="card-title">Database setup commands</h3><p className="card-subtitle">Run in the Neon SQL Editor in this order</p></div><Server size={16} color="var(--muted)" /></div>
        <div className="card-body">
          <pre style={{ background: '#0f172a', color: '#a7f3d0', padding: 16, borderRadius: 10, fontSize: 11.5, overflowX: 'auto', lineHeight: 1.7 }}>
{`-- 1. Create tables
\\i database/schema.sql

-- 2. Load at least 50 records per variable
\\i database/seed.sql

-- 3. Create analytics views
\\i database/views.sql

-- 4. Start the API and frontend
cd backend  && npm install && npm run db:setup && npm run dev
cd frontend && npm install && npm run dev`}
          </pre>
        </div>
      </div>
    </>
  );
}
