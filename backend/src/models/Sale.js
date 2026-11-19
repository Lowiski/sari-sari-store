import { query } from '../config/database.js';

const BASE_SELECT = `
  SELECT s.id, s.invoice_no, s.sale_date, s.customer_id,
         COALESCE(c.name, 'Walk-in Customer') AS customer_name,
         s.subtotal, s.discount, s.total, s.payment_method,
         (SELECT COUNT(*)::int FROM sale_items si WHERE si.sale_id = s.id) AS item_count
  FROM sales s
  LEFT JOIN customers c ON c.id = s.customer_id
`;

export async function list({ from, to, customerId, search, limit, offset }) {
  const where = `
    WHERE ($1::date IS NULL OR s.sale_date >= $1)
      AND ($2::date IS NULL OR s.sale_date <= $2)
      AND ($3::integer IS NULL OR s.customer_id = $3)
      AND ($4::text IS NULL OR s.invoice_no ILIKE '%' || $4 || '%' OR c.name ILIKE '%' || $4 || '%')
  `;
  const params = [from || null, to || null, customerId || null, search || null];
  const [rows, count] = await Promise.all([
    query(`${BASE_SELECT} ${where} ORDER BY s.sale_date DESC, s.id DESC LIMIT $5 OFFSET $6`, [...params, limit, offset]),
    query(`SELECT COUNT(*)::int AS total FROM sales s LEFT JOIN customers c ON c.id = s.customer_id ${where}`, params),
  ]);
  return { items: rows.rows, total: count.rows[0].total };
}

export async function findById(id) {
  const { rows } = await query(`${BASE_SELECT} WHERE s.id = $1`, [id]);
  if (!rows[0]) return null;
  const items = await query(
    `SELECT si.id, si.product_id, p.name AS product_name, si.quantity, si.unit_price, si.line_total
     FROM sale_items si JOIN products p ON p.id = si.product_id
     WHERE si.sale_id = $1 ORDER BY si.id`,
    [id]
  );
  return { ...rows[0], items: items.rows };
}

export async function create({ invoiceNo, customerId, saleDate, subtotal, discount, total, paymentMethod }) {
  const { rows } = await query(
    `INSERT INTO sales (invoice_no, customer_id, sale_date, subtotal, discount, total, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [invoiceNo, customerId || null, saleDate, subtotal, discount, total, paymentMethod || 'cash']
  );
  return rows[0];
}

export async function nextInvoiceNumber() {
  const { rows } = await query(
    `SELECT 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
            LPAD((COUNT(*) + 1)::text, 4, '0') AS invoice_no
     FROM sales WHERE sale_date = CURRENT_DATE`
  );
  return rows[0].invoice_no;
}

export async function summary({ from, to } = {}) {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS orders,
            COALESCE(SUM(total), 0) AS revenue,
            COALESCE(AVG(total), 0) AS avg_basket,
            COALESCE(SUM(discount), 0) AS discounts,
            COALESCE(SUM(units), 0) AS units_sold
     FROM (
       SELECT s.total, s.discount,
              (SELECT COALESCE(SUM(si.quantity), 0) FROM sale_items si WHERE si.sale_id = s.id) AS units
       FROM sales s
       WHERE ($1::date IS NULL OR s.sale_date >= $1)
         AND ($2::date IS NULL OR s.sale_date <= $2)
     ) t`,
    [from || null, to || null]
  );
  return rows[0];
}
