import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Loading from '../components/common/Loading.jsx';
import ReportFilters from '../components/reports/ReportFilters.jsx';
import SalesReport from '../components/reports/SalesReport.jsx';
import InventoryReport from '../components/reports/InventoryReport.jsx';
import { analyticsService } from '../services/index.js';
import { toInputDate } from '../utils/formatDate.js';

function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [tab, setTab] = useState('sales');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ from: '', to: '' });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = tab === 'sales'
        ? await analyticsService.salesReport(applied)
        : await analyticsService.inventoryReport(applied);
      setReport(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, applied]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    if (!report) return;
    if (tab === 'sales') {
      downloadCsv(`sales-report-${toInputDate()}.csv`, report.daily.map((d) => ({
        date: d.date, orders: d.orders, revenue: d.revenue, discounts: d.discounts,
      })));
    } else {
      downloadCsv(`inventory-report-${toInputDate()}.csv`, report.stock.map((s) => ({
        sku: s.sku, product: s.product_name, category: s.category_name,
        on_hand: s.stock_on_hand, reorder_level: s.reorder_level, status: s.stock_status,
      })));
    }
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Generate, filter and export sales and inventory reports." />

      <div className="card" style={{ marginBottom: 18, boxShadow: 'none' }}>
        <div className="card-body" style={{ padding: 12 }}>
          <div className="tabs" style={{ marginBottom: 0, border: 0 }}>
            <button className={`tab ${tab === 'sales' ? 'active' : ''}`} onClick={() => { setTab('sales'); setReport(null); }}>Sales report</button>
            <button className={`tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => { setTab('inventory'); setReport(null); }}>Inventory report</button>
          </div>
        </div>
      </div>

      <ReportFilters
        from={from}
        to={to}
        onFrom={setFrom}
        onTo={setTo}
        onApply={() => setApplied({ from, to })}
        onExport={exportCsv}
        loading={loading}
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="card"><Loading message="Generating report..." /></div> : (
        tab === 'sales'
          ? <SalesReport report={report} />
          : <InventoryReport report={report} />
      )}
    </>
  );
}
