import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function LowStockAlert({ alerts = [], onRestock }) {
  if (!alerts.length) {
    return (
      <div className="alert alert-success">
        <CheckCircle2 size={16} />
        <span>All products are above their reorder level.</span>
      </div>
    );
  }

  return (
    <div className="insight-list">
      {alerts.slice(0, 8).map((item) => (
        <div className="insight" key={item.product_id} style={{ background: item.stock_on_hand === 0 ? 'var(--danger-bg)' : 'var(--warning-bg)', border: 'none' }}>
          <span className="bullet" style={{ background: item.stock_on_hand === 0 ? 'var(--danger)' : 'var(--warning)' }} />
          <div style={{ flex: 1 }}>
            <strong>{item.product_name}</strong><br />
            <span style={{ opacity: .85 }}>
              {item.stock_on_hand} {item.unit} left · reorder at {item.reorder_level}
            </span>
          </div>
          {onRestock ? (
            <button className="btn btn-sm btn-outline" onClick={() => onRestock(item)}>Restock</button>
          ) : null}
        </div>
      ))}
      {alerts.length > 8 ? (
        <div className="cell-muted" style={{ textAlign: 'center' }}>+ {alerts.length - 8} more products need attention</div>
      ) : null}
    </div>
  );
}
