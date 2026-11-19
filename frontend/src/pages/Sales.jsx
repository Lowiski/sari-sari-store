import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Loading from '../components/common/Loading.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Modal from '../components/common/Modal.jsx';
import SalesTable from '../components/sales/SalesTable.jsx';
import SalesForm from '../components/sales/SalesForm.jsx';
import SalesSummary from '../components/sales/SalesSummary.jsx';
import { productService, salesService, customerService } from '../services/index.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [salesRes, summaryRes, productsRes, customersRes, invoiceRes] = await Promise.all([
        salesService.list({ page, limit: 10, from, to, search }),
        salesService.summary({ from, to }),
        productService.list({ limit: 100 }),
        customerService.list({ limit: 100 }),
        salesService.nextInvoice(),
      ]);
      setSales(salesRes.items);
      setTotal(salesRes.total);
      setPages(salesRes.pages);
      setSummary(summaryRes);
      setProducts(productsRes.items);
      setCustomers(customersRes.items);
      setInvoiceNo(invoiceRes.invoiceNo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, from, to, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [from, to, search]);

  const createSale = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      await salesService.create(payload);
      setFormOpen(false);
      setNotice('Sale recorded. Inventory was updated automatically.');
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const viewSale = async (sale) => {
    try {
      const response = await salesService.get(sale.id);
      setReceipt(response);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Sales / Point of Sale"
        subtitle="Record transactions, deduct stock automatically and review sales history."
        actions={
          <>
            <Button variant="outline" onClick={load} icon={RefreshCw}>Refresh</Button>
            <Button onClick={() => { setFormError(''); setFormOpen(true); }} icon={Plus}>New sale</Button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {notice ? <div className="alert alert-success" onClick={() => setNotice('')}>{notice}</div> : null}

      <SalesSummary summary={summary} />

      <div className="card">
        <div className="card-body filter-row" style={{ paddingBottom: 14 }}>
          <div className="date-field"><Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="date-field"><Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div className="search-field-sm"><Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Invoice or customer" /></div>
        </div>
        {loading ? <Loading /> : <SalesTable sales={sales} onView={viewSale} />}
        <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
      </div>

      <SalesForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={createSale}
        products={products}
        customers={customers}
        invoiceNo={invoiceNo}
        loading={saving}
        error={formError}
      />

      <Modal open={Boolean(receipt)} onClose={() => setReceipt(null)} title={`Receipt ${receipt?.invoice_no || ''}`} subtitle={receipt ? formatDate(receipt.sale_date) : ''}>
        {receipt ? (
          <>
            <div className="kv-list">
              <div className="kv"><span>Customer</span><strong>{receipt.customer_name}</strong></div>
              <div className="kv"><span>Payment</span><strong>{receipt.payment_method}</strong></div>
            </div>
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table className="data-table">
                <thead><tr><th>Item</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead>
                <tbody>
                  {receipt.items.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-strong">{item.product_name}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="total-line"><span>Total</span><span>{formatCurrency(receipt.total)}</span></div>
          </>
        ) : null}
      </Modal>
    </>
  );
}
