export default function StatCard({ label, value, icon: Icon, tone = 'primary', foot }) {
  const tones = {
    primary: { bg: 'var(--primary-light)', color: 'var(--primary-dark)' },
    warning: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
    danger: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
    info: { bg: 'var(--info-bg)', color: 'var(--info)' },
  };
  const style = tones[tone] || tones.primary;

  return (
    <div className="card stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon ? (
          <span className="stat-icon" style={{ background: style.bg, color: style.color }}>
            <Icon size={17} />
          </span>
        ) : null}
      </div>
      <div className="stat-value">{value}</div>
      {foot ? <div className="stat-foot">{foot}</div> : null}
    </div>
  );
}
