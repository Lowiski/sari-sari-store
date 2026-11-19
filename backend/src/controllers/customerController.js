import * as CustomerModel from '../models/Customer.js';
import { parsePagination } from '../middleware/validateMiddleware.js';
import { ok } from '../utils/asyncHandler.js';

export async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const result = await CustomerModel.list({
    search: req.query.search,
    type: req.query.type,
    limit,
    offset,
  });
  return ok(res, { ...result, page, limit, pages: Math.ceil(result.total / limit) });
}

export async function getOne(req, res) {
  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
  return ok(res, customer);
}

export async function create(req, res) {
  return ok(res, await CustomerModel.create(req.body), 'Customer created.', 201);
}

export async function update(req, res) {
  const customer = await CustomerModel.update(req.params.id, req.body);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
  return ok(res, customer, 'Customer updated.');
}

export async function remove(req, res) {
  const deleted = await CustomerModel.remove(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Customer not found.' });
  return ok(res, null, 'Customer deleted.');
}

export async function summary(req, res) {
  return ok(res, await CustomerModel.summary());
}
