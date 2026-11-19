import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import ProductFilters from '../components/products/ProductFilters.jsx';
import ProductTable from '../components/products/ProductTable.jsx';
import ProductForm from '../components/products/ProductForm.jsx';
import { productService } from '../services/index.js';
import { useDebounce } from '../hooks/useDebounce.js';

export default function Products() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.list({
          page,
          limit: 10,
          search: debouncedSearch,
          categoryId: category,
          lowStock,
        }),
        productService.categories(),
      ]);
      setItems(productsRes.items);
      setTotal(productsRes.total);
      setPages(productsRes.pages);
      setCategories(categoriesRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, lowStock]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [debouncedSearch, category, lowStock]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (product) => { setEditing(product); setFormOpen(true); };

  const save = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (editing) await productService.update(editing.id, payload);
      else await productService.create(payload);
      setFormOpen(false);
      setNotice(editing ? 'Product updated.' : 'Product created.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await productService.remove(deleting.id);
      setDeleting(null);
      setNotice('Product deleted.');
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
        title="Products"
        subtitle={`${total} products in the catalog · manage pricing and reorder levels`}
        actions={
          <>
            <Button variant="outline" onClick={load} icon={RefreshCw}>Refresh</Button>
            <Button onClick={openCreate} icon={Plus}>Add product</Button>
          </>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {notice ? <div className="alert alert-success" onClick={() => setNotice('')}>{notice}</div> : null}

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 14 }}>
          <ProductFilters
            search={search}
            onSearch={setSearch}
            category={category}
            onCategory={setCategory}
            categories={categories}
            lowStock={lowStock}
            onLowStock={setLowStock}
          />
        </div>
        {loading ? <Loading /> : <ProductTable products={items} onEdit={openEdit} onDelete={setDeleting} />}
        <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={save}
        initial={editing}
        categories={categories}
        loading={saving}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete product?"
        message={`${deleting?.name || 'This product'} will be removed from the catalog. Existing sales and stock records remain in the database.`}
        confirmLabel="Delete"
        loading={saving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
