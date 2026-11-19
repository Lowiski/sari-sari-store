import { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Boxes, RefreshCw } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import Pagination from '../components/common/Pagination.jsx';
import InventoryTable from '../components/inventory/InventoryTable.jsx';
import LowStockAlert from '../components/inventory/LowStockAlert.jsx';
import StockInForm from '../components/inventory/StockInForm.jsx';
import StockOutForm from '../components/inventory/StockOutForm.jsx';
import { inventoryService } from '../services/index.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export default function Inventory() {
  const [tab, setTab] = useState('stock');
  const [stock, setStock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [valuation, setValuation] = useState([]);
  const [movements, setMovements] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  const productOptions = stock.map((s) => ({
    id: s.product_id,
    name: s.product_name,
    stock_on_hand: s.stock_on_hand,
  }));

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [stockRes, alertRes, valuationRes, movementRes] = await Promise.all([
        inventoryService.stock(),
        inventoryService.alerts(),
        inventoryService.valuation(),
        inventoryService.transactions({ page, limit: 10 }),
      ]);
      setStock(stockRes);
      setAlerts(alertRes);
      setValuation(valuationRes);
      setMovements(movementRes.items);
      setTotal(movementRes.total);
      setPages(movementRes.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const submitMovement = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (form.type === 'in') await inventoryService.stockIn(payload);
      else await inventoryService.stockOut(payload);
      setForm(null);
      setNotice('Stock movement recorded.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalValue = valuation.reduce((sum, v) => sum + Number(v.total_cost_value || 0), 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Track stock on hand, receive deliveries and act on low-stock alerts."
        actions={
          <>
            <Button variant="outline" onClick={load} icon={RefreshCw}>Refresh</Button>
            <Button variant="outline" onClick={() => setForm({ type: 'out' })} icon={ArrowUpFromLine}>Stock out</Button>
            <Button onClick={() => setForm({ type: 'in' })} icon={ArrowDownToLine}>Stock in</Button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {notice ? <div className="alert alert-success" onClick={() => setNotice('')}>{notice}</div> : null}

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card stat-card"><span className="stat-label">Products tracked</span><span className="stat-value">{stock.length}</span></div>
        <div className="card stat-card"><span className="stat-label">Low stock</span><span className="stat-value" style={{ color: 'var(--warning)' }}>{alerts.filter((a) => a.stock_status === 'LOW STOCK').length}</span></div>
        <div className="card stat-card"><span className="stat-label">Out of stock</span><span className="stat-value" style={{ color: 'var(--danger)' }}>{alerts.filter((a) => a.stock_status === 'OUT OF STOCK').length}</span></div>
        <div className="card stat-card"><span className="stat-label">Inventory value</span><span className="stat-value" style={{ fontSize: 20 }}>{formatCurrency(totalValue)}</span></div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-head"><div><h3 className="card-title">Low-stock alerts</h3><p className="card-subtitle">Based on each product's reorder level</p></div><Boxes size={16} color="var(--muted)" /></div>
          <div className="card-body"><LowStockAlert alerts={alerts} onRestock={(item) => setForm({ type: 'in', initial: item })} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-title">Stock valuation by category</h3></div>
          <div className="card-body">
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Category</th><th className="text-right">Units</th><th className="text-right">Cost value</th></tr></thead>
                <tbody>
                  {valuation.map((v) => (
                    <tr key={v.category_name}>
                      <td className="cell-strong">{v.category_name}</td>
                      <td className="text-right">{v.total_units}</td>
                      <td className="text-right">{formatCurrency(v.total_cost_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head" style={{ paddingBottom: 0 }}>
          <div className="tabs" style={{ marginBottom: 0, border: 0 }}>
            <button className={`tab ${tab === 'stock' ? 'active' : ''}`} onClick={() => setTab('stock')}>Stock on hand</button>
            <button className={`tab ${tab === 'transactions' ? 'active' : ''}`} onClick={() => setTab('transactions')}>Stock movements</button>
          </div>
        </div>
        {loading ? <Loading /> : (
          <InventoryTable
            rows={tab === 'stock' ? stock : movements}
            mode={tab}
            onStockIn={(row) => setForm({ type: 'in', initial: row })}
            onStockOut={(row) => setForm({ type: 'out', initial: row })}
          />
        )}
        {tab === 'transactions' ? (
          <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
        ) : null}
      </div>

      <StockInForm
        open={form?.type === 'in'}
        onClose={() => setForm(null)}
        onSubmit={submitMovement}
        products={productOptions}
        initial={form?.initial}
        loading={saving}
      />
      <StockOutForm
        open={form?.type === 'out'}
        onClose={() => setForm(null)}
        onSubmit={submitMovement}
        products={productOptions}
        initial={form?.initial}
        loading={saving}
      />
    </>
  );
}
