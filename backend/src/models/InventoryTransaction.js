import { query } from '../config/database.js';

export async function stock() {
  const { rows } = await query('SELECT * FROM v_product_stock ORDER BY stock_on_hand ASC, product_name');
  return rows;
}

export async function transactions({ productId, type, from, to, limit, offset } = {}) {
  const where = `
    WHERE ($1::integer IS NULL OR product_id = $1)
      AND ($2::text IS NULL OR txn_type = $2)
      AND ($3::date IS NULL OR txn_date >= $3)
      AND ($4::date IS NULL OR txn_date <= $4)
  `;
  const params = [productId || null, type || null, from || null, to || null];
  const [rows, count] = await Promise.all([
    query(
      `SELECT it.*, p.name AS product_name, p.sku
       FROM inventory_transactions it JOIN products p ON p.id = it.product_id
       ${where} ORDER BY it.txn_date DESC, it.id DESC LIMIT $5 OFFSET $6`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*)::int AS total FROM inventory_transactions ${where}`, params),
  ]);
  return { items: rows.rows, total: count.rows[0].total };
}

export async function create({ productId, txnType, quantity, reference, txnDate, note }) {
  const { rows } = await query(
    `INSERT INTO inventory_transactions (product_id, txn_type, quantity, reference, txn_date, note)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [productId, txnType, quantity, reference || null, txnDate, note || null]
  );
  return rows[0];
}

export async function alerts() {
  const { rows } = await query(
    `SELECT * FROM v_product_stock
     WHERE stock_on_hand <= reorder_level
     ORDER BY stock_on_hand ASC, product_name`
  );
  return rows;
}

export async function valuation() {
  const { rows } = await query('SELECT * FROM v_inventory_valuation ORDER BY category_name');
  return rows;
}
