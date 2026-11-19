import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Users } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import SearchBar from '../components/common/SearchBar.jsx';
import CustomerTable from '../components/customers/CustomerTable.jsx';
import CustomerForm from '../components/customers/CustomerForm.jsx';
import { customerService } from '../services/index.js';
import { useDebounce } from '../hooks/useDebounce.js';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerService.list({ page, limit: 10, search: debouncedSearch });
      setCustomers(response.items);
      setTotal(response.total);
      setPages(response.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const save = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (editing) await customerService.update(editing.id, payload);
      else await customerService.create(payload);
      setFormOpen(false);
      setNotice(editing ? 'Customer updated.' : 'Customer added.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await customerService.remove(deleting.id);
      setDeleting(null);
      setNotice('Customer deleted.');
      await load();
    } catch (err) {
      setError(err.message);
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Customer master file used for segmentation and retention analytics."
        actions={
          <>
            <Button variant="outline" onClick={load} icon={RefreshCw}>Refresh</Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }} icon={Plus}>Add customer</Button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {notice ? <div className="alert alert-success" onClick={() => setNotice('')}>{notice}</div> : null}

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 12 }}>
            <Users size={15} /> {total} customers
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or phone..." />
        </div>
        {loading ? <Loading /> : <CustomerTable customers={customers} onEdit={(c) => { setEditing(c); setFormOpen(true); }} onDelete={setDeleting} />}
        <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
      </div>

      <CustomerForm open={formOpen} onClose={() => setFormOpen(false)} onSave={save} initial={editing} loading={saving} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete customer?"
        message={`${deleting?.name || 'This customer'} will be removed. Historical sales records are kept.`}
        confirmLabel="Delete"
        loading={saving}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
