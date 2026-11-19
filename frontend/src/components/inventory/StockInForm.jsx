import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { toInputDate } from '../../utils/formatDate.js';

export default function StockInForm({ open, onClose, onSubmit, products = [], initial, loading }) {
  const [form, setForm] = useState({ productId: '', quantity: '1', reference: 'DELIVERY', txnDate: toInputDate(), note: '' });

  useEffect(() => {
    if (!open) return;
    setForm({
      productId: initial ? String(initial.product_id) : '',
      quantity: '1',
      reference: 'DELIVERY',
      txnDate: toInputDate(),
      note: '',
    });
  }, [open, initial]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Stock in"
      subtitle="Add units received from a supplier or delivery."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSubmit({
            productId: Number(form.productId),
            quantity: Number(form.quantity),
            reference: form.reference,
            txnDate: form.txnDate,
            note: form.note,
          })} disabled={loading || !form.productId}>{loading ? 'Saving...' : 'Add stock'}</Button>
        </>
      }
    >
      <Input label="Product" as="select" value={form.productId} onChange={set('productId')} required>
        <option value="">Select product</option>
        {products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.stock_on_hand} on hand</option>)}
      </Input>
      <div className="form-grid">
        <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={set('quantity')} required />
        <Input label="Date" type="date" value={form.txnDate} onChange={set('txnDate')} required />
      </div>
      <Input label="Reference" value={form.reference} onChange={set('reference')} placeholder="DELIVERY / PO-123" />
      <Input label="Note" value={form.note} onChange={set('note')} placeholder="Optional remark" />
    </Modal>
  );
}
