import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { toInputDate } from '../../utils/formatDate.js';

export default function StockOutForm({ open, onClose, onSubmit, products = [], initial, loading }) {
  const [form, setForm] = useState({ productId: '', quantity: '1', reference: 'ADJUSTMENT', txnDate: toInputDate(), note: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      productId: initial ? String(initial.product_id) : '',
      quantity: '1',
      reference: 'ADJUSTMENT',
      txnDate: toInputDate(),
      note: '',
    });
    setError('');
  }, [open, initial]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const selected = products.find((p) => Number(p.id) === Number(form.productId));
  const available = Number(selected?.stock_on_hand || 0);

  const submit = () => {
    if (Number(form.quantity) > available) {
      setError(`Only ${available} units are available for this product.`);
      return;
    }
    onSubmit({
      productId: Number(form.productId),
      quantity: Number(form.quantity),
      reference: form.reference,
      txnDate: form.txnDate,
      note: form.note,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Stock out"
      subtitle="Record damaged, returned or manually removed stock."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={submit} disabled={loading || !form.productId}>{loading ? 'Saving...' : 'Remove stock'}</Button>
        </>
      }
    >
      {error ? <div className="alert alert-error">{error}</div> : null}
      <Input label="Product" as="select" value={form.productId} onChange={set('productId')} required>
        <option value="">Select product</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.stock_on_hand} on hand</option>)}
      </Input>
      {selected ? <div className="alert alert-info">Available stock: <strong>&nbsp;{available} units</strong></div> : null}
      <div className="form-grid">
        <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={set('quantity')} required />
        <Input label="Date" type="date" value={form.txnDate} onChange={set('txnDate')} required />
      </div>
      <Input label="Reference" value={form.reference} onChange={set('reference')} placeholder="DAMAGE / RETURN" />
      <Input label="Note" value={form.note} onChange={set('note')} placeholder="Optional remark" />
    </Modal>
  );
}
