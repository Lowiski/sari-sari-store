import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatCompactCurrency } from '../../utils/formatCurrency.js';

export default function TopProductsChart({ data = [] }) {
  const items = data.slice(0, 8).map((row) => ({
    ...row,
    shortName: row.name.length > 18 ? `${row.name.slice(0, 17)}…` : row.name,
  }));

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical" margin={{ top: 4, right: 14, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" horizontal={false} />
          <XAxis type="number" tickFormatter={formatCompactCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="shortName" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} width={112} />
          <Tooltip formatter={(value) => [formatCompactCurrency(value), 'Revenue']} />
          <Bar dataKey="revenue" fill="#0d9488" radius={[0, 5, 5, 0]} barSize={13} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
