import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, CircleDollarSign, Package, Receipt, ShoppingBasket, Sparkles, Users,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import SalesChart from '../components/dashboard/SalesChart.jsx';
import TopProductsChart from '../components/dashboard/TopProductsChart.jsx';
import CategoryChart from '../components/dashboard/CategoryChart.jsx';
import InventoryChart from '../components/dashboard/InventoryChart.jsx';
import RecentSales from '../components/dashboard/RecentSales.jsx';
import Loading from '../components/common/Loading.jsx';
import Button from '../components/common/Button.jsx';
import { analyticsService, salesService } from '../services/index.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      analyticsService.overview(),
      salesService.list({ limit: 6 }),
    ])
      .then(([overviewRes, salesRes]) => {
        if (!active) return;
        // Services already unwrap the API's { success, data } envelope.
        setOverview(overviewRes);
        setRecent(salesRes.items);
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading message="Computing business analytics..." />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!overview) return null;

  const { descriptive, predictive, prescriptive, baChain } = overview;
  const { kpis, dailySales, topProducts, categoryMix, insights } = descriptive;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of sales, inventory and the three-stage business analytics process."
        actions={
          <>
            <Link to="/analytics"><Button variant="outline">Open analytics</Button></Link>
            <Link to="/sales"><Button icon={Receipt}>New sale</Button></Link>
          </>
        }
      />

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard label="Total revenue" value={formatCurrency(kpis.totalRevenue)} icon={CircleDollarSign} foot={`${kpis.totalOrders} orders recorded`} />
        <StatCard label="Average basket" value={formatCurrency(kpis.averageBasket)} icon={ShoppingBasket} tone="info" foot={`${kpis.unitsSold} units sold`} />
        <StatCard label="Active customers" value={kpis.activeCustomers} icon={Users} tone="warning" foot={`of ${kpis.totalCustomers} records`} />
        <StatCard label="Restock alerts" value={descriptive.inventoryStatus.lowStock + descriptive.inventoryStatus.outOfStock} icon={AlertTriangle} tone="danger" foot={`${descriptive.inventoryStatus.outOfStock} out of stock`} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-head">
            <div><h3 className="card-title">Sales performance</h3><p className="card-subtitle">Observed daily revenue · descriptive analytics</p></div>
            <span className="badge badge-info">90 DAYS</span>
          </div>
          <div className="card-body"><SalesChart data={dailySales} /></div>
        </div>
        <div className="card">
          <div className="card-head">
            <div><h3 className="card-title">Revenue by product</h3><p className="card-subtitle">Best sellers driving the business</p></div>
            <span className="badge badge-success">TOP 8</span>
          </div>
          <div className="card-body"><TopProductsChart data={topProducts} /></div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Category mix</h3></div>
          <div className="card-body"><CategoryChart data={categoryMix} /></div>
        </div>
        <div className="card span-2">
          <div className="card-head">
            <div><h3 className="card-title">Inventory health & stock cover</h3><p className="card-subtitle">Days of cover predicted from demand velocity</p></div>
            <Link to="/inventory"><Button variant="ghost" size="sm">Manage <ArrowRight /></Button></Link>
          </div>
          <div className="card-body"><InventoryChart risks={predictive.productRisks} status={descriptive.inventoryStatus} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-head">
          <div><h3 className="card-title">Business analytics process</h3><p className="card-subtitle">Each stage uses the previous stage's output to produce a decision</p></div>
          <Sparkles size={17} color="var(--primary)" />
        </div>
        <div className="card-body">
          <div className="grid grid-3" style={{ gap: 12 }}>
            {baChain.map((step) => (
              <div className="step-card" key={step.step}>
                <div className="step-top">
                  <span className="step-num">{step.step}</span>
                  <div><h4>{step.stage}</h4><div className="step-q">{step.question}</div></div>
                </div>
                <p>{step.evidence}</p>
                <p style={{ marginTop: 7, color: 'var(--primary-dark)', fontWeight: 600 }}>→ {step.feeds}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head"><h3 className="card-title">Recent sales</h3><Link to="/sales"><Button variant="ghost" size="sm">View all <ArrowRight /></Button></Link></div>
          <div className="card-body" style={{ paddingTop: 8 }}><RecentSales sales={recent} /></div>
        </div>
        <div className="card">
          <div className="card-head">
            <div><h3 className="card-title">Insights & recommended actions</h3><p className="card-subtitle">Generated from the current dataset</p></div>
            <Package size={16} color="var(--muted)" />
          </div>
          <div className="card-body">
            <div className="insight-list">
              {insights.map((text, i) => <div className="insight" key={i}><span className="bullet" /><span>{text}</span></div>)}
              {prescriptive.insights.map((text, i) => <div className="insight" key={`p-${i}`}><span className="bullet" style={{ background: 'var(--warning)' }} /><span>{text}</span></div>)}
            </div>
            <Link to="/analytics"><Button className="btn-block" style={{ marginTop: 14 }}>See full analytics</Button></Link>
          </div>
        </div>
      </div>
    </>
  );
}
