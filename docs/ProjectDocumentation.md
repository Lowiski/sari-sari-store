# SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM

## Full Project Documentation and Case Study

**Document type:** Capstone project documentation  
**System stack:** React (frontend) + Express (backend) + Neon PostgreSQL (database)  
**Domain:** Philippine neighborhood convenience (sari-sari) store retail operations

---

## 1. Title

**SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM** — A full-stack business analytics application that replaces manual sales and stock records of a Philippine sari-sari store with an integrated point-of-sale, inventory, customer, and three-tier analytics platform (descriptive, predictive, prescriptive).

---

## 2. Problem Background

A sari-sari store is a micro-retail outlet typically operated by a household owner in a Philippine neighborhood. Most such stores still record sales in notebooks, track stock by memory, and decide promotions by intuition. This manual approach creates several recurring problems:

1. **Stockouts and lost sales.** Fast-moving goods such as instant noodles, canned goods, and soft drinks run out before the owner notices. Because there is no automatic low-stock alert or demand forecast, replenishment is reactive rather than planned.
2. **Overstock and tied-up capital.** Slow-moving items are bought in bulk because the owner cannot see which products actually generate revenue. Cash is trapped in inventory that occupies scarce shelf space.
3. **Guesswork promotions.** Discounts and marketing are chosen without evidence. There is no way to compute which channel or campaign produces a positive return on ad spend (ROAS), so budget is spent according to habit.
4. **No reliable sales history.** Handwritten records are easily lost, damaged, or misread. Daily, weekly, and seasonal sales patterns are invisible, so the owner cannot plan for peak weekdays or fiesta periods.
5. **Weak customer knowledge.** Regular customers, credit buyers, and wholesale buyers are not distinguished. There is no signal for customers who are buying less often and may be lost.
6. **No decision support.** Even when data exists, it is rarely converted into recommended actions such as *how much to reorder*, *which item to mark down*, or *which customer to target with a promo*.

The proposed system directly addresses these gaps by digitizing transactions and applying business analytics (BA) in a step-wise pipeline: descriptive analytics explains what happened, predictive analytics estimates what is likely to happen, and prescriptive analytics recommends what to do next.

---

## 3. Objectives

### 3.1 General Objective

To design, develop, and evaluate a web-based sales and inventory analytics system that enables a sari-sari store owner to record transactions accurately, monitor stock in real time, understand sales behavior, forecast demand, and receive actionable recommendations.

### 3.2 Specific Objectives

1. Build an authentication-protected React/Express application connected to Neon PostgreSQL.
2. Implement modules for Login, Dashboard, Products, Sales (POS cart), Inventory, Customers, Analytics, Reports, and Settings.
3. Store structured data for customers, products, sales, sale items, inventory transactions, and marketing campaigns with at least 50 seed records per major entity.
4. Implement descriptive analytics (revenue, orders, basket size, units sold, trends, top products, category mix, inventory status, segments, marketing ROAS).
5. Implement predictive analytics (moving averages, linear-regression sales forecast, weekday seasonality, per-product demand forecast, stockout risk, churn signal).
6. Implement prescriptive analytics (reorder quantity/urgency, slow-mover markdowns, marketing budget reallocation, at-risk customer targeting).
7. Present all analytics through interactive dashboard widgets and tabular reports.
8. Validate the system through functional, data-integrity, analytics-accuracy, and usability testing.

---

## 4. Scope

### 4.1 In Scope

- Web-based POS cart with multiple line items, discounts, and payment-method capture.
- Product master data with SKU, category, unit, price, cost, and reorder level.
- Inventory IN/OUT transactions with reference numbers and notes.
- Customer master data with customer type classification.
- Marketing campaign records with channel, budget, impressions, clicks, conversions, and revenue.
- Three analytics layers exposed through REST endpoints and dashboard visualizations.
- Sales and inventory report generation with date filtering.
- Seed dataset sufficient for meaningful analytics (60 products, 60 customers, 180 sales, 300+ sale items, 300+ inventory transactions, 60 campaigns).

### 4.2 Out of Scope

- Online customer-facing e-commerce storefront or delivery scheduling.
- Payment gateway integration (cash and manual payment-method recording only).
- Supplier procurement automation and purchase-order generation.
- Barcode scanner hardware integration.
- Multi-store / multi-branch support.
- Accounting-grade financial statements, tax filing, and general ledger posting.
- Mobile native application (the web UI is responsive but is not a compiled app).

---

## 5. Stakeholders

| Stakeholder | Role in the project | Interest |
|---|---|---|
| Store owner / manager | Primary end user and decision maker | Wants higher profit, fewer stockouts, better promo decisions |
| Store staff / cashier | Daily operator | Needs fast, simple POS entry and correct stock deductions |
| Customers | Data subjects and beneficiaries | Benefit from availability of goods and relevant offers |
| Capstone team / developer | Designer and implementer | Delivers a working, documented system |
| Instructor / panel | Academic evaluator | Assesses requirements, BA depth, and presentation quality |
| Supplier (indirect) | External partner | Affected by reorder recommendations (not a system user) |

---

## 6. System Context

The system is a three-tier web application:

- **Presentation tier:** React single-page application with pages for Login, Dashboard, Products, Sales, Inventory, Customers, Analytics (Descriptive, Predictive, Prescriptive), Reports, and Settings.
- **Application tier:** Express REST API that enforces request validation, computes analytics, and serves report data.
- **Data tier:** Neon PostgreSQL managed cloud database holding normalized transactional tables.

Data flows from user entry (POS sale, stock movement, product/customer/campaign edits) into PostgreSQL; the Express analytics services query those tables and return computed metrics; React renders them as tables, charts, and recommendation cards. Authentication protects all /api routes except login.

```
[User: Owner/Staff] --> [React SPA] --HTTP/JSON--> [Express API] --SQL--> [Neon PostgreSQL]
                                      <--JSON------              <--rows----
```

---

## 7. Requirements

### 7.1 Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow authorized users to log in with credentials and maintain a session. |
| FR-02 | The system shall allow CRUD operations on products (SKU, name, category, unit, price, cost, reorder level, active flag). |
| FR-03 | The system shall allow creation of a sale with a cart of multiple sale items, subtotal, discount, total, customer, and payment method. |
| FR-04 | The system shall automatically record an inventory OUT transaction when a sale is completed. |
| FR-05 | The system shall allow manual IN and OUT inventory transactions with reference and note fields. |
| FR-06 | The system shall flag products whose quantity on hand is at or below reorder level. |
| FR-07 | The system shall allow CRUD operations on customers with name, phone, email, address, and customer type. |
| FR-08 | The system shall allow CRUD operations on marketing campaigns with channel, budget, engagement, conversions, and revenue. |
| FR-09 | The system shall compute and display descriptive metrics and trends. |
| FR-10 | The system shall compute and display forecasts, seasonality, stockout risk, and churn signal. |
| FR-11 | The system shall generate reorder, markdown, budget reallocation, and promotional targeting recommendations. |
| FR-12 | The system shall generate sales and inventory reports with date filtering. |
| FR-13 | The system shall expose all operations through documented REST endpoints. |

### 7.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | API responses for standard list endpoints should complete within 2 seconds for the seed dataset. |
| NFR-02 | The UI shall be responsive and usable on desktop and tablet screens. |
| NFR-03 | Passwords shall be stored as hashes, never in plain text. |
| NFR-04 | All data-mutating endpoints shall require authentication. |
| NFR-05 | Analytics computations shall be deterministic for a fixed dataset and date range. |
| NFR-06 | The system shall handle invalid input with clear error messages and appropriate HTTP status codes. |
| NFR-07 | Database access shall use environment variables for connection credentials (no hard-coded secrets). |
| NFR-08 | The system shall be deployable to a standard Node hosting service with an external PostgreSQL provider. |

---

## 8. Data Dictionary — Five Main Variables

The seed dataset contains **at least 50 records per major entity**: 60 products, 60 customers, 180 sales (and 300+ sale items), 300+ inventory transactions, and 60 marketing campaigns. This satisfies the requirement that each main variable has >= 50 observations for meaningful analysis.

### 8.1 Customer (`customers`)

| Field | Type | Description |
|---|---|---|
| id | integer / uuid (PK) | Unique customer identifier |
| name | varchar | Customer full name |
| phone | varchar | Contact number |
| email | varchar | Email address (optional) |
| address | varchar | Home or barangay address |
| customer_type | varchar | Classification such as Regular, Wholesale, Credit |
| created_at | timestamp | Date the record was created |

**Record count:** 60 seed customers.

### 8.2 Product (`products`)

| Field | Type | Description |
|---|---|---|
| id | integer / uuid (PK) | Unique product identifier |
| sku | varchar | Stock keeping unit code |
| name | varchar | Product name |
| category_id | FK -> categories.id | Product category |
| unit | varchar | Selling unit (piece, sachet, bottle, case) |
| price | numeric | Selling price |
| cost | numeric | Unit acquisition cost |
| reorder_level | integer | Stock threshold that triggers a low-stock alert |
| is_active | boolean | Whether the product is currently offered |
| created_at | timestamp | Date the record was created |

**Record count:** 60 seed products.

### 8.3 Sales / Transaction (`sales`, `sale_items`)

| Field | Type | Description |
|---|---|---|
| sales.id | integer / uuid (PK) | Unique sale identifier |
| sales.invoice_no | varchar | Human-readable invoice number |
| sales.customer_id | FK -> customers.id | Buyer (nullable for walk-in) |
| sales.sale_date | date/timestamp | Date of the transaction |
| sales.subtotal | numeric | Sum of line items before discount |
| sales.discount | numeric | Discount amount |
| sales.total | numeric | Final amount paid |
| sales.payment_method | varchar | Cash, GCash, etc. |
| sales.created_at | timestamp | Record creation time |
| sale_items.id | PK | Unique line identifier |
| sale_items.sale_id | FK -> sales.id | Parent sale |
| sale_items.product_id | FK -> products.id | Product sold |
| sale_items.quantity | integer | Units sold |
| sale_items.unit_price | numeric | Price at time of sale |
| sale_items.line_total | numeric | quantity x unit_price |

**Record count:** 180 seed sales; 300+ seed sale items.

### 8.4 Inventory (`inventory_transactions`)

| Field | Type | Description |
|---|---|---|
| id | integer / uuid (PK) | Unique transaction identifier |
| product_id | FK -> products.id | Affected product |
| txn_type | enum ('IN','OUT') | Stock movement direction |
| quantity | integer | Number of units moved (positive) |
| reference | varchar | Source document (e.g. INV-1001, PO-22) |
| txn_date | date/timestamp | Date of movement |
| note | text | Optional remarks |
| created_at | timestamp | Record creation time |

**Record count:** 300+ seed inventory transactions.

### 8.5 Marketing (`marketing_campaigns`)

| Field | Type | Description |
|---|---|---|
| id | integer / uuid (PK) | Unique campaign identifier |
| name | varchar | Campaign name |
| channel | varchar | Facebook, TikTok, SMS, In-store, etc. |
| start_date | date | Campaign start |
| end_date | date | Campaign end |
| budget | numeric | Planned spend |
| impressions | integer | Number of views |
| clicks | integer | Number of clicks |
| conversions | integer | Number of completed purchases |
| revenue | numeric | Revenue attributed to the campaign |
| created_at | timestamp | Record creation time |

**Record count:** 60 seed campaigns.

---

## 9. Database Design Summary

The schema is normalized to reduce redundancy:

- `categories` groups products; `products.category_id` references it.
- `customers` is independent and referenced by `sales.customer_id`.
- `sales` is the transaction header; `sale_items` is the line-item detail (one-to-many). Each sale item links to a product, preserving the historical unit price.
- `inventory_transactions` records every stock movement for a product (one-to-many). Quantity on hand is derived as SUM(IN) minus SUM(OUT).
- `marketing_campaigns` is an independent fact table used for ROAS and channel analysis.
- `users` stores authenticated accounts for the Login module.

Foreign keys enforce referential integrity; indexes on `sale_date`, `product_id`, `customer_id`, and `txn_date` support the analytics queries.

---

## 10. Module Descriptions

| Module | Purpose | Key screens / actions |
|---|---|---|
| Login | Authenticate users | Credential form, session handling |
| Dashboard | Single-page overview of KPIs and alerts | Revenue, orders, low-stock cards, trend chart, top products |
| Products | Manage the product catalog | Add/edit product, set price/cost/reorder level, deactivate |
| Sales | POS cart checkout | Select customer, add items, apply discount, choose payment method, save sale |
| Inventory | Track stock movements | Stock-in form, stock-out form, transaction history, low-stock alerts |
| Customers | Manage customer records | Add/edit customer, view customer type and purchase history |
| Analytics | Three-tier BA views | Descriptive, Predictive, and Prescriptive tabs |
| Reports | Generate printable/exportable summaries | Sales report and inventory report with date filters |
| Settings | Configure account and system preferences | User profile, store settings, optional theme/preferences |

---

## 11. Analytics Overview

### 11.1 Descriptive Analytics (What happened?)

Total revenue, number of orders, average basket value, units sold, active customers, daily/weekly sales trend, top products, category revenue mix, inventory status, customer segments, and marketing ROAS by channel. These metrics are served by `/api/analytics/descriptive` and `/api/analytics/overview`.

### 11.2 Predictive Analytics (What is likely to happen?)

Three-day and seven-day moving averages, a linear-regression seven-day sales forecast, a weekday seasonality index, per-product demand forecasts, days-of-cover / stockout-risk prediction, and a customer churn-risk signal. Served by `/api/analytics/predictive`.

### 11.3 Prescriptive Analytics (What should we do?)

Reorder quantity and urgency recommendations, slow-mover markdown suggestions, marketing budget reallocation by ROAS, and promotional targeting of at-risk customers. Served by `/api/analytics/prescriptive`.

The three layers are connected step-wise: descriptive findings become inputs to predictive models, and predictive outputs become triggers for prescriptive rules. A detailed step-by-step mapping is provided in `BA-Process-Overview.md`.

---

## 12. Testing Plan

| Test level | What is tested | Example test case | Expected result |
|---|---|---|---|
| Unit | Analytics helper functions | Moving average of [10,20,30] over 3 days | 20 |
| API / integration | REST endpoints | POST /api/sales with 2 line items | Sale and 2 sale_items saved; total = sum - discount |
| Data integrity | Foreign keys and constraints | Insert sale_item with invalid product_id | Request rejected |
| Functional | POS workflow | Complete a sale for 3 noodles | Inventory OUT of 3 recorded; stock reduced |
| Analytics accuracy | Forecast and ROAS math | Forecast computed on fixed seed | Values match manual calculation |
| Security | Unauthorized access | GET /api/products without token | 401 response |
| UI / usability | Navigation and forms | Add product then view it in Products page | Product appears in list |
| Report | Date filtering | Sales report for a chosen week | Only that week's sales shown |
| Performance | Response time | GET /api/analytics/overview | Responds within 2 seconds |

Testing is performed manually with a test matrix and, where practical, automated with a scripted HTTP client. Defects are logged with severity and retested after fixing.

---

## 13. Deployment and Setup Instructions

### 13.1 Prerequisites

- Node.js 18+ and npm
- A Neon PostgreSQL account and connection string
- Git (optional, for version control)

### 13.2 Backend Setup

1. Clone or copy the project folder.
2. In the backend directory, run `npm install`.
3. Create a `.env` file containing:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `PORT` — API port (e.g. 5000)
   - `JWT_SECRET` — secret used for auth tokens
4. Run migrations / schema creation script to create the tables.
5. Run the seed script to load 60 products, 60 customers, 180 sales, 300+ sale items, 300+ inventory transactions, and 60 campaigns.
6. Start the server with `npm run dev` (development) or `npm start` (production).

### 13.3 Frontend Setup

1. In the frontend directory, run `npm install`.
2. Set the API base URL (e.g. `REACT_APP_API_URL=http://localhost:5000/api`).
3. Run `npm start` for local development; the app opens on the configured port.
4. Build for production with `npm run build` and serve the `build/` folder statically.

### 13.4 Deployment

- Deploy the Express API to a Node hosting platform (e.g. Render, Railway, or a VPS).
- Deploy the React build to a static host (e.g. Vercel, Netlify) and point it to the deployed API URL.
- Keep `DATABASE_URL` and `JWT_SECRET` as server-side environment variables.
- Verify all ten API endpoints after deployment using the API Reference document.

---

## 14. Assumptions

1. The seed dataset is synthetic but modeled on realistic Philippine sari-sari store operations.
2. Quantity on hand is derived from inventory transactions rather than stored as an independent value.
3. Each sale item records the unit price at the time of sale, so historical revenue is not distorted by later price changes.
4. Walk-in customers may be recorded without a customer_id.
5. Marketing campaign revenue is attributed to the campaign as recorded; multi-touch attribution is not modeled.
6. Linear regression is sufficient as a first-order forecast for short horizons (7 days).
7. A single store and a small number of staff/users are assumed.
8. Internet access is available for the hosted Neon database.

---

## 15. Conclusion

The Sari-Sari Store Sales and Inventory Analytics System converts everyday sari-sari store transactions into structured data and then into decisions. By linking a POS cart, inventory ledger, customer and campaign records, and a three-level analytics pipeline, the system addresses the root causes of stockouts, overstock, and guesswork promotions. The descriptive layer establishes what is happening, the predictive layer anticipates demand and risk, and the prescriptive layer converts those forecasts into concrete reorder, markdown, budget, and targeting actions. With at least 50 records per main variable and a documented REST API, the project is both academically defensible and practically usable as a foundation for micro-retail decision support in the Philippines.

---

### Related documents

- `BA-Process-Overview.md` — step-wise BA pipeline and widget mapping
- `Case-Study-Problem.md` — concise presentation-ready problem statement
- `Rating-Sheet.md` — presentation and leader contribution scoring templates
- `ERD.md` — Mermaid entity relationship diagram
- `UseCaseDiagram.md` — Mermaid use case map
- `DataFlowDiagram.md` — Mermaid Level 0 and Level 1 DFDs
- `API-Reference.md` — REST endpoint reference
