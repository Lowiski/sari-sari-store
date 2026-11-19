import { query } from '../config/database.js';

export async function list({ search, type, limit, offset }) {
  const where = `
    WHERE ($1::text IS NULL OR name ILIKE '%' || $1 || '%' OR phone ILIKE '%' || $1 || '%')
      AND ($2::text IS NULL OR customer_type = $2)
  `;
  const params = [search || null, type || null];
  const [rows, count] = await Promise.all([
    query(`SELECT c.*,
             (SELECT COUNT(*)::int FROM sales s WHERE s.customer_id = c.id) AS total_orders,
             (SELECT COALESCE(SUM(s.total), 0) FROM sales s WHERE s.customer_id = c.id) AS total_spend
           FROM customers c ${where} ORDER BY c.id LIMIT $3 OFFSET $4`, [...params, limit, offset]),
    query(`SELECT COUNT(*)::int AS total FROM customers ${where}`, params),
  ]);
  return { items: rows.rows, total: count.rows[0].total };
}

export async function findById(id) {
  const { rows } = await query('SELECT * FROM customers WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function create({ name, phone, email, address, customerType }) {
  const { rows } = await query(
    `INSERT INTO customers (name, phone, email, address, customer_type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, phone || null, email || null, address || null, customerType || 'walk-in']
  );
  return rows[0];
}

export async function update(id, { name, phone, email, address, customerType }) {
  const { rows } = await query(
    `UPDATE customers SET name = COALESCE($2, name), phone = COALESCE($3, phone),
       email = COALESCE($4, email), address = COALESCE($5, address),
       customer_type = COALESCE($6, customer_type)
     WHERE id = $1 RETURNING *`,
    [id, name || null, phone || null, email || null, address || null, customerType || null]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM customers WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function summary() {
  // The view exposes customer_id; alias it to id for the shared model shape.
  const { rows } = await query(
    `SELECT customer_id AS id, name, customer_type, total_orders,
            total_spend, avg_spend, last_purchase
     FROM v_customer_summary ORDER BY total_spend DESC`
  );
  return rows;
}
