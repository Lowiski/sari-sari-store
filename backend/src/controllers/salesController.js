import * as SaleModel from '../models/Sale.js';
import { createSale } from '../services/salesService.js';
import { parsePagination } from '../middleware/validateMiddleware.js';
import { ok } from '../utils/asyncHandler.js';

export async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await SaleModel.list({
    from: req.query.from,
    to: req.query.to,
    customerId: req.query.customerId,
    search: req.query.search,
    limit,
    offset,
  });
  return ok(res, { ...result, page, limit, pages: Math.ceil(result.total / limit) });
}

export async function getOne(req, res) {
  const sale = await SaleModel.findById(req.params.id);
  if (!sale) return res.status(404).json({ success: false, message: 'Sale not found.' });
  return ok(res, sale);
}

export async function create(req, res) {
  const sale = await createSale(req.body);
  return ok(res, sale, 'Sale recorded and inventory updated.', 201);
}

export async function summary(req, res) {
  return ok(res, await SaleModel.summary({ from: req.query.from, to: req.query.to }));
}

export async function nextInvoice(req, res) {
  return ok(res, { invoiceNo: await SaleModel.nextInvoiceNumber() });
}
