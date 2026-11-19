export default function Input({
  label,
  hint,
  error,
  as = 'input',
  className = '',
  children,
  ...props
}) {
  const Tag = as;
  return (
    <div className="field">
      {label ? <label>{label}</label> : null}
      {Tag === 'select' ? (
        <select className={`select ${className}`} {...props}>{children}</select>
      ) : Tag === 'textarea' ? (
        <textarea className={`textarea ${className}`} {...props} />
      ) : (
        <input className={`input ${className}`} {...props} />
      )}
      {hint && !error ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-hint" style={{ color: 'var(--danger)' }}>{error}</span> : null}
    </div>
  );
}
