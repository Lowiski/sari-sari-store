-- =====================================================================
-- SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM
-- schema.sql
-- Target: PostgreSQL on Neon (serverless). Core PostgreSQL only.
--
-- Run this FIRST (before seed.sql, then views.sql).
-- The DROP TABLE IF EXISTS ... CASCADE statements are ordered from
-- children to parents and make the script re-runnable; dependent views
-- are dropped too and are recreated by views.sql with CREATE OR REPLACE.
-- =====================================================================

DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;

-- ---------------------------------------------------------------------
-- Application users / authentication
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'staff',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Product catalog
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE products (
    id            SERIAL PRIMARY KEY,
    sku           VARCHAR(30) UNIQUE NOT NULL,
    name          VARCHAR(100) NOT NULL,
    category_id   INT NOT NULL REFERENCES categories(id),
    unit          VARCHAR(20) NOT NULL DEFAULT 'pc',
    price         NUMERIC(10,2) NOT NULL,
    cost          NUMERIC(10,2) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------
CREATE TABLE customers (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    phone         VARCHAR(20),
    email         VARCHAR(100),
    address       TEXT,
    customer_type VARCHAR(20) NOT NULL DEFAULT 'walk-in',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Sales transactions
-- ---------------------------------------------------------------------
CREATE TABLE sales (
    id             SERIAL PRIMARY KEY,
    invoice_no     VARCHAR(30) UNIQUE NOT NULL,
    customer_id    INT REFERENCES customers(id),
    sale_date      DATE NOT NULL,
    subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount       NUMERIC(12,2) NOT NULL DEFAULT 0,
    total          NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sale_items (
    id         SERIAL PRIMARY KEY,
    sale_id    INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity   INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL
);

-- ---------------------------------------------------------------------
-- Stock movements: on-hand = SUM(IN) - SUM(OUT)
-- ---------------------------------------------------------------------
CREATE TABLE inventory_transactions (
    id         SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id),
    txn_type   VARCHAR(4) NOT NULL CHECK (txn_type IN ('IN','OUT')),
    quantity   INT NOT NULL CHECK (quantity > 0),
    reference  VARCHAR(60),
    txn_date   DATE NOT NULL,
    note       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Marketing campaigns
-- ---------------------------------------------------------------------
CREATE TABLE marketing_campaigns (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    channel     VARCHAR(30) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    budget      NUMERIC(12,2) NOT NULL,
    impressions INT NOT NULL DEFAULT 0,
    clicks      INT NOT NULL DEFAULT 0,
    conversions INT NOT NULL DEFAULT 0,
    revenue     NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Indexes on frequently filtered / joined columns
-- ---------------------------------------------------------------------
CREATE INDEX idx_sales_sale_date                  ON sales (sale_date);
CREATE INDEX idx_sales_customer_id                ON sales (customer_id);
CREATE INDEX idx_sale_items_sale_id               ON sale_items (sale_id);
CREATE INDEX idx_sale_items_product_id            ON sale_items (product_id);
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions (product_id);
CREATE INDEX idx_inventory_transactions_txn_date   ON inventory_transactions (txn_date);
