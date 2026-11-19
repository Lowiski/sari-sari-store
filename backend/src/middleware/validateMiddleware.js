/** Small dependency-free validation helpers used by the route controllers. */

export function isMissing(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

export function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body?.[field];
      if (rule.required && isMissing(value)) {
        errors.push(`${field} is required.`);
        continue;
      }
      if (!isMissing(value) && rule.type === 'number' && Number.isNaN(Number(value))) {
        errors.push(`${field} must be a number.`);
      }
      if (!isMissing(value) && rule.min !== undefined && Number(value) < rule.min) {
        errors.push(`${field} must be at least ${rule.min}.`);
      }
      if (!isMissing(value) && rule.maxLength && String(value).length > rule.maxLength) {
        errors.push(`${field} must not exceed ${rule.maxLength} characters.`);
      }
    }
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }
    return next();
  };
}

export function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  return { page, limit, offset: (page - 1) * limit };
}
