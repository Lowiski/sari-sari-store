import { query } from '../config/database.js';

const BASE_SELECT = `
  SELECT p.id, p.sku, p.name, p.category_id, c.name AS category_name,
         p.unit, p.price, p.cost, p.reorder_level, p.is_active,
         COALESCE(s.stock_on_hand, 0) AS stock_on_hand,
         s.stock_status,
         p.created_at
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN v_product_stock s ON s.product_id = p.id
`;

export async function list({ search, categoryId, lowStock, limit, offset }) {
  const where = `
    WHERE ($1::text IS NULL OR p.name ILIKE '%' || $1 || '%' OR p.sku ILIKE '%' || $1 || '%')
      AND ($2::integer IS NULL OR p.category_id = $2)
      AND ($3::boolean IS NULL OR p.is_active = $3)
      AND ($4::boolean IS NOT TRUE OR COALESCE(s.stock_on_hand, 0) <= p.reorder_level)
  `;
  const params = [search || null, categoryId || null, null, lowStock === true];
  const [rows, count] = await Promise.all([
    query(`${BASE_SELECT} ${where} ORDER BY p.id LIMIT $5 OFFSET $6`, [...params, limit, offset]),
    query(`SELECT COUNT(*)::int AS total FROM products p LEFT JOIN v_product_stock s ON s.product_id = p.id ${where}`, params),
  ]);
  return { items: rows.rows, total: count.rows[0].total };
}

export async function findById(id) {
  const { rows } = await query(`${BASE_SELECT} WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

export async function create({ sku, name, categoryId, unit, price, cost, reorderLevel }) {
  const { rows } = await query(
    `INSERT INTO products (sku, name, category_id, unit, price, cost, reorder_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [sku, name, categoryId, unit || 'pc', price, cost, reorderLevel || 10]
  );
  return rows[0];
}

export async function update(id, { sku, name, categoryId, unit, price, cost, reorderLevel, isActive }) {
  const { rows } = await query(
    `UPDATE products
     SET sku = COALESCE($2, sku), name = COALESCE($3, name),
         category_id = COALESCE($4, category_id), unit = COALESCE($5, unit),
         price = COALESCE($6, price), cost = COALESCE($7, cost),
         reorder_level = COALESCE($8, reorder_level), is_active = COALESCE($9, is_active)
     WHERE id = $1 RETURNING *`,
    [id, sku || null, name || null, categoryId || null, unit || null,
     price ?? null, cost ?? null, reorderLevel ?? null, isActive ?? null]
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function categories() {
  const { rows } = await query(
    `SELECT c.id, c.name, COUNT(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id, c.name ORDER BY c.name`
  );
  return rows;
}

export async function allForAnalytics() {
  const { rows } = await query(`${BASE_SELECT} ORDER BY p.id`);
  return rows;
}
