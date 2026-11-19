import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import SalesCart from './SalesCart.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { toInputDate } from '../../utils/formatDate.js';
import { PAYMENT_METHODS } from '../../utils/constants.js';

export default function SalesForm({
  open, onClose, onSubmit, products = [], customers = [], invoiceNo, loading, error,
}) {
  const [customerId, setCustomerId] = useState('');
  const [saleDate, setSaleDate] = useState(toInputDate());
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState('0');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!open) return;
    setCustomerId('');
    setSaleDate(toInputDate());
    setPaymentMethod('cash');
    setDiscount('0');
    setSelectedProduct('');
    setCart([]);
  }, [open]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart]
  );
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  const addItem = () => {
    const product = products.find((p) => Number(p.id) === Number(selectedProduct));
    if (!product) return;
    const available = Number(product.stock_on_hand || 0);
    setCart((current) => {
      const existing = current.find((item) => item.productId === Number(product.id));
      if (existing) {
        if (existing.quantity >= available) return current;
        return current.map((item) =>
          item.productId === Number(product.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (available < 1) return current;
      return [...current, {
        productId: Number(product.id),
        name: product.name,
        unitPrice: Number(product.price),
        quantity: 1,
        available,
      }];
    });
    setSelectedProduct('');
  };

  const changeQuantity = (productId, delta) => {
    setCart((current) => current
      .map((item) => {
        if (item.productId !== productId) return item;
        return { ...item, quantity: Math.min(item.available, Math.max(0, item.quantity + delta)) };
      })
      .filter((item) => item.quantity > 0));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      customerId: customerId ? Number(customerId) : null,
      saleDate,
      paymentMethod,
      discount: Number(discount) || 0,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="New sale"
      subtitle={`Invoice ${invoiceNo || '—'} · stock is deducted automatically`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="sale-form" disabled={loading || cart.length === 0}>
            {loading ? 'Saving...' : `Record sale · ${formatCurrency(total)}`}
          </Button>
        </>
      }
    >
      {error ? <div className="alert alert-error">{error}</div> : null}
      <form id="sale-form" onSubmit={submit}>
        <div className="form-grid">
          <Input label="Customer" as="select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Walk-in customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Input>
          <Input label="Sale date" type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} required />
          <Input label="Payment method" as="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method.toUpperCase()}</option>)}
          </Input>
          <Input label="Discount (₱)" type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>

        <div className="card" style={{ boxShadow: 'none', marginBottom: 14 }}>
          <div className="card-body" style={{ padding: 14 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700 }}>Add item</label>
            <div className="add-item-row" style={{ marginTop: 7 }}>
              <select className="select" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Choose a product...</option>
                {products.filter((p) => Number(p.stock_on_hand) > 0 || cart.some((i) => i.productId === Number(p.id))).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} · {formatCurrency(p.price)} · {p.stock_on_hand} left</option>
                ))}
              </select>
              <Button type="button" onClick={addItem} disabled={!selectedProduct} icon={Plus}>Add</Button>
            </div>
          </div>
        </div>

        <SalesCart items={cart} onQuantity={changeQuantity} onRemove={(id) => setCart((c) => c.filter((i) => i.productId !== id))} />

        <div style={{ marginTop: 12, borderTop: '1px dashed var(--line)', paddingTop: 4 }}>
          <div className="kv"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div className="kv"><span>Discount</span><strong>− {formatCurrency(discount)}</strong></div>
          <div className="total-line"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>
      </form>
    </Modal>
  );
}
