import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

export default function CategoryChart({ data = [] }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="category"
            cx="50%"
            cy="48%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
