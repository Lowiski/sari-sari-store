# Business Analytics Process Overview

## SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM

This document explains the **step-wise connection** between the three analytics layers used in the capstone project: **Descriptive → Predictive → Prescriptive**. Each layer answers a distinct question, consumes specific data, applies a defined method, and produces an output that becomes the input of the next layer. This mirrors how a real sari-sari store owner moves from *knowing* what happened, to *anticipating* what will happen, to *deciding* what to do.

---

## 1. The Three-Layer BA Pipeline

| Step | Analytics layer | Question answered | Input data | Method | Output | How the output feeds the NEXT step |
|---|---|---|---|---|---|---|
| 1 | **Descriptive** | *What happened?* | `sales`, `sale_items`, `products`, `customers`, `inventory_transactions`, `marketing_campaigns` | Aggregation, grouping, ratios, trend charts, Pareto/top-N ranking, ROAS = revenue / budget | Revenue, orders, average basket, units sold, active customers, daily/weekly trend, top products, category mix, inventory status, customer segments, ROAS by channel | The metrics and trends (e.g. declining noodle sales, low stock, weak channel ROAS) become the historical signals and baselines fed into predictive models in Step 2 |
| 2 | **Predictive** | *What is likely to happen?* | Descriptive outputs (trends, top-product volumes, stock levels) plus historical `sales`, `sale_items`, `inventory_transactions`, `customers` | 3-day/7-day moving average, linear regression 7-day forecast, weekday seasonality index, per-product demand forecast, days-of-cover and stockout-risk calculation, churn-risk signal | Forecast sales for next 7 days, expected per-product demand, days of cover, stockout-risk flags, at-risk customer list | Forecast demand and risk flags are compared against reorder levels, cost/margin, and campaign ROAS; these become trigger conditions for prescriptive rules in Step 3 |
| 3 | **Prescriptive** | *What should we do?* | Predictive outputs (demand forecast, stockout risk, churn signal) plus `products.cost/price/reorder_level`, `marketing_campaigns.budget/revenue`, customer segment data | Rule-based decision logic: reorder quantity = target days of cover x forecast daily demand - stock on hand; markdown rule for slow movers; reallocate budget toward high-ROAS channels; target at-risk customers with promos | Reorder quantity and urgency, slow-mover markdown suggestions, marketing budget reallocation, promotional targeting list | Final output is displayed as recommendation cards on the Prescriptive dashboard; the owner executes the action, and the resulting new transactions become fresh descriptive data, restarting the cycle |

**Key connection:** Step 1 produces *evidence*, Step 2 converts evidence into *expectations*, and Step 3 converts expectations into *actions*. Every recommendation can be traced back through the chain to a measured historical fact.

---

## 2. Worked Example Narrative

To illustrate the step-wise flow, consider instant noodles, one of the store's fastest-moving products.

**Step 1 — Descriptive finds the signal.** The Descriptive dashboard shows that noodle sales declined 18% over the last two weeks compared with the previous period, yet noodles still account for 27% of total category revenue. The top-products chart lists noodles second overall, and the inventory-status card shows noodles at 12 units on hand, just above the reorder level of 10. The daily trend also shows that Fridays and Saturdays are consistently higher than weekdays. *Output:* declining-but-important product, low stock buffer, strong weekend pattern.

**Step 2 — Predictive turns the signal into a forecast.** Those descriptive numbers feed the predictive models. The 3-day and 7-day moving averages confirm the recent decline, but the weekday seasonality index (Friday = 1.25, Saturday = 1.35) indicates an upcoming weekend lift. The per-product demand forecast for noodles is 9 units/day on Friday and 10 units/day on Saturday. With 12 units on hand and no incoming stock, days of cover = 12 / 9.5 ≈ **1.3 days**, so the system raises a **stockout-risk warning: likely stockout in about 1–2 days (illustrative 4-day risk horizon under slower demand)**. *Output:* predicted stockout before the weekend peak.

**Step 3 — Prescriptive issues the action.** The prescriptive rule compares forecast demand with stock on hand and reorder level. With a target cover of 21 days, target stock = 21 x 9.5 ≈ 200 units. Required reorder = 200 − 12 = **188 units**, marked **CRITICAL** because cover is below 2 days. At the same time, the channel ROAS table shows In-store ROAS 4.2x and SMS ROAS 0.8x, so the budget reallocation card recommends shifting budget toward In-store. Finally, the churn-signal list identifies regular customers whose purchase frequency dropped; the system recommends a "buy 3 noodles, get 1 sachet free" bundle promo targeted at those customers via SMS/Messenger. *Output:* reorder urgently, reallocate promo budget, launch targeted bundle.

**Loop closure.** When the owner reorders and the bundle promo runs, the new sales and inventory IN transactions are recorded. The next descriptive refresh measures the effect (e.g. noodle revenue recovers, ROAS improves), which updates the next forecast. This closes the analytics feedback loop.

---

## 3. Mapping BA Steps to Dashboard Widgets / Pages

| BA step | Exact dashboard widget / page | What is displayed there |
|---|---|---|
| Descriptive — revenue, orders, average basket, units sold | **Dashboard** page → KPI cards ("Total Revenue", "Total Orders", "Average Basket", "Units Sold") | Headline metrics computed from sales and sale_items |
| Descriptive — active customers, segments | **Dashboard** page → "Active Customers" card and **Analytics → Descriptive** → "Customer Segments" table | Count of distinct buyers; Regular / Wholesale / Credit breakdown |
| Descriptive — daily/weekly sales trend | **Dashboard** page → "Sales performance" area chart and **Analytics → Descriptive** → "Daily sales history" chart | Revenue over time |
| Descriptive — top products, category mix | **Dashboard** page → "Revenue by product" chart and **Analytics → Descriptive** → "Top products by revenue" / "Category revenue mix" charts | Ranked products and category shares |
| Descriptive — inventory status | **Dashboard** page → "Inventory health & stock cover" card and **Inventory** page → "Low-stock alerts" | Products at or below reorder level |
| Descriptive — marketing ROAS | **Analytics → Descriptive** → "Marketing channel performance" table | Revenue / budget per channel |
| Predictive — moving averages and 7-day forecast | **Analytics → Predictive** → model summary cards and "Sales forecast with confidence band" chart | Smoothed trend and regression forecast line |
| Predictive — weekday seasonality | **Analytics → Predictive** → "Day X seasonality" values in the insight panel | Index per day of week |
| Predictive — per-product demand forecast | **Analytics → Predictive** → "Product demand & stockout risk" table | Expected units/day by product |
| Predictive — stockout risk and days of cover | **Analytics → Predictive** → "Days of Cover / Stockout Risk" table | Cover days and risk flag per product |
| Predictive — churn signal | **Analytics → Predictive** → "Customer Churn-Risk Signal" list | At-risk customers and frequency drop |
| Prescriptive — reorder quantity/urgency | **Analytics → Prescriptive** → "Restock plan" table | Product, reorder qty, urgency label |
| Prescriptive — slow-mover markdowns | **Analytics → Prescriptive** → "Priority actions & promotions" card | Product, suggested discount, rationale |
| Prescriptive — marketing reallocation | **Analytics → Prescriptive** → "Marketing budget reallocation" card | Channels to increase/decrease and amounts |
| Prescriptive — at-risk promo targeting | **Analytics → Prescriptive** → "Priority actions & promotions" table | Customer names and suggested offer |
| Cross-layer overview | **Dashboard** → "Business analytics process" cards (served by `/api/analytics/overview`) | Combined summary linking all three layers |

---

## 4. Summary

The BA process in this project is intentionally explicit rather than implicit. Descriptive analytics supplies the factual baseline; predictive analytics transforms that baseline into forward-looking estimates; prescriptive analytics converts estimates into operational decisions. Mapping each step to a concrete widget ensures that the analytics are not abstract exercises but visible, usable decision support for the sari-sari store owner.
