import { verifyToken } from '../utils/generateToken.js';
import { query } from '../config/database.js';

/** Require a valid Bearer token. */
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const decoded = verifyToken(token);
    const result = await query(
      'SELECT id, username, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/** Optional role gate: authorize('admin', 'manager') */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permission.' });
    }
    return next();
  };
}
