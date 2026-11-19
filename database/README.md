# SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM — Database

PostgreSQL (Neon serverless) schema, deterministic demo data and analytics views.
Only core PostgreSQL features are used (no extensions).

## Files

| File | Purpose |
| --- | --- |
| `schema.sql` | Drops existing tables (dependency-safe) and creates the 8 tables plus indexes. |
| `seed.sql` | Loads the admin user, 6 categories and 60 products / 60 customers / 180 sales / 300 sale items / 300 inventory transactions / 60 campaigns. |
| `views.sql` | Creates the 5 analytics views used by the backend and dashboards. |

## How to run

Always run in this order: **schema.sql → seed.sql → views.sql**.

### Neon SQL Editor

1. Open your Neon project and select the database (e.g. `neondb`).
2. Open SQL Editor, paste the entire contents of `schema.sql`, and run it.
3. Repeat for `seed.sql`, then `views.sql`.
4. Run the verification queries below.

Each script can be pasted as a whole; `seed.sql` is wrapped in `BEGIN; ... COMMIT;`.

### psql

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
psql "$DATABASE_URL" -f database/views.sql
```

On Windows PowerShell, quote the URL variable normally:

```powershell
psql $env:DATABASE_URL -f database/schema.sql
psql $env:DATABASE_URL -f database/seed.sql
psql $env:DATABASE_URL -f database/views.sql
```

Use the **pooled or direct Neon connection string with SSL** (Neon URLs already
include `sslmode=require`). Run from the project root, or use absolute paths.

## Verification

Row counts (minimums your backend can rely on):

```sql
SELECT 'users' AS table_name, COUNT(*) AS rows FROM users
UNION ALL SELECT 'categories',           COUNT(*) FROM categories
UNION ALL SELECT 'products',             COUNT(*) FROM products
UNION ALL SELECT 'customers',            COUNT(*) FROM customers
UNION ALL SELECT 'sales',                COUNT(*) FROM sales
UNION ALL SELECT 'sale_items',           COUNT(*) FROM sale_items
UNION ALL SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions
UNION ALL SELECT 'marketing_campaigns',  COUNT(*) FROM marketing_campaigns
ORDER BY table_name;
```

Expected:

| Table | Exact count |
| --- | --- |
| users | 1 |
| categories | 6 |
| products | 60 |
| customers | 60 |
| sales | 180 |
| sale_items | 300 |
| inventory_transactions | 300 |
| marketing_campaigns | 60 |

Sanity checks (all should return `0`):

```sql
-- Every sales total agrees with its lines.
SELECT COUNT(*) AS mismatched_sales
FROM sales s
WHERE s.subtotal <> COALESCE((SELECT SUM(si.line_total)
                              FROM sale_items si WHERE si.sale_id = s.id), 0)
   OR s.total <> s.subtotal - s.discount;

-- No orphaned lines or stock movements.
SELECT COUNT(*) AS orphans FROM sale_items si
LEFT JOIN sales s ON s.id = si.sale_id WHERE s.id IS NULL;
SELECT COUNT(*) AS orphans FROM inventory_transactions it
LEFT JOIN products p ON p.id = it.product_id WHERE p.id IS NULL;
```

Views smoke test:

```sql
SELECT stock_status, COUNT(*) FROM v_product_stock GROUP BY stock_status;
SELECT MIN(sale_date), MAX(sale_date), SUM(orders), SUM(net_sales) FROM v_daily_sales;
SELECT customer_id, name, total_orders, total_spend FROM v_customer_summary LIMIT 5;
SELECT * FROM v_inventory_valuation;
SELECT channel, ctr_pct, conversion_pct, roas FROM v_campaign_performance LIMIT 5;
```

## Analytics consumers

- Backend queries should read the `v_*` views rather than re-deriving metrics.
  Column names are part of the contract (`product_id`, `stock_on_hand`,
  `stock_status`, `gross_sales`, `net_sales`, `total_spend`, `ctr_pct`, `roas`, ...).
- `v_product_stock` computes on-hand from `inventory_transactions`
  (`IN` adds, `OUT` subtracts). Applications should write an inventory row for
  every stock movement instead of storing a mutable stock column.
- `v_daily_sales` aggregates order rows and item rows separately to avoid
  double-counting orders/discounts on multi-line sales.
- `v_inventory_valuation` depends on `v_product_stock`; recreate `v_product_stock`
  first if rebuilding views manually.
- Dates in the seed are relative to `CURRENT_DATE` (last ~90 days), so charts
  always look current. Re-seeding on a later day shifts the window forward.
- `marketing_campaigns.budget` is exposed as `spend` in
  `v_campaign_performance`; `roas = revenue / budget`, CTR and conversion rate
  are percentages rounded to 2 decimals.

## Resetting data

- **Reload demo data only:** re-run `seed.sql`. It uses
  `TRUNCATE ... RESTART IDENTITY CASCADE` inside a transaction, so all IDs and
  sequences start from 1 again and views remain valid.
- **Full rebuild:** re-run `schema.sql` (this drops the tables and their
  dependent views), then `seed.sql`, then `views.sql`.
- **Wipe everything:** `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` —
  only in a disposable database.

## Assumptions

- Login for the seeded admin is `admin` / `admin123` (bcrypt hash stored verbatim).
- `payment_method`, `customer_type`, `role` and `channel` are plain `VARCHAR`
  columns with no CHECK constraint, so the API may introduce new values freely.
- Currency values are PHP pesos; numeric columns are `NUMERIC` for exact money math.
