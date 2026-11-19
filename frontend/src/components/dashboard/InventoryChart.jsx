import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

export default function InventoryChart({ risks = [], status }) {
  const data = risks.slice(0, 8).map((row) => ({
    name: row.name.length > 14 ? `${row.name.slice(0, 13)}…` : row.name,
    daysCover: Math.min(row.daysCover, 45),
    stock: row.stockOnHand,
  }));

  return (
    <>
      <div className="grid grid-3" style={{ gap: 10, marginBottom: 12 }}>
        <div className="insight" style={{ background: 'var(--success-bg)', borderColor: '#a7f3d0' }}>
          <span className="bullet" style={{ background: 'var(--success)' }} />
          <span><strong>{status?.inStock ?? 0}</strong> products in stock</span>
        </div>
        <div className="insight" style={{ background: 'var(--warning-bg)', borderColor: '#fde68a' }}>
          <span className="bullet" style={{ background: 'var(--warning)' }} />
          <span><strong>{status?.lowStock ?? 0}</strong> low stock</span>
        </div>
        <div className="insight" style={{ background: 'var(--danger-bg)', borderColor: '#fecaca' }}>
          <span className="bullet" style={{ background: 'var(--danger)' }} />
          <span><strong>{status?.outOfStock ?? 0}</strong> out of stock</span>
        </div>
      </div>
      <div className="chart-box-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={48} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="d" />
            <Tooltip formatter={(value) => [`${value} days`, 'Days of cover']} />
            <Bar dataKey="daysCover" radius={[5, 5, 0, 0]} barSize={18}>
              {data.map((row) => (
                <Cell key={row.name} fill={row.daysCover <= 7 ? '#ef4444' : row.daysCover <= 14 ? '#f59e0b' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
