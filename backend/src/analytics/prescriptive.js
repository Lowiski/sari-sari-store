import { runDescriptive } from './descriptive.js';
import { runPredictive } from './predictive.js';

const n = (value) => Number(value || 0);
const round2 = (value) => Math.round(n(value) * 100) / 100;

const SUPPLIER_HINT = {
  Beverages: 'Distributor - Coca-Cola / San Miguel',
  'Instant Noodles': 'Distributor - Indomie / Lucky Me',
  Snacks: 'Wholesaler - Rebisco / Jack n Jill',
  'Canned Goods': 'Distributor - San Miguel / Century Tuna',
  'Household & Personal Care': 'General merchandise wholesaler',
  'Tobacco & Miscellaneous': 'Tobacco wholesaler',
};

/**
 * PRESCRIPTIVE ANALYTICS — "What should we do?"
 * Consumes BOTH previous steps: descriptive facts and predictive risks are
 * converted into concrete, prioritised business actions.
 */
export async function runPrescriptive({ horizon = 7 } = {}) {
  const [descriptive, predictive] = await Promise.all([
    runDescriptive({}),
    runPredictive({ horizon }),
  ]);

  // 1. Restock plan: cover 21 days of forecast demand minus current stock.
  const targetCoverDays = 21;
  const restock = predictive.productRisks
    .filter((p) => p.daysCover < targetCoverDays)
    .map((p) => {
      const needed = Math.max(0, Math.ceil(p.avgDailyDemand * targetCoverDays - p.stockOnHand));
      const urgency =
        p.risk === 'OUT OF STOCK' || p.daysCover <= 3 ? 'CRITICAL'
          : p.daysCover <= 7 ? 'HIGH'
            : 'MEDIUM';
      const estimatedCost = round2(needed * estimateCost(descriptive, p.productId));
      return {
        productId: p.productId,
        product: p.name,
        sku: p.sku,
        currentStock: p.stockOnHand,
        avgDailyDemand: p.avgDailyDemand,
        daysCover: p.daysCover,
        recommendedOrder: needed,
        urgency,
        estimatedCost,
        supplier: SUPPLIER_HINT[p.category] || 'Local wholesaler',
        action: `Order ${needed} units within ${urgency === 'CRITICAL' ? '24 hours' : '3 days'}.`,
      };
    })
    .sort((a, b) => a.daysCover - b.daysCover);

  // 2. Markdown plan for slow movers that are tying up capital.
  const soldMap = new Map(
    descriptive.topProducts.map((p) => [p.productId, p.unitsSold])
  );
  const medianUnits = median(descriptive.topProducts.map((p) => p.unitsSold)) || 1;
  const markdown = predictive.productRisks
    .filter((p) => p.unitsSold30 < medianUnits * 0.25 && p.stockOnHand > 15)
    .slice(0, 8)
    .map((p) => ({
      productId: p.productId,
      product: p.name,
      stockOnHand: p.stockOnHand,
      unitsSold30: p.unitsSold30,
      suggestedDiscountPct: 15,
      reason: 'Low velocity with excess stock; bundle with a fast mover.',
      pairedWith: descriptive.topProducts[0]?.name || null,
    }));

  // 3. Marketing reallocation using ROAS from descriptive analytics.
  const channels = descriptive.marketing.channels;
  const totalBudget = channels.reduce((sum, c) => sum + c.spend, 0);
  const totalRoas = channels.reduce((sum, c) => sum + c.roas, 0) || 1;
  const marketing = channels.map((c) => {
    const weight = c.roas / totalRoas;
    const suggestedBudget = round2(totalBudget * weight);
    return {
      channel: c.channel,
      currentSpend: round2(c.spend),
      roas: c.roas,
      suggestedBudget,
      changePct: c.spend > 0 ? round2(((suggestedBudget - c.spend) / c.spend) * 100) : 0,
      expectedRevenue: round2(suggestedBudget * c.roas),
      decision: c.roas >= 3 ? 'INCREASE' : c.roas < 1.5 ? 'REDUCE' : 'MAINTAIN',
    };
  });

  // 4. Promotional targeting from predictive churn scores.
  const promotions = predictive.churnRisk.slice(0, 10).map((c) => ({
    customerId: c.customerId,
    customer: c.name,
    risk: c.risk,
    daysSinceLastPurchase: c.daysSinceLastPurchase,
    offer: c.lifetimeSpend > 1500 ? '10% off next purchase + free item' : 'Buy 2 take 1 promo via SMS',
    channel: 'SMS / Messenger',
    expectedLift: c.risk === 'HIGH' ? 'High' : 'Medium',
  }));

  const critical = restock.filter((r) => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');
  const actions = [
    ...critical.slice(0, 5).map((r) => ({
      priority: 'P1', type: 'RESTOCK', message: r.action,
      impact: `Avoid lost sales on ${r.product}`,
    })),
    ...marketing.filter((m) => m.decision === 'INCREASE').slice(0, 3).map((m) => ({
      priority: 'P2', type: 'MARKETING',
      message: `Increase ${m.channel} budget to PHP ${m.suggestedBudget}.`,
      impact: `Projected PHP ${m.expectedRevenue} revenue`,
    })),
    ...markdown.slice(0, 3).map((m) => ({
      priority: 'P3', type: 'MARKDOWN',
      message: `Apply ${m.suggestedDiscountPct}% discount to ${m.product}.`,
      impact: 'Frees working capital and storage space',
    })),
  ];

  return {
    chain: {
      descriptiveInput: {
        revenue: descriptive.kpis.totalRevenue,
        topProduct: descriptive.topProducts[0]?.name || null,
        bestChannel: descriptive.marketing.channels[0]?.channel || null,
      },
      predictiveInput: {
        forecastRevenue: predictive.totalForecastRevenue,
        atRiskProducts: predictive.productRisks.filter((p) => p.risk !== 'LOW').length,
        churnCustomers: predictive.churnRisk.length,
      },
      decisionOutput: {
        restockOrders: restock.length,
        markdowns: markdown.length,
        channelDecisions: marketing.length,
        promos: promotions.length,
      },
    },
    restock,
    markdown,
    marketing,
    promotions,
    priorityActions: actions,
    summary: {
      totalRecommendedOrderCost: round2(restock.reduce((s, r) => s + r.estimatedCost, 0)),
      estimatedMarketingRevenue: round2(
        marketing.filter((m) => m.decision === 'INCREASE').reduce((s, m) => s + m.expectedRevenue, 0)
      ),
    },
    insights: [
      `${restock.length} restock orders recommended, costing about PHP ${round2(restock.reduce((s, r) => s + r.estimatedCost, 0))}.`,
      `${marketing.filter((m) => m.decision === 'INCREASE').length} marketing channel(s) should receive more budget.`,
      `${promotions.length} customers should receive a retention promo this week.`,
    ],
  };
}

function estimateCost(descriptive, productId) {
  // Fallback average margin-based cost if product-level cost is unavailable.
  const revenue = n(descriptive.kpis.totalRevenue) || 1;
  const units = n(descriptive.kpis.unitsSold) || 1;
  return (revenue / units) * 0.65;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
