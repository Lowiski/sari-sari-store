import { query } from '../config/database.js';

export async function insertMany(client, saleId, items) {
  const rows = [];
  for (const item of items) {
    const result = await client.query(
      `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [saleId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice]
    );
    rows.push(result.rows[0]);
  }
  return rows;
}

export async function byProduct({ from, to }) {
  const { rows } = await query(
    `SELECT p.id AS product_id, p.name AS product_name, c.name AS category_name,
            SUM(si.quantity)::int AS units_sold,
            SUM(si.line_total) AS revenue,
            COUNT(DISTINCT si.sale_id)::int AS times_sold
     FROM sale_items si
     JOIN products p ON p.id = si.product_id
     JOIN categories c ON c.id = p.category_id
     JOIN sales s ON s.id = si.sale_id
     WHERE ($1::date IS NULL OR s.sale_date >= $1)
       AND ($2::date IS NULL OR s.sale_date <= $2)
     GROUP BY p.id, p.name, c.name
     ORDER BY revenue DESC`,
    [from || null, to || null]
  );
  return rows;
}

export async function dailyTrend(days) {
  const { rows } = await query(
    `SELECT s.sale_date::text AS date,
            COUNT(*)::int AS orders,
            COALESCE(SUM(s.total), 0) AS revenue,
            COALESCE(SUM(si.units), 0)::int AS units
     FROM sales s
     LEFT JOIN (SELECT sale_id, SUM(quantity) AS units FROM sale_items GROUP BY sale_id) si
       ON si.sale_id = s.id
     WHERE s.sale_date >= CURRENT_DATE - ($1::int - 1)
     GROUP BY s.sale_date
     ORDER BY s.sale_date`,
    [days]
  );
  return rows;
}
