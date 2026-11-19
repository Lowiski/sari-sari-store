import { runDescriptive } from '../analytics/descriptive.js';
import { runPredictive } from '../analytics/predictive.js';
import { runPrescriptive } from '../analytics/prescriptive.js';

export async function descriptive(params) {
  return runDescriptive(params);
}

export async function predictive(params) {
  return runPredictive(params);
}

export async function prescriptive(params) {
  return runPrescriptive(params);
}

/** One call powers the dashboard and demonstrates the BA chain visually. */
export async function overview(params) {
  const [descriptiveResult, predictiveResult, prescriptiveResult] = await Promise.all([
    runDescriptive(params),
    runPredictive(params),
    runPrescriptive(params),
  ]);

  return {
    descriptive: descriptiveResult,
    predictive: predictiveResult,
    prescriptive: prescriptiveResult,
    baChain: [
      {
        step: 1,
        stage: 'Descriptive',
        question: 'What happened?',
        evidence: `Revenue PHP ${descriptiveResult.kpis.totalRevenue} across ${descriptiveResult.kpis.totalOrders} orders.`,
        output: 'KPIs, trends, top products, channel ROAS',
        feeds: 'Historical series and segment facts feed the forecast models.',
      },
      {
        step: 2,
        stage: 'Predictive',
        question: 'What will happen?',
        evidence: `Next 7 days forecast PHP ${predictiveResult.totalForecastRevenue}.`,
        output: 'Sales forecast, demand velocity, stockout and churn risk',
        feeds: 'Risk scores feed the decision rules in the prescriptive step.',
      },
      {
        step: 3,
        stage: 'Prescriptive',
        question: 'What should we do?',
        evidence: `${prescriptiveResult.restock.length} restock orders and ${prescriptiveResult.promotions.length} promos generated.`,
        output: 'Prioritised restock, markdown, marketing and retention actions',
        feeds: 'Actions are executed by staff through the POS and inventory modules.',
      },
    ],
  };
}
