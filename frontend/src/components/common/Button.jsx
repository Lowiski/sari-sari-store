export default function Button({
  variant = 'primary',
  size = '',
  icon: Icon,
  children,
  className = '',
  ...props
}) {
  return (
    <button className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`} {...props}>
      {Icon ? <Icon /> : null}
      {children}
    </button>
  );
}
