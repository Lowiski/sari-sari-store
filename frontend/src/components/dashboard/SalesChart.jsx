import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatCompactCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';

export default function SalesChart({ data = [] }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatDate(value, { month: 'numeric', day: 'numeric' })}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={formatCompactCurrency}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={(value, name) => [
              name === 'revenue' ? formatCompactCurrency(value) : value,
              name === 'revenue' ? 'Revenue' : 'Orders',
            ]}
            labelFormatter={(value) => formatDate(value)}
          />
          <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.4} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
