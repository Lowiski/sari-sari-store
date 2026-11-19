/** Centralised error handler. Keeps stack traces out of production responses. */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const known = {
    23505: { status: 409, message: 'A record with that unique value already exists.' },
    23503: { status: 400, message: 'Referenced record does not exist.' },
    23514: { status: 400, message: 'Value violates a database rule.' },
    '22P02': { status: 400, message: 'Invalid value type supplied.' },
  };

  const match = known[error.code];
  const status = match?.status || error.status || 500;
  const message = match?.message || error.message || 'Unexpected server error.';

  if (status >= 500) console.error('[error]', error);

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error.stack ? { stack: error.stack } : {}),
  });
}
