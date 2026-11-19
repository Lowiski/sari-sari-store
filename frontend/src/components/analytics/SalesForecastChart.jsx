import {
  Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatCurrency.js';

export default function SalesForecastChart({ forecast = [] }) {
  return (
    <div className="chart-box-lg">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={forecast} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
          <XAxis dataKey="weekday" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={54} />
          <Tooltip
            labelFormatter={(value, payload) => payload?.[0]?.payload?.date || value}
            formatter={(value, name) => [formatCurrency(value), name === 'predictedRevenue' ? 'Predicted revenue' : name]}
          />
          <Area type="monotone" dataKey="upper" stroke="none" fill="#99f6e4" fillOpacity={0.55} />
          <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />
          <Line type="monotone" dataKey="predictedRevenue" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
