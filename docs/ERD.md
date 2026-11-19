# Entity Relationship Diagram (ERD)

## SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM

The diagram below shows all database tables and their relationships. It is written in Mermaid `erDiagram` syntax and can be rendered directly in Markdown viewers that support Mermaid.

```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : "groups"
    CUSTOMERS ||--o{ SALES : "places"
    USERS ||--o{ SALES : "records"
    PRODUCTS ||--o{ SALE_ITEMS : "appears in"
    SALES ||--o{ SALE_ITEMS : "contains"
    PRODUCTS ||--o{ INVENTORY_TRANSACTIONS : "moves"

    CATEGORIES {
        int id PK
        varchar name
        varchar description
    }

    PRODUCTS {
        int id PK
        varchar sku
        varchar name
        int category_id FK
        varchar unit
        numeric price
        numeric cost
        int reorder_level
        boolean is_active
        timestamp created_at
    }

    CUSTOMERS {
        int id PK
        varchar name
        varchar phone
        varchar email
        varchar address
        varchar customer_type
        timestamp created_at
    }

    USERS {
        int id PK
        varchar username
        varchar password_hash
        varchar role
        timestamp created_at
    }

    SALES {
        int id PK
        varchar invoice_no
        int customer_id FK
        int user_id FK
        date sale_date
        numeric subtotal
        numeric discount
        numeric total
        varchar payment_method
        timestamp created_at
    }

    SALE_ITEMS {
        int id PK
        int sale_id FK
        int product_id FK
        int quantity
        numeric unit_price
        numeric line_total
    }

    INVENTORY_TRANSACTIONS {
        int id PK
        int product_id FK
        varchar txn_type
        int quantity
        varchar reference
        date txn_date
        text note
        timestamp created_at
    }

    MARKETING_CAMPAIGNS {
        int id PK
        varchar name
        varchar channel
        date start_date
        date end_date
        numeric budget
        int impressions
        int clicks
        int conversions
        numeric revenue
        timestamp created_at
    }
```

---

## Relationship Summary

| Relationship | Cardinality | Meaning |
|---|---|---|
| CATEGORIES → PRODUCTS | 1 : many | One category groups many products |
| CUSTOMERS → SALES | 1 : many | One customer can place many sales; a walk-in sale may have no customer |
| USERS → SALES | 1 : many | One user can record many sales |
| SALES → SALE_ITEMS | 1 : many | One sale contains many line items |
| PRODUCTS → SALE_ITEMS | 1 : many | One product can appear in many sale items |
| PRODUCTS → INVENTORY_TRANSACTIONS | 1 : many | One product has many stock movements |
| MARKETING_CAMPAIGNS | standalone | Independent fact table used for ROAS and budget analytics |

**Notes:**

- `txn_type` is constrained to `IN` or `OUT`.
- Quantity on hand is derived as `SUM(quantity) WHERE txn_type = 'IN'` minus `SUM(quantity) WHERE txn_type = 'OUT'` per product.
- `sale_items.unit_price` preserves the price at the time of sale; `line_total = quantity * unit_price`.
- `marketing_campaigns` has no foreign key because campaign results are recorded at the channel/campaign level, not tied to individual sales in this version.
