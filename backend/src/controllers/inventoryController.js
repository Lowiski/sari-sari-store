import * as InventoryModel from '../models/InventoryTransaction.js';
import { stockIn, stockOut } from '../services/inventoryService.js';
import { parsePagination } from '../middleware/validateMiddleware.js';
import { ok } from '../utils/asyncHandler.js';

export async function stock(req, res) {
  return ok(res, await InventoryModel.stock());
}

export async function transactions(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await InventoryModel.transactions({
    productId: req.query.productId,
    type: req.query.type,
    from: req.query.from,
    to: req.query.to,
    limit,
    offset,
  });
  return ok(res, { ...result, page, limit, pages: Math.ceil(result.total / limit) });
}

export async function inbound(req, res) {
  return ok(res, await stockIn(req.body), 'Stock-in recorded.', 201);
}

export async function outbound(req, res) {
  return ok(res, await stockOut(req.body), 'Stock-out recorded.', 201);
}

export async function alerts(req, res) {
  return ok(res, await InventoryModel.alerts());
}

export async function valuation(req, res) {
  return ok(res, await InventoryModel.valuation());
}
