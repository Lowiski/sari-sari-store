import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

const EMPTY = {
  sku: '', name: '', categoryId: '', unit: 'pc', price: '', cost: '', reorderLevel: '10',
};

export default function ProductForm({ open, onClose, onSave, initial, categories = [], loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(initial
      ? {
          sku: initial.sku || '',
          name: initial.name || '',
          categoryId: String(initial.category_id || ''),
          unit: initial.unit || 'pc',
          price: String(initial.price ?? ''),
          cost: String(initial.cost ?? ''),
          reorderLevel: String(initial.reorder_level ?? 10),
        }
      : EMPTY);
  }, [open, initial]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    onSave({
      sku: form.sku.trim(),
      name: form.name.trim(),
      categoryId: Number(form.categoryId),
      unit: form.unit,
      price: Number(form.price),
      cost: Number(form.cost),
      reorderLevel: Number(form.reorderLevel),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit product' : 'Add new product'}
      subtitle="Products are the foundation of sales and inventory analytics."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="product-form" disabled={loading}>
            {loading ? 'Saving...' : initial ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit}>
        <div className="form-grid">
          <Input label="SKU" value={form.sku} onChange={set('sku')} placeholder="SKU-0061" required />
          <Input label="Unit" value={form.unit} onChange={set('unit')} placeholder="pc, sachet, bottle" />
        </div>
        <Input label="Product name" value={form.name} onChange={set('name')} placeholder="e.g. Coca-Cola 330ml" required />
        <Input label="Category" as="select" value={form.categoryId} onChange={set('categoryId')} required>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Input>
        <div className="form-grid">
          <Input label="Selling price (₱)" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
          <Input label="Cost price (₱)" type="number" step="0.01" min="0" value={form.cost} onChange={set('cost')} required />
        </div>
        <Input
          label="Reorder level"
          type="number"
          min="0"
          value={form.reorderLevel}
          onChange={set('reorderLevel')}
          hint="A low-stock alert is raised when on-hand stock reaches this level."
        />
      </form>
    </Modal>
  );
}
