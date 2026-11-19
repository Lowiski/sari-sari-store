# Case Study Problem Statement

## SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM

*A concise problem statement for capstone presentation*

---

## Background

Sari-sari stores are the most common retail outlets in Philippine neighborhoods. They sell everyday goods — noodles, canned food, soft drinks, snacks, and household items — usually in small sachets and pieces. Most are family-run, with the owner recording sales in a notebook and checking stock by looking at the shelf. This works for a few transactions a day but breaks down as the store grows.

In a typical manual store, the owner learns that a product is out of stock only when a customer asks for it and leaves empty-handed. Overstock is discovered only when cash runs short and the storeroom is full of unsold goods. Promotions are chosen because a neighbor suggested them, not because data showed they work. The store has data in principle — every sale and every delivery is a fact — but the data is unstructured, hard to summarize, and never converted into a decision.

---

## Problem Statement

The central problem is **the absence of an integrated, data-driven system that connects sales recording, inventory tracking, and business analytics for a Philippine sari-sari store**. Specifically:

1. Sales are recorded manually, so daily, weekly, and seasonal patterns are invisible and revenue figures are unreliable.
2. Stock is monitored by memory, causing frequent stockouts of fast-moving items and overstock of slow movers.
3. Promotions and marketing spend are decided by intuition, with no measurement of return on ad spend (ROAS).
4. The owner cannot distinguish regular, wholesale, and credit customers or detect when a loyal customer is buying less often.
5. Even if reports exist, they describe the past only; there is no forecast of demand or recommendation of action.

The consequence is lost sales, tied-up capital, wasted promo budget, and missed customer-retention opportunities. The research problem is therefore: *Can a full-stack sales and inventory system with descriptive, predictive, and prescriptive analytics improve the quality and speed of decisions in a sari-sari store?*

---

## Research Questions

1. **RQ1 (Descriptive):** What are the store's revenue, order volume, average basket size, units sold, best-selling products, category revenue mix, and channel ROAS based on recorded transactions?
2. **RQ2 (Predictive):** Can moving averages, linear regression, and weekday seasonality produce a reliable 7-day sales and per-product demand forecast, and can days-of-cover identify stockout risk before it occurs?
3. **RQ3 (Prescriptive):** Can forecast and risk outputs be translated into concrete reorder quantities, markdown suggestions, budget reallocation, and customer targeting rules?
4. **RQ4 (System):** Can a React + Express + Neon PostgreSQL application deliver these analytics through usable dashboards and documented REST endpoints?

---

## Data Description

The study uses a structured relational dataset with **at least 50 records per main variable**, satisfying the data-adequacy requirement:

| Main variable | Source table | Seed records | Role in analysis |
|---|---|---|---|
| Customer | `customers` | 60 | Segmentation and churn signal |
| Product | `products` | 60 | Top products, category mix, cost/margin |
| Sales / transaction | `sales` + `sale_items` | 180 sales, 300+ items | Revenue, basket, trend, demand |
| Inventory | `inventory_transactions` | 300+ | Stock on hand, days of cover, risk |
| Marketing | `marketing_campaigns` | 60 | ROAS, budget reallocation |

Key fields include `sale_date`, `quantity`, `unit_price`, `price`, `cost`, `reorder_level`, `txn_type` (IN/OUT), `channel`, `budget`, and `revenue`. Supporting tables `categories` and `users` complete the schema.

---

## BA Approach

The project applies a **step-wise business analytics pipeline**:

1. **Descriptive** — aggregate the data to answer *what happened* (revenue, orders, trends, top products, inventory status, ROAS).
2. **Predictive** — use moving averages, linear regression, seasonality, days-of-cover, and churn signal to answer *what is likely to happen*.
3. **Prescriptive** — apply decision rules to answer *what should be done* (reorder, markdown, budget shift, promo targeting).

Each stage feeds the next: descriptive metrics become predictive inputs; predictive outputs become prescriptive triggers. The results are displayed in the Dashboard and Analytics pages of the React application.

---

## Expected Decision Outcomes

| Decision area | Current practice | Expected outcome with the system |
|---|---|---|
| Replenishment | Reorder when shelf is empty | Reorder 55 units of noodles urgently before weekend demand spike |
| Slow-moving stock | Keep until "maybe" sold | Apply 20% markdown on identified slow movers to free cash and shelf space |
| Promotions | Spread budget evenly | Shift budget from low-ROAS SMS (0.8x) to high-ROAS In-store (4.2x) |
| Customer retention | No retention action | Send targeted bundle promo to 7 at-risk regular customers |
| Planning | Guess next week's sales | Use 7-day forecast and weekday index to prepare stock and staffing |

The overall expected outcome is fewer stockouts, lower overstock, measurable promo effectiveness, and faster, evidence-based decisions.

---

## Ethical and Limitations Notes

- **Data privacy:** Customer names, phone numbers, and addresses are personal information. Access is restricted to authenticated users, and sample data is synthetic. Real deployment requires consent and data-protection practices consistent with the Philippine Data Privacy Act.
- **Synthetic data:** The seed dataset is simulated, not collected from an actual store, so absolute figures are illustrative; the analytics methods remain valid.
- **Forecast limits:** Linear regression and moving averages are simple models; they may miss sudden events (fiestas, typhoons, supplier failure) and should be treated as decision support, not certainty.
- **Attribution limits:** Campaign revenue is recorded as attributed; multi-channel customer journeys are not modeled.
- **Scope limits:** The system assumes one store, cash/manual payment recording, and no supplier automation or barcode hardware.

---

## Conclusion

The sari-sari store's problem is not a lack of transactions but a lack of structure and analytics around them. This capstone proposes an integrated full-stack system that turns daily sales, stock movements, customers, and campaigns into descriptive insight, predictive forecasts, and prescriptive actions — converting ordinary neighborhood retail records into a practical decision-support tool.
