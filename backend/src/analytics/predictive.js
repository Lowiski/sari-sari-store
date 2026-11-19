import * as SaleItemModel from '../models/SaleItem.js';
import * as CustomerModel from '../models/Customer.js';
import * as SaleModel from '../models/Sale.js';
import * as ProductModel from '../models/Product.js';

const n = (value) => Number(value || 0);
const round2 = (value) => Math.round(n(value) * 100) / 100;

/**
 * PREDICTIVE ANALYTICS — "What is likely to happen?"
 * Uses the descriptive outputs (daily sales history, product velocity,
 * customer recency) to build forecasts and risk scores.
 */
export async function runPredictive({ horizon = 7 } = {}) {
  // Product velocity is measured over a rolling 30-day window so that
  // "units sold per day" and "days of cover" are realistic.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [history, productRows, customers, summary] = await Promise.all([
    SaleItemModel.dailyTrend(90),
    SaleItemModel.byProduct({ from: thirtyDaysAgo, to: null }),
    CustomerModel.summary(),
    SaleModel.summary({}),
  ]);

  const series = buildContinuousSeries(history);
  const values = series.map((d) => d.revenue);
  const recent = values.slice(-30);
  const ma3 = movingAverage(values, 3);
  const ma7 = movingAverage(values, 7);
  const regression = linearForecast(recent, horizon);
  const weekdayIndex = seasonality(series);

  // Use UTC dates throughout so a 'YYYY-MM-DD' string never shifts a day
  // when the server runs in a timezone such as Asia/Manila (UTC+8).
  const lastDate = new Date(`${series[series.length - 1].date}T00:00:00Z`);
  const forecast = [];
  for (let step = 1; step <= horizon; step += 1) {
    const day = new Date(lastDate);
    day.setUTCDate(day.getUTCDate() + step);
    const key = day.toISOString().slice(0, 10);
    const season = weekdayIndex[day.getUTCDay()] || 1;
    const blended =
      0.5 * regression.values[step - 1] +
      0.3 * ma7[ma7.length - 1] +
      0.2 * (average(recent) * season);
    const point = Math.max(0, round2(blended));
    forecast.push({
      date: key,
      weekday: day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      predictedRevenue: point,
      lower: round2(point * 0.85),
      upper: round2(point * 1.15),
      method: 'trend + 7-day MA + weekday index',
    });
  }

  // Product-level demand and stockout risk (needs current stock levels)
  const products = await ProductModel.allForAnalytics();
  const velocityMap = new Map(
    productRows.map((row) => [Number(row.product_id), n(row.units_sold)])
  );
  const productRisks = products
    .map((product) => {
      const units30 = velocityMap.get(Number(product.id)) || 0;
      const avgDailyDemand = units30 / 30;
      const stock = n(product.stock_on_hand);
      const daysCover = avgDailyDemand > 0 ? stock / avgDailyDemand : 999;
      let risk = 'LOW';
      if (stock === 0) risk = 'OUT OF STOCK';
      else if (daysCover <= 7) risk = 'HIGH';
      else if (daysCover <= 14) risk = 'MEDIUM';
      return {
        productId: Number(product.id),
        name: product.name,
        sku: product.sku,
        category: product.category_name,
        unitsSold30: Math.round(units30),
        avgDailyDemand: round2(avgDailyDemand),
        stockOnHand: stock,
        daysCover: Math.round(daysCover),
        risk,
      };
    })
    .filter((row) => row.unitsSold30 > 0 || row.stockOnHand <= Number(productReorder(products, row.productId)))
    .sort((a, b) => a.daysCover - b.daysCover);

  // Customers whose last purchase is far in the past are churn risks.
  const churnRisk = customers
    .filter((c) => n(c.total_orders) >= 2)
    .map((c) => {
      const daysSince = c.last_purchase
        ? Math.floor((Date.now() - new Date(c.last_purchase).getTime()) / 86400000)
        : 999;
      return {
        customerId: Number(c.id),
        name: c.name,
        daysSinceLastPurchase: daysSince,
        totalOrders: n(c.total_orders),
        lifetimeSpend: round2(c.total_spend),
        risk: daysSince > 45 ? 'HIGH' : daysSince > 25 ? 'MEDIUM' : 'LOW',
      };
    })
    .filter((c) => c.risk !== 'LOW')
    .sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase)
    .slice(0, 20);

  return {
    model: {
      name: 'Blended linear trend + moving average + weekday seasonality',
      trainedOnDays: series.length,
      horizonDays: horizon,
      lastObservedRevenue: round2(values[values.length - 1] || 0),
      averageDailyRevenue: round2(average(recent)),
      trendSlope: round2(regression.slope),
      movingAverage3: round2(ma3[ma3.length - 1] || 0),
      movingAverage7: round2(ma7[ma7.length - 1] || 0),
    },
    forecast,
    weekdayIndex: Object.fromEntries(
      Object.entries(weekdayIndex).map(([k, v]) => [k, round2(v)])
    ),
    productRisks,
    churnRisk,
    totalForecastRevenue: round2(forecast.reduce((sum, f) => sum + f.predictedRevenue, 0)),
    currentRunRateRevenue: round2(n(summary.revenue)),
    insights: [
      `Predicted revenue for the next ${horizon} days: PHP ${round2(forecast.reduce((s, f) => s + f.predictedRevenue, 0))}.`,
      `${productRisks.filter((p) => p.risk === 'HIGH' || p.risk === 'OUT OF STOCK').length} products are likely to stock out within a week.`,
      `${churnRisk.length} repeat customers show churn warning signs.`,
    ],
  };
}

function productReorder(products, id) {
  const found = products.find((p) => Number(p.id) === Number(id));
  return found ? found.reorder_level : 10;
}

function buildContinuousSeries(history) {
  if (!history.length) {
    return [{ date: new Date().toISOString().slice(0, 10), revenue: 0, orders: 0, units: 0 }];
  }
  const byDate = new Map(history.map((row) => [row.date, row]));
  const start = new Date(`${history[0].date}T00:00:00Z`);
  const end = new Date(`${history[history.length - 1].date}T00:00:00Z`);
  const out = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const found = byDate.get(key);
    out.push({
      date: key,
      revenue: n(found?.revenue),
      orders: n(found?.orders),
      units: n(found?.units),
    });
  }
  return out;
}

function movingAverage(values, window) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return average(slice);
  });
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + n(v), 0) / values.length;
}

/** Ordinary least squares y = a + b*x, then predict x = length + step. */
function linearForecast(values, horizon) {
  const len = values.length;
  if (len === 0) return { slope: 0, values: Array(horizon).fill(0) };
  const meanX = (len - 1) / 2;
  const meanY = average(values);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < len; i += 1) {
    numerator += (i - meanX) * (values[i] - meanY);
    denominator += (i - meanX) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  const predictions = [];
  for (let step = 1; step <= horizon; step += 1) {
    predictions.push(Math.max(0, intercept + slope * (len + step - 1)));
  }
  return { slope, values: predictions };
}

function seasonality(series) {
  const totals = Array(7).fill(0);
  const counts = Array(7).fill(0);
  for (const row of series) {
    const day = new Date(`${row.date}T00:00:00Z`).getUTCDay();
    totals[day] += n(row.revenue);
    counts[day] += 1;
  }
  const overall = average(series.map((r) => r.revenue)) || 1;
  return totals.map((total, day) => (counts[day] ? total / counts[day] / overall : 1));
}
