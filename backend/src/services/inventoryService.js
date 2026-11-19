import { query } from '../config/database.js';
import { ValidationError } from './salesService.js';

export async function stockIn({ productId, quantity, reference, txnDate, note }) {
  assertProduct(productId);
  assertQuantity(quantity);
  const { rows } = await query(
    `INSERT INTO inventory_transactions (product_id, txn_type, quantity, reference, txn_date, note)
     VALUES ($1, 'IN', $2, $3, $4, $5) RETURNING *`,
    [productId, quantity, reference || 'STOCK-IN', txnDate || new Date().toISOString().slice(0, 10), note || null]
  );
  return rows[0];
}

export async function stockOut({ productId, quantity, reference, txnDate, note }) {
  assertProduct(productId);
  assertQuantity(quantity);
  const { rows } = await query(
    `SELECT COALESCE(SUM(CASE txn_type WHEN 'IN' THEN quantity ELSE -quantity END), 0) AS stock
     FROM inventory_transactions WHERE product_id = $1`,
    [productId]
  );
  if (Number(rows[0].stock) < quantity) {
    throw new ValidationError('Stock-out quantity exceeds available stock.', 409);
  }
  const result = await query(
    `INSERT INTO inventory_transactions (product_id, txn_type, quantity, reference, txn_date, note)
     VALUES ($1, 'OUT', $2, $3, $4, $5) RETURNING *`,
    [productId, quantity, reference || 'STOCK-OUT', txnDate || new Date().toISOString().slice(0, 10), note || null]
  );
  return result.rows[0];
}

function assertProduct(id) {
  if (!id || Number.isNaN(Number(id))) throw new ValidationError('A valid product is required.');
}

function assertQuantity(quantity) {
  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
    throw new ValidationError('Quantity must be greater than zero.');
  }
}
