export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return '—';
  // Treat a plain YYYY-MM-DD database date as local calendar day.
  const date = new Date(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-PH', options);
}

export function formatDateTime(value) {
  return formatDate(value, {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function toInputDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
