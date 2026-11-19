import { query } from '../config/database.js';

export async function list() {
  const { rows } = await query('SELECT * FROM v_campaign_performance ORDER BY roas DESC, campaign_id');
  return rows;
}

export async function raw() {
  const { rows } = await query(
    'SELECT id, name, channel, start_date, end_date, budget, impressions, clicks, conversions, revenue FROM marketing_campaigns ORDER BY id'
  );
  return rows;
}

export async function byChannel() {
  const { rows } = await query(
    `SELECT channel,
            COUNT(*)::int AS campaigns,
            SUM(budget) AS spend,
            SUM(impressions)::int AS impressions,
            SUM(clicks)::int AS clicks,
            SUM(conversions)::int AS conversions,
            SUM(revenue) AS revenue,
            CASE WHEN SUM(budget) > 0 THEN ROUND(SUM(revenue) / SUM(budget), 2) ELSE 0 END AS roas
     FROM marketing_campaigns GROUP BY channel ORDER BY roas DESC`
  );
  return rows;
}
