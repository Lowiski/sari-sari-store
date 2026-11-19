import * as ProductModel from '../models/Product.js';
import { parsePagination } from '../middleware/validateMiddleware.js';
import { ok } from '../utils/asyncHandler.js';

export async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await ProductModel.list({
    search: req.query.search,
    categoryId: req.query.categoryId,
    lowStock: req.query.lowStock === 'true',
    limit,
    offset,
  });
  return ok(res, { ...result, page, limit, pages: Math.ceil(result.total / limit) });
}

export async function getOne(req, res) {
  const product = await ProductModel.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  return ok(res, product);
}

export async function create(req, res) {
  const product = await ProductModel.create({
    sku: req.body.sku,
    name: req.body.name,
    categoryId: req.body.categoryId,
    unit: req.body.unit,
    price: req.body.price,
    cost: req.body.cost,
    reorderLevel: req.body.reorderLevel,
  });
  return ok(res, product, 'Product created.', 201);
}

export async function update(req, res) {
  const product = await ProductModel.update(req.params.id, req.body);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  return ok(res, product, 'Product updated.');
}

export async function remove(req, res) {
  const deleted = await ProductModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Product not found.' });
  return ok(res, null, 'Product deleted.');
}

export async function categories(req, res) {
  return ok(res, await ProductModel.categories());
}
