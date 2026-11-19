const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

export function formatCurrency(value) {
  const amount = Number(value || 0);
  return formatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatCompactCurrency(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000000) return `₱${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `₱${(amount / 1000).toFixed(1)}k`;
  return formatCurrency(amount);
}
