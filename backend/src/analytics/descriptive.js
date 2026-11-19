import * as SaleModel from '../models/Sale.js';
import * as SaleItemModel from '../models/SaleItem.js';
import * as CustomerModel from '../models/Customer.js';
import * as InventoryModel from '../models/InventoryTransaction.js';
import * as CampaignModel from '../models/MarketingCampaign.js';

const n = (value) => Number(value || 0);

/**
 * DESCRIPTIVE ANALYTICS — "What happened?"
 * Aggregates raw transactional data into KPIs and distributions.
 * Its outputs become the inputs of the predictive step.
 */
export async function runDescriptive({ from = null, to = null } = {}) {
  const [summary, daily, byProduct, customers, stock, channels, campaigns] = await Promise.all([
    SaleModel.summary({ from, to }),
    SaleItemModel.dailyTrend(90),
    SaleItemModel.byProduct({ from, to }),
    CustomerModel.summary(),
    InventoryModel.stock(),
    CampaignModel.byChannel(),
    CampaignModel.list(),
  ]);

  // Category revenue mix (derived from product-level sales)
  const categoryMap = new Map();
  for (const row of byProduct) {
    const current = categoryMap.get(row.category_name) || {
      category: row.category_name, revenue: 0, units: 0, products: 0,
    };
    current.revenue += n(row.revenue);
    current.units += n(row.units_sold);
    current.products += 1;
    categoryMap.set(row.category_name, current);
  }
  const categoryMix = [...categoryMap.values()]
    .map((item) => ({ ...item, revenue: round2(item.revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((item) => ({
      ...item,
      sharePct: summary.revenue > 0 ? round2((item.revenue / n(summary.revenue)) * 100) : 0,
    }));

  // Customer segmentation by account type
  const segmentMap = new Map();
  for (const row of customers) {
    const key = row.customer_type || 'walk-in';
    const current = segmentMap.get(key) || { segment: key, customers: 0, orders: 0, spend: 0 };
    current.customers += 1;
    current.orders += n(row.total_orders);
    current.spend += n(row.total_spend);
    segmentMap.set(key, current);
  }
  const customerSegments = [...segmentMap.values()]
    .map((item) => ({ ...item, spend: round2(item.spend) }))
    .sort((a, b) => b.spend - a.spend);

  const inventoryStatus = stock.reduce(
    (acc, row) => {
      if (row.stock_status === 'OUT OF STOCK') acc.outOfStock += 1;
      else if (row.stock_status === 'LOW STOCK') acc.lowStock += 1;
      else acc.inStock += 1;
      acc.stockValue += n(row.stock_value);
      return acc;
    },
    { inStock: 0, lowStock: 0, outOfStock: 0, stockValue: 0 }
  );
  inventoryStatus.stockValue = round2(inventoryStatus.stockValue);

  const topProducts = byProduct.slice(0, 10).map((row) => ({
    productId: row.product_id,
    name: row.product_name,
    category: row.category_name,
    unitsSold: n(row.units_sold),
    revenue: round2(row.revenue),
    timesSold: n(row.times_sold),
  }));

  const insights = [];
  if (topProducts[0]) {
    insights.push(`${topProducts[0].name} is the top revenue driver at PHP ${topProducts[0].revenue}.`);
  }
  if (inventoryStatus.lowStock + inventoryStatus.outOfStock > 0) {
    insights.push(
      `${inventoryStatus.lowStock + inventoryStatus.outOfStock} products need restocking attention.`
    );
  }
  if (channels[0]) {
    insights.push(
      `${channels[0].channel} gives the best return with ${channels[0].roas}x ROAS on marketing spend.`
    );
  }

  return {
    period: { from: from || 'all', to: to || 'all' },
    kpis: {
      totalRevenue: round2(summary.revenue),
      totalOrders: n(summary.orders),
      averageBasket: round2(summary.avg_basket),
      unitsSold: n(summary.units_sold),
      totalDiscounts: round2(summary.discounts),
      activeCustomers: customers.filter((c) => n(c.total_orders) > 0).length,
      totalCustomers: customers.length,
    },
    dailySales: daily.map((d) => ({
      date: d.date, orders: d.orders, revenue: round2(d.revenue), units: d.units,
    })),
    topProducts,
    categoryMix,
    customerSegments,
    inventoryStatus,
    marketing: {
      channels: channels.map((c) => ({
        channel: c.channel, spend: round2(c.spend), revenue: round2(c.revenue),
        conversions: n(c.conversions), roas: n(c.roas),
      })),
      campaigns: campaigns.slice(0, 12).map((c) => ({
        name: c.name, channel: c.channel, roas: n(c.roas), ctrPct: n(c.ctr_pct),
        revenue: round2(c.revenue),
      })),
    },
    insights,
  };
}

function round2(value) {
  return Math.round(n(value) * 100) / 100;
}
