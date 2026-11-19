import { query } from '../config/database.js';
import * as SaleModel from '../models/Sale.js';
import * as SaleItemModel from '../models/SaleItem.js';
import * as InventoryModel from '../models/InventoryTransaction.js';
import { ok } from '../utils/asyncHandler.js';

export async function sales(req, res) {
  // Empty query strings from the date filters must become SQL NULL.
  const from = req.query.from || null;
  const to = req.query.to || null;
  const [summary, daily, products] = await Promise.all([
    SaleModel.summary({ from, to }),
    query(
      `SELECT sale_date::text AS date, COUNT(*)::int AS orders,
              COALESCE(SUM(total), 0) AS revenue, COALESCE(SUM(discount), 0) AS discounts
       FROM sales
       WHERE ($1::date IS NULL OR sale_date >= $1) AND ($2::date IS NULL OR sale_date <= $2)
       GROUP BY sale_date ORDER BY sale_date`,
      [from, to]
    ),
    SaleItemModel.byProduct({ from, to }),
  ]);
  return ok(res, {
    period: { from: from || 'all', to: to || 'all' },
    summary,
    daily: daily.rows,
    products,
    generatedAt: new Date().toISOString(),
  });
}

export async function inventory(req, res) {
  const from = req.query.from || null;
  const to = req.query.to || null;
  const [stock, valuation, movements] = await Promise.all([
    InventoryModel.stock(),
    InventoryModel.valuation(),
    query(
      `SELECT it.txn_date::text AS date, it.txn_type, COUNT(*)::int AS transactions,
              SUM(it.quantity)::int AS units
       FROM inventory_transactions it
       WHERE ($1::date IS NULL OR it.txn_date >= $1) AND ($2::date IS NULL OR it.txn_date <= $2)
       GROUP BY it.txn_date, it.txn_type ORDER BY it.txn_date DESC`,
      [from, to]
    ),
  ]);
  return ok(res, {
    stock,
    valuation,
    movements: movements.rows,
    generatedAt: new Date().toISOString(),
  });
}
