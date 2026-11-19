-- =====================================================================
-- SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM
-- views.sql
-- Analytics views consumed by the backend / dashboards.
-- Run AFTER schema.sql and seed.sql. Safe to re-run: CREATE OR REPLACE.
-- =====================================================================

-- Stock on hand is derived as SUM(IN quantity) - SUM(OUT quantity).
-- stock_value uses cost; v_inventory_valuation also shows retail value.
CREATE OR REPLACE VIEW v_product_stock AS
WITH stock AS (
    SELECT
        product_id,
        COALESCE(SUM(CASE txn_type WHEN 'IN' THEN quantity ELSE -quantity END), 0) AS on_hand
    FROM inventory_transactions
    GROUP BY product_id
)
SELECT
    p.id                                             AS product_id,
    p.sku,
    p.name                                           AS product_name,
    c.name                                           AS category_name,
    p.unit,
    p.price,
    p.cost,
    COALESCE(s.on_hand, 0)                           AS stock_on_hand,
    p.reorder_level,
    ROUND(COALESCE(s.on_hand, 0)::numeric * p.cost, 2) AS stock_value,
    CASE
        WHEN COALESCE(s.on_hand, 0) <= 0              THEN 'OUT OF STOCK'
        WHEN COALESCE(s.on_hand, 0) < p.reorder_level THEN 'LOW STOCK'
        ELSE 'IN STOCK'
    END                                              AS stock_status
FROM products p
JOIN categories c ON c.id = p.category_id
LEFT JOIN stock s ON s.product_id = p.id;

-- Daily sales. Item sums and order sums are aggregated separately so a
-- multi-line sale is not double-counted in orders/discounts/net_sales.
-- gross_sales = SUM(line_total); net_sales = SUM(sales.total) after discount.
CREATE OR REPLACE VIEW v_daily_sales AS
WITH daily_orders AS (
    SELECT
        sale_date,
        COUNT(*)      AS orders,
        SUM(discount) AS discounts,
        SUM(total)    AS net_sales
    FROM sales
    GROUP BY sale_date
),
daily_items AS (
    SELECT
        s.sale_date,
        SUM(si.quantity)   AS units_sold,
        SUM(si.line_total) AS gross_sales
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    GROUP BY s.sale_date
)
SELECT
    o.sale_date,
    o.orders,
    COALESCE(i.units_sold, 0)   AS units_sold,
    COALESCE(i.gross_sales, 0)  AS gross_sales,
    COALESCE(o.discounts, 0)    AS discounts,
    COALESCE(o.net_sales, 0)    AS net_sales
FROM daily_orders o
LEFT JOIN daily_items i ON i.sale_date = o.sale_date
ORDER BY o.sale_date;

-- Per-customer purchase behaviour, including customers with no orders.
CREATE OR REPLACE VIEW v_customer_summary AS
SELECT
    c.id                          AS customer_id,
    c.name,
    c.customer_type,
    COUNT(s.id)                   AS total_orders,
    COALESCE(SUM(s.total), 0)     AS total_spend,
    COALESCE(ROUND(AVG(s.total), 2), 0) AS avg_spend,
    MAX(s.sale_date)              AS last_purchase
FROM customers c
LEFT JOIN sales s ON s.customer_id = c.id
GROUP BY c.id, c.name, c.customer_type
ORDER BY total_spend DESC;

-- Inventory value roll-up by category, built on v_product_stock.
CREATE OR REPLACE VIEW v_inventory_valuation AS
SELECT
    category_name,
    COUNT(*)                                       AS products,
    SUM(stock_on_hand)                             AS total_units,
    ROUND(SUM(stock_value), 2)                     AS total_cost_value,
    ROUND(SUM(stock_on_hand::numeric * price), 2)  AS total_retail_value
FROM v_product_stock
GROUP BY category_name
ORDER BY total_retail_value DESC;

-- Campaign efficiency: CTR, conversion rate and return on ad spend.
-- NULLIF guards against divide-by-zero if counters are ever zero.
CREATE OR REPLACE VIEW v_campaign_performance AS
SELECT
    id                                                  AS campaign_id,
    name,
    channel,
    budget                                              AS spend,
    impressions,
    clicks,
    conversions,
    revenue,
    ROUND(clicks::numeric / NULLIF(impressions, 0) * 100, 2)      AS ctr_pct,
    ROUND(conversions::numeric / NULLIF(clicks, 0) * 100, 2)      AS conversion_pct,
    ROUND(revenue / NULLIF(budget, 0), 2)                          AS roas
FROM marketing_campaigns
ORDER BY revenue DESC;
