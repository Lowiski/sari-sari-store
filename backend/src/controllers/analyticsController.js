import * as AnalyticsService from '../services/analyticsService.js';
import * as CampaignModel from '../models/MarketingCampaign.js';
import { ok } from '../utils/asyncHandler.js';

const withPeriod = (req) => ({ from: req.query.from || null, to: req.query.to || null });

export async function descriptive(req, res) {
  return ok(res, await AnalyticsService.descriptive(withPeriod(req)));
}

export async function predictive(req, res) {
  const horizon = Math.min(30, Math.max(1, Number(req.query.horizon) || 7));
  return ok(res, await AnalyticsService.predictive({ horizon }));
}

export async function prescriptive(req, res) {
  const horizon = Math.min(30, Math.max(1, Number(req.query.horizon) || 7));
  return ok(res, await AnalyticsService.prescriptive({ horizon }));
}

export async function overview(req, res) {
  const horizon = Math.min(30, Math.max(1, Number(req.query.horizon) || 7));
  return ok(res, await AnalyticsService.overview({ horizon, ...withPeriod(req) }));
}

export async function marketing(req, res) {
  const [campaigns, channels] = await Promise.all([
    CampaignModel.list(),
    CampaignModel.byChannel(),
  ]);
  return ok(res, { campaigns, channels });
}
