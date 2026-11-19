# API Reference

## SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM

**Base URL:** `http://localhost:5000/api` (development). Set `CLIENT_URL` in `backend/.env`
to the frontend origin when deploying separately.

### Conventions

- All endpoints except `POST /auth/login` require `Authorization: Bearer <token>`.
- Every response uses the envelope `{ "success": true, "data": ... }` on success and
  `{ "success": false, "message": "..." }` on failure.
- List endpoints accept `page` (default 1) and `limit` (default 10, max 100) and return
  `{ items: [...], total, page, limit, pages }`.
- Money is returned as JSON numbers rounded to 2 decimals; dates are `YYYY-MM-DD`.

---

## 1. Authentication

### `POST /auth/login`

```json
// request
{ "username": "admin", "password": "admin123" }

// 200 response
{
  "success": true,
  "message": "Welcome back.",
  "data": {
    "user": { "id": 1, "username": "admin", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### `GET /auth/me`

Returns the authenticated user object: `{ "success": true, "data": { "id": 1, "username": "admin", "role": "admin" } }`.

---

## 2. Products

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/products` | List/search products. Query: `search`, `categoryId`, `lowStock=true`, `page`, `limit` |
| GET | `/products/categories` | Categories with product counts |
| GET | `/products/:id` | One product including computed `stock_on_hand` |
| POST | `/products` | Create a product |
| PUT | `/products/:id` | Update supplied fields |
| DELETE | `/products/:id` | Delete a product |

```json
// POST /products request
{
  "sku": "SKU-0061",
  "name": "Mineral Water 500ml",
  "categoryId": 1,
  "unit": "bottle",
  "price": 20,
  "cost": 14,
  "reorderLevel": 24
}

// data in response
{
  "id": 61,
  "sku": "SKU-0061",
  "name": "Mineral Water 500ml",
  "category_id": 1,
  "category_name": "Beverages",
  "unit": "bottle",
  "price": "20.00",
  "cost": "14.00",
  "reorder_level": 24,
  "stock_on_hand": 0,
  "is_active": true
}
```

---

## 3. Sales / POS

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/sales` | List sales. Query: `from`, `to`, `customerId`, `search`, `page`, `limit` |
| GET | `/sales/summary` | `orders`, `revenue`, `avg_basket`, `discounts`, `units_sold` (optional `from`, `to`) |
| GET | `/sales/next-invoice` | Next invoice number for today |
| GET | `/sales/:id` | One sale with its `items` array |
| POST | `/sales` | Create sale + line items + automatic inventory OUT movements (atomic) |

```json
// POST /sales request (note camelCase)
{
  "customerId": 5,
  "saleDate": "2026-11-19",
  "paymentMethod": "gcash",
  "discount": 10,
  "items": [
    { "productId": 1, "quantity": 2, "unitPrice": 55 },
    { "productId": 13, "quantity": 3, "unitPrice": 18 }
  ]
}

// data in response
{
  "id": 181,
  "invoice_no": "INV-20261119-0003",
  "customer_id": 5,
  "sale_date": "2026-11-19",
  "subtotal": 164,
  "discount": 10,
  "total": 154,
  "payment_method": "gcash",
  "items": [
    { "id": 301, "sale_id": 181, "product_id": 1, "quantity": 2, "unit_price": "55.00", "line_total": "110.00" }
  ]
}
```

---

## 4. Inventory

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/inventory` | Current stock per product (from `v_product_stock`) |
| GET | `/inventory/transactions` | Movement log. Query: `productId`, `type=IN\|OUT`, `from`, `to`, `page`, `limit` |
| GET | `/inventory/alerts` | Products at or below reorder level |
| GET | `/inventory/valuation` | Cost and retail value by category |
| POST | `/inventory/stock-in` | Record a delivery/receipt |
| POST | `/inventory/stock-out` | Record a manual withdrawal (validates available stock) |

```json
// POST /inventory/stock-in request
{
  "productId": 1,
  "quantity": 50,
  "reference": "PO-00123",
  "txnDate": "2026-11-19",
  "note": "Supplier delivery"
}

// GET /inventory data item
{
  "product_id": 1,
  "sku": "SKU-0001",
  "product_name": "San Miguel Beer 500ml",
  "category_name": "Beverages",
  "unit": "bottle",
  "price": "55.00",
  "cost": "41.25",
  "stock_on_hand": 92,
  "reorder_level": 10,
  "stock_value": "3795.00",
  "stock_status": "IN STOCK"
}
```

---

## 5. Customers

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/customers` | List. Query: `search`, `type`, `page`, `limit` |
| GET | `/customers/summary` | Per-customer orders, spend and last purchase (from `v_customer_summary`) |
| GET | `/customers/:id` | One customer |
| POST | `/customers` | Create customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |

---

## 6. Analytics

### `GET /analytics/descriptive` — what happened?

Optional query: `from`, `to`.

```json
{
  "success": true,
  "data": {
    "period": { "from": "all", "to": "all" },
    "kpis": {
      "totalRevenue": 84500,
      "totalOrders": 180,
      "averageBasket": 469.44,
      "unitsSold": 2140,
      "totalDiscounts": 620,
      "activeCustomers": 60,
      "totalCustomers": 60
    },
    "dailySales": [{ "date": "2026-08-22", "orders": 2, "revenue": 940.5, "units": 7 }],
    "topProducts": [{ "productId": 13, "name": "Indomie Chicken 65g", "category": "Instant Noodles", "unitsSold": 210, "revenue": 3780, "timesSold": 70 }],
    "categoryMix": [{ "category": "Beverages", "revenue": 22000, "units": 310, "products": 12, "sharePct": 26.03 }],
    "customerSegments": [{ "segment": "regular", "customers": 24, "orders": 72, "spend": 32000 }],
    "inventoryStatus": { "inStock": 45, "lowStock": 10, "outOfStock": 5, "stockValue": 148000 },
    "marketing": {
      "channels": [{ "channel": "Tiktok", "spend": 12000, "revenue": 54000, "conversions": 300, "roas": 4.5 }],
      "campaigns": [{ "name": "Tiktok Promo #03", "channel": "Tiktok", "roas": 4.5, "ctrPct": 4.2, "revenue": 1800 }]
    },
    "insights": ["Indomie Chicken 65g is the top revenue driver at PHP 3780."]
  }
}
```

### `GET /analytics/predictive?horizon=7` — what will happen?

```json
{
  "success": true,
  "data": {
    "model": {
      "name": "Blended linear trend + moving average + weekday seasonality",
      "trainedOnDays": 90,
      "horizonDays": 7,
      "averageDailyRevenue": 930.5,
      "trendSlope": 2.4,
      "movingAverage3": 945.2,
      "movingAverage7": 920.8
    },
    "forecast": [{
      "date": "2026-11-20",
      "weekday": "Fri",
      "predictedRevenue": 1010.5,
      "lower": 858.9,
      "upper": 1162.1,
      "method": "trend + 7-day MA + weekday index"
    }],
    "weekdayIndex": { "0": 0.92, "5": 1.24 },
    "productRisks": [{
      "productId": 13,
      "name": "Indomie Chicken 65g",
      "sku": "SKU-0013",
      "category": "Instant Noodles",
      "unitsSold30": 90,
      "avgDailyDemand": 3,
      "stockOnHand": 12,
      "daysCover": 4,
      "risk": "HIGH"
    }],
    "churnRisk": [{ "customerId": 5, "name": "Maria Santos", "daysSinceLastPurchase": 52, "totalOrders": 6, "lifetimeSpend": 4200, "risk": "HIGH" }],
    "totalForecastRevenue": 7100.5,
    "insights": ["Predicted revenue for the next 7 days: PHP 7100.5."]
  }
}
```

### `GET /analytics/prescriptive?horizon=7` — what should we do?

```json
{
  "success": true,
  "data": {
    "chain": {
      "descriptiveInput": { "revenue": 84500, "topProduct": "Indomie Chicken 65g", "bestChannel": "Tiktok" },
      "predictiveInput": { "forecastRevenue": 7100.5, "atRiskProducts": 12, "churnCustomers": 8 },
      "decisionOutput": { "restockOrders": 9, "markdowns": 4, "channelDecisions": 5, "promos": 8 }
    },
    "restock": [{
      "productId": 13,
      "product": "Indomie Chicken 65g",
      "sku": "SKU-0013",
      "currentStock": 12,
      "avgDailyDemand": 3,
      "daysCover": 4,
      "recommendedOrder": 51,
      "urgency": "HIGH",
      "estimatedCost": 412.5,
      "supplier": "Distributor - Indomie / Lucky Me",
      "action": "Order 51 units within 3 days."
    }],
    "markdown": [],
    "marketing": [{ "channel": "Tiktok", "currentSpend": 12000, "roas": 4.5, "suggestedBudget": 18000, "changePct": 50, "expectedRevenue": 81000, "decision": "INCREASE" }],
    "promotions": [{ "customerId": 5, "customer": "Maria Santos", "risk": "HIGH", "offer": "10% off next purchase + free item", "channel": "SMS / Messenger" }],
    "priorityActions": [{ "priority": "P1", "type": "RESTOCK", "message": "Order 51 units within 3 days.", "impact": "Avoid lost sales on Indomie Chicken 65g" }],
    "summary": { "totalRecommendedOrderCost": 5200, "estimatedMarketingRevenue": 81000 },
    "insights": ["9 restock orders recommended."]
  }
}
```

### `GET /analytics/overview?horizon=7`

Returns `{ descriptive, predictive, prescriptive, baChain }` in one call. The dashboard uses
this endpoint; `baChain` is the step-by-step explanation of how one stage feeds the next.

### `GET /analytics/marketing`

Returns `{ campaigns, channels }` from `v_campaign_performance` and the channel roll-up.

---

## 7. Reports

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reports/sales?from=&to=` | `summary`, `daily`, `products`, `generatedAt` |
| GET | `/reports/inventory?from=&to=` | `stock`, `valuation`, `movements`, `generatedAt` |

The React Reports page converts these datasets into downloadable CSV files in the browser.

---

## 8. Health check

`GET /api/health` (outside `/api/*` auth routes) returns
`{ "success": true, "message": "...", "database": "connected", "serverTime": "..." }`.
