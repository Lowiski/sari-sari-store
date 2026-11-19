import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { CUSTOMER_TYPES } from '../../utils/constants.js';

const EMPTY = { name: '', phone: '', email: '', address: '', customerType: 'walk-in' };

export default function CustomerForm({ open, onClose, onSave, initial, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm(initial
      ? {
          name: initial.name || '',
          phone: initial.phone || '',
          email: initial.email || '',
          address: initial.address || '',
          customerType: initial.customer_type || 'walk-in',
        }
      : EMPTY);
  }, [open, initial]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit customer' : 'Add customer'}
      subtitle="Customer records support segmentation and churn analysis."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="customer-form" disabled={loading}>
            {loading ? 'Saving...' : initial ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={(e) => {
        e.preventDefault();
        onSave({
          name: form.name.trim(),
          phone: form.phone,
          email: form.email,
          address: form.address,
          customerType: form.customerType,
        });
      }}>
        <Input label="Full name" value={form.name} onChange={set('name')} required />
        <div className="form-grid">
          <Input label="Mobile number" value={form.phone} onChange={set('phone')} placeholder="0917 123 4567" />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="optional" />
        </div>
        <Input label="Customer type" as="select" value={form.customerType} onChange={set('customerType')}>
          {CUSTOMER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        </Input>
        <Input label="Address" value={form.address} onChange={set('address')} placeholder="Optional" />
      </form>
    </Modal>
  );
}
