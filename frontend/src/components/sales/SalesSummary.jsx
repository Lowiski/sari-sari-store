import { CircleDollarSign, Receipt, ShoppingBasket, Tag } from 'lucide-react';
import StatCard from '../dashboard/StatCard.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function SalesSummary({ summary }) {
  if (!summary) return null;
  return (
    <div className="grid grid-4" style={{ marginBottom: 18 }}>
      <StatCard label="Gross sales" value={formatCurrency(summary.revenue)} icon={CircleDollarSign} foot="All recorded transactions" />
      <StatCard label="Orders" value={summary.orders} icon={Receipt} tone="info" foot="Transaction count" />
      <StatCard label="Avg. basket" value={formatCurrency(summary.avg_basket)} icon={ShoppingBasket} tone="warning" foot="Revenue per order" />
      <StatCard label="Discounts" value={formatCurrency(summary.discounts)} icon={Tag} tone="danger" foot="Total promo given" />
    </div>
  );
}
