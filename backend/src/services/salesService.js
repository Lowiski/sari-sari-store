import { transaction } from '../config/database.js';
import { insertMany } from '../models/SaleItem.js';

export class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Create a sale, its line items and the matching stock-out movements atomically. */
export async function createSale(payload) {
  const { customerId, saleDate, items = [], discount = 0, paymentMethod = 'cash' } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('A sale needs at least one item.');
  }

  const normalised = items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice ?? item.price),
  }));

  if (normalised.some((i) => !i.productId || !Number.isFinite(i.quantity) || i.quantity <= 0)) {
    throw new ValidationError('Every item needs a valid product and quantity.');
  }
  if (normalised.some((i) => !Number.isFinite(i.unitPrice) || i.unitPrice < 0)) {
    throw new ValidationError('Every item needs a valid unit price.');
  }

  return transaction(async (client) => {
    // Lock the affected product rows and verify available stock.
    for (const item of normalised) {
      // Lock the product row first. FOR UPDATE cannot be combined with GROUP BY,
      // so the stock ledger is summed in a separate statement.
      const productResult = await client.query(
        'SELECT name FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );
      if (!productResult.rows.length) {
        throw new ValidationError(`Product ${item.productId} does not exist.`, 404);
      }
      const stockResult = await client.query(
        `SELECT COALESCE(SUM(CASE txn_type WHEN 'IN' THEN quantity ELSE -quantity END), 0) AS stock
         FROM inventory_transactions WHERE product_id = $1`,
        [item.productId]
      );
      if (n(stockResult.rows[0].stock) < item.quantity) {
        throw new ValidationError(`Not enough stock for ${productResult.rows[0].name}.`, 409);
      }
    }

    const subtotal = normalised.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const discountAmount = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const total = subtotal - discountAmount;
    // Use the transaction client for EVERY write so a failed line item or
    // stock movement rolls the whole sale back (no orphan sale records).
    const invoiceResult = await client.query(
      `SELECT 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
              LPAD((COUNT(*) + 1)::text, 4, '0') AS invoice_no
       FROM sales WHERE sale_date = CURRENT_DATE`
    );
    const invoice = invoiceResult.rows[0].invoice_no;

    const saleResult = await client.query(
      `INSERT INTO sales (invoice_no, customer_id, sale_date, subtotal, discount, total, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        invoice,
        customerId || null,
        saleDate || new Date().toISOString().slice(0, 10),
        subtotal,
        discountAmount,
        total,
        paymentMethod,
      ]
    );
    const sale = saleResult.rows[0];

    const createdItems = await insertMany(client, sale.id, normalised);

    for (const item of normalised) {
      await client.query(
        `INSERT INTO inventory_transactions (product_id, txn_type, quantity, reference, txn_date, note)
         VALUES ($1, 'OUT', $2, $3, $4, $5)`,
        [
          item.productId,
          item.quantity,
          invoice,
          sale.sale_date,
          'Automatic stock deduction from POS sale',
        ]
      );
    }

    return { ...sale, items: createdItems };
  });
}

const n = (value) => Number(value || 0);
