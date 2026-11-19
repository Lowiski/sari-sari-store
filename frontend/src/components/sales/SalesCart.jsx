import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function SalesCart({ items, onQuantity, onRemove }) {
  if (!items.length) {
    return (
      <div className="empty-state" style={{ padding: 24 }}>
        <ShoppingBagIcon />
        <div>Select a product to start a sale.</div>
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <div className="cart-item" key={item.productId}>
          <div style={{ flex: 1 }}>
            <div className="cell-strong">{item.name}</div>
            <div className="cell-muted">{formatCurrency(item.unitPrice)} each</div>
          </div>
          <div className="qty-control">
            <button type="button" className="qty-btn" onClick={() => onQuantity(item.productId, -1)}><Minus size={12} /></button>
            <strong style={{ minWidth: 18, textAlign: 'center' }}>{item.quantity}</strong>
            <button type="button" className="qty-btn" onClick={() => onQuantity(item.productId, 1)}><Plus size={12} /></button>
          </div>
          <strong style={{ minWidth: 82, textAlign: 'right' }}>{formatCurrency(item.quantity * item.unitPrice)}</strong>
          <button type="button" className="icon-btn" onClick={() => onRemove(item.productId)} title="Remove"><Trash2 size={13} /></button>
        </div>
      ))}
    </div>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
