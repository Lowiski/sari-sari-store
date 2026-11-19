import { query } from '../config/database.js';

export async function findByUsername(username) {
  const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await query(
    'SELECT id, username, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function create({ username, passwordHash, role = 'staff' }) {
  const { rows } = await query(
    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
    [username, passwordHash, role]
  );
  return rows[0];
}
