# SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM

A full-stack capstone business analytics application for a Philippine neighborhood
**sari-sari store**. It replaces handwritten sales and stock logs with a React point-of-sale
dashboard backed by an Express REST API and a Neon PostgreSQL database, then turns the
collected data into **descriptive, predictive and prescriptive** decisions.

---

## 1. Problem background

Small sari-sari stores usually rely on memory and notebooks. Common consequences:

- Fast-moving items run out while slow-moving items occupy capital and shelf space.
- Owners cannot tell which products, categories or customers actually generate profit.
- Promotions are guessed rather than targeted, so marketing spend is wasted.
- There is no historical data to support forecasting or reorder decisions.

**Objective:** build an interactive database program that records sales, customers, products,
inventory and marketing, visualizes what is happening, forecasts what is likely to happen,
and recommends what the owner should do next.

---

## 2. Business analytics process (step-wise connection)

| Step | Question | Input | Method | Output | Feeds the next step by... |
|---|---|---|---|---|---|
| **1. Descriptive** | What happened? | 180 sales, 300 sale items, 60 customers, 60 campaigns | Aggregation, trends, top-N, ROAS | KPIs, daily sales, top products, category mix, segments | Supplies the historical series and current state used to fit forecast models |
| **2. Predictive** | What will happen? | Descriptive daily series + 30-day product velocity + customer recency | Linear regression, 3/7-day moving average, weekday index, days-of-cover, churn signals | 7/14/30-day revenue forecast, stockout risk, churn risk | Converts predictions into scored risks that decision rules can act on |
| **3. Prescriptive** | What should we do? | Forecast + risk scores + channel ROAS | Reorder rule (21-day cover), markdown rule, ROAS reallocation, retention offers | Prioritized restock orders, markdowns, budget shifts, promos | Actions are executed by staff through the POS and inventory modules, creating new data |

A worked example: *descriptive analytics shows a revenue drop in Instant Noodles → predictive
analytics forecasts stockout in 4 days → prescriptive analytics orders 48 units and pairs a
slow mover with the best seller in a bundle promo.*

The chain is displayed in **Dashboard → Business analytics process** and in
**Analytics → 3 · Prescriptive**. Full write-up: [`docs/BA-Process-Overview.md`](docs/BA-Process-Overview.md).

---

## 3. Data collected (minimum 50 per variable)

| Data variable | Table | Records |
|---|---|---:|
| Product | `products` | 60 |
| Customer | `customers` | 60 |
| Sales / transactions | `sales` | 180 |
| Transaction details | `sale_items` | 300 |
| Inventory movements | `inventory_transactions` | 300 |
| Marketing campaigns | `marketing_campaigns` | 60 |

Seed data is deterministic and uses recent dates relative to `CURRENT_DATE`, so charts always
look current. See [`database/README.md`](database/README.md) for verification queries.

---

## 4. Features

- JWT login with seeded admin account (`admin` / `admin123`).
- **Dashboard** — revenue, orders, basket size, active customers, stock alerts, sales area
  chart, top-product bars, category donut, stock-cover chart and recent sales.
- **Products** — searchable/filterable catalog, CRUD, pricing and reorder levels.
- **Sales / POS** — interactive cart, customer selection, discount, payment method, atomic
  sale creation that automatically writes stock-out movements.
- **Inventory** — stock on hand, stock in/out forms, low-stock alerts, valuation, movement log.
- **Customers** — master file, segmentation inputs and lifetime spend.
- **Analytics** — separate Descriptive, Predictive and Prescriptive views plus forecast band,
  product risk table, churn table and restock recommendations.
- **Reports** — filtered sales/inventory reports with CSV export.
- **Settings** — stack, credentials and database setup reference.

---

## 5. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Recharts, Axios, Lucide icons |
| Backend | Express.js, JWT, bcryptjs, Helmet, CORS, Morgan |
| Database | Neon serverless PostgreSQL (`@neondatabase/serverless`) |
| Analytics | JavaScript implementations of regression, moving averages, seasonality and decision rules |

---

## 6. Project structure

```
sari-sari-store-analytics/
├── frontend/          React + Vite application (pages, components, services)
├── backend/           Express REST API (routes, controllers, services, models, analytics)
├── database/          schema.sql, seed.sql, views.sql, README.md
├── docs/              Case study, BA process, diagrams, API reference, rating sheet
└── README.md          This file
```

---

## 7. Setup

### 7.1 Neon database

1. Create a free project at <https://neon.tech> and copy the **pooled** connection string.
2. In the Neon SQL Editor, run the scripts **in this order**:
   ```sql
   -- paste contents of each file
   database/schema.sql
   database/seed.sql
   database/views.sql
   ```
   Or, after creating `backend/.env`, run the included setup script:
   ```bash
   cd backend
   npm install
   npm run db:setup
   ```
   This applies `schema.sql` → `seed.sql` → `views.sql` and prints the record counts.

### 7.2 Backend

```bash
cd backend
npm install
copy .env.example .env      # Windows: copy | macOS/Linux: cp
# edit .env: paste DATABASE_URL and set a long JWT_SECRET
npm run dev                 # http://localhost:5000
```

Check: <http://localhost:5000/api/health> should return `"database": "connected"`.

### 7.3 Frontend

```bash
cd frontend
npm install
copy .env.example .env      # VITE_API_URL=/api uses the Vite proxy
npm run dev                 # http://localhost:5173
```

Sign in with **admin / admin123**.

> Node.js 18 or newer is required. If you host the frontend separately, set
> `VITE_API_URL=https://your-api-host/api` and add that origin to backend `CLIENT_URL`.

---

## 8. Deployment (Vercel + Render + Neon)

Deploy the React app to **Vercel**, the Express API to **Render**, and keep **Neon** as the shared database:

```text
Browser → Vercel (frontend) → Render (API) → Neon (PostgreSQL)
```

Quick checklist:

1. Render Web Service: root `backend`, build `npm install`, start `npm run start`, health check `/api/health`.
2. Render env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`, `CLIENT_URL`.
3. Vercel project: Root Directory `frontend`, build `npm run build`, output `dist`.
4. Vercel env var: `VITE_API_URL=https://<your-render-service>.onrender.com/api`.
5. Set Render `CLIENT_URL` to the final Vercel URL to allow CORS.

Full click-by-click guide: [`docs/Deployment-Guide.md`](docs/Deployment-Guide.md).

---

## 9. Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/products` · `/api/sales` · `/api/customers` | CRUD master/transaction data |
| GET/POST | `/api/inventory` · `/api/inventory/stock-in` · `/api/inventory/stock-out` | Stock and movements |
| GET | `/api/analytics/descriptive` | KPIs, trends, segments, ROAS |
| GET | `/api/analytics/predictive?horizon=7` | Forecast and risk scores |
| GET | `/api/analytics/prescriptive` | Restock, markdown, marketing and promo actions |
| GET | `/api/analytics/overview` | All three stages plus the BA chain (dashboard) |
| GET | `/api/reports/sales` · `/api/reports/inventory` | Report datasets |

Full reference: [`docs/API-Reference.md`](docs/API-Reference.md).

---

## 10. Presentation materials

- Case study problem — [`docs/Case-Study-Problem.md`](docs/Case-Study-Problem.md)
- Full project documentation — [`docs/ProjectDocumentation.md`](docs/ProjectDocumentation.md)
- BA process + widget mapping — [`docs/BA-Process-Overview.md`](docs/BA-Process-Overview.md)
- ERD, use case and DFD — [`docs/ERD.md`](docs/ERD.md), [`docs/UseCaseDiagram.md`](docs/UseCaseDiagram.md), [`docs/DataFlowDiagram.md`](docs/DataFlowDiagram.md)
- Presentation rating sheet and contribution scoring — [`docs/Rating-Sheet.md`](docs/Rating-Sheet.md)

Suggested demo flow: **Login → Dashboard → Sales (record a sale) → Inventory (restock) →
Analytics (Descriptive → Predictive → Prescriptive) → Reports (export CSV).**

> Group rule reminder: maximum **3 graded members**. The leader submits contribution scores;
> a 4th member receives no grade.

---

## 11. Notes and limitations

- Stock is derived from `inventory_transactions` (`IN` adds, `OUT` subtracts) instead of a
  mutable stock column, which keeps the audit trail complete.
- Forecasts are statistical estimates from 90 days of demo data; they are meant to demonstrate
  the BA method, not to replace a store owner's judgement.
- All monetary values are in Philippine pesos (PHP).
