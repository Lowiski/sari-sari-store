-- =====================================================================
-- SARI-SARI STORE SALES AND INVENTORY ANALYTICS SYSTEM
-- seed.sql
-- Deterministic demo data, generated with generate_series + arrays.
-- Run AFTER schema.sql and BEFORE views.sql.
--
-- Produced: 1 admin user, 6 categories, 60 products, 60 customers,
-- 180 sales, 300 sale_items, 300 inventory_transactions, 60 campaigns.
-- All dates are relative to CURRENT_DATE (last ~90 days).
-- The whole script is one transaction: TRUNCATE ... RESTART IDENTITY
-- makes a re-run safe and keeps every SERIAL sequence in sync.
-- =====================================================================

BEGIN;

-- Clear in one shot; RESTART IDENTITY resets all sequences to 1.
TRUNCATE TABLE
    sale_items,
    inventory_transactions,
    sales,
    products,
    customers,
    marketing_campaigns,
    categories,
    users
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------
-- Admin user (password: admin123, bcrypt cost 10)
-- ---------------------------------------------------------------------
INSERT INTO users (username, password_hash, role)
VALUES (
    'admin',
    '$2b$10$98Vhc3LPP1rLp0F7yAoJ0e.GzqzKQxP7iB7Y5dQZR3fHb1FhHqKlm',
    'admin'
)
ON CONFLICT (username) DO NOTHING;

-- ---------------------------------------------------------------------
-- 6 categories
-- ---------------------------------------------------------------------
INSERT INTO categories (name, description) VALUES
    ('Beverages',               'Soft drinks, beer, iced tea and bottled water'),
    ('Instant Noodles',         'Instant noodle packs and cups'),
    ('Snacks',                  'Biscuits, chips, crackers and candies'),
    ('Canned Goods',            'Canned fish, meat, corn and fruit'),
    ('Household & Personal Care','Soap, detergent, toothpaste and shampoo'),
    ('Tobacco & Miscellaneous', 'Cigarettes, lighters, matches and sundries')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------
-- 60 products (realistic Philippine sari-sari store items)
-- Category bands: 1-12 Beverages, 13-24 Noodles, 25-36 Snacks,
-- 37-48 Canned Goods, 49-54 Household, 55-60 Tobacco & Misc.
-- ---------------------------------------------------------------------
WITH product_source AS (
    SELECT
        g,
        (ARRAY[
            'San Miguel Beer 500ml','San Miguel Light 500ml','Coca-Cola 500ml',
            'Coca-Cola Zero 500ml','Pepsi-Cola 500ml','Sprite 500ml',
            'Royal Tru-Orange 500ml','Nestea Iced Tea 500ml','Lipton Iced Tea 500ml',
            'Minute Maid Orange Juice 1L','Absolute Distilled Water 1L',
            'Wilkins Distilled Water 1L',
            'Indomie Chicken 65g','Indomie Beef 65g','Lucky Me Chicken Macaroni 55g',
            'Lucky Me Pancit Canton 60g','Lucky Me Creamy Chicken 55g',
            'Maggi Chicken Noodles 55g','Nissin Cup Noodles 75g',
            'Nissin Crash Noodles 60g','Payless Instant Noodles 55g',
            'Betchoy Noodles 60g','Quick Chick Noodles 55g','Supreme Instant Noodles 60g',
            'Rebisco Crackers 66g','Rebisco Cream Crackers 100g',
            'Khong Guan Biscuits 200g','Hwa Tai Cream Crackers 250g',
            'Piattos Cheese 85g','Chicharon NCLASS 80g','Doritos Cheese 90g',
            'Lay''s Classic Chips 85g','Nova Chips Barbecue 85g',
            'Jack ''n Jill Chips 90g','M&M''s Candies 45g','Skittles Candies 45g',
            'San Miguel Corned Beef 100g','Argentina Corned Beef 150g',
            'Century Tuna 155g','ABC Tuna 155g','555 Sardines 155g',
            'Mega Sardines 155g','Ligo Sardines 155g','GMA Sardines 155g',
            'Del Monte Pineapple Rings 227g','Libby''s Whole Corn 425g',
            'Bear Brand Swiss Midge 390g','Ovaltine 400g',
            'Safeguard Soap 135g','Dove Soap 100g','Surf Excel Detergent 500g',
            'Tide Detergent 500g','Colgate Toothpaste 150ml',
            'Head & Shoulders Shampoo 200ml',
            'Marlboro Cigarettes 20s','Philip Morris Cigarettes 20s',
            'Lucky Strike Cigarettes 20s','Camel Cigarettes 20s',
            'Disposable Lighter','Tipco Matchbox'
        ])[g] AS product_name,
        CASE
            WHEN g <= 12 THEN 'Beverages'
            WHEN g <= 24 THEN 'Instant Noodles'
            WHEN g <= 36 THEN 'Snacks'
            WHEN g <= 48 THEN 'Canned Goods'
            WHEN g <= 54 THEN 'Household & Personal Care'
            ELSE 'Tobacco & Miscellaneous'
        END AS category_name,
        CASE
            WHEN g <= 12 THEN 'bottle'
            WHEN g <= 36 THEN 'pack'
            WHEN g <= 48 THEN 'can'
            ELSE 'pc'
        END AS unit,
        (ARRAY[
            55.00,55.00,35.00,35.00,33.00,33.00,32.00,35.00,35.00,89.00,
            25.00,25.00,
            18.00,18.00,16.00,18.00,16.00,16.00,32.00,18.00,14.00,15.00,
            15.00,15.00,
            22.00,30.00,65.00,70.00,45.00,48.00,55.00,55.00,35.00,35.00,
            35.00,35.00,
            45.00,65.00,65.00,60.00,45.00,42.00,42.00,40.00,65.00,55.00,
            120.00,180.00,
            45.00,55.00,95.00,99.00,75.00,130.00,
            160.00,150.00,150.00,145.00,20.00,5.00
        ])[g] AS price,
        'SKU-' || LPAD(g::text, 4, '0') AS sku,
        10 + (g % 5) * 5 AS reorder_level
    FROM generate_series(1, 60) AS g
)
INSERT INTO products (sku, name, category_id, unit, price, cost, reorder_level)
SELECT
    ps.sku,
    ps.product_name,
    c.id,
    ps.unit,
    ps.price,
    ROUND(ps.price * (0.72 + ((ps.g - 1) % 4) * 0.03), 2),
    ps.reorder_level
FROM product_source ps
JOIN categories c ON c.name = ps.category_name
ON CONFLICT (sku) DO NOTHING;

-- ---------------------------------------------------------------------
-- 60 customers (Filipino names)
-- ---------------------------------------------------------------------
WITH customer_source AS (
    SELECT
        g,
        (ARRAY[
            'Juan Dela Cruz','Maria Santos','Jose Reyes','Ana Garcia',
            'Pedro Martinez','Liza Fernandez','Ronald Gonzales','Jennifer Perez',
            'Michael Torres','Carmela Ramos','Ricardo Flores','Rosario Mendoza',
            'Francisco Gutierrez','Imelda Castillo','Antonio Silva',
            'Lorna Villanueva','Eduardo Romero','Milagros Bautista',
            'Rogelio Navarro','Nenita Salazar','Freddie Marquez','Cristina Delgado',
            'Danilo Guerrero','Erlinda Castro','Gerardo Pascual','Felicidad Herrera',
            'Ignacio Rojas','Jocelyn Medina','Katrina Aguilar','Leonardo Vargas',
            'Marcelino Bernardo','Norma Fajardo','Orlando Soriano','Perla Villareal',
            'Quirino Lazaro','Remedios Campos','Salvador Rivera','Teresita Gonzaga',
            'Valentino Cruz','Victoria Lim','Wilfredo Tan','Yolanda Sy',
            'Zosimo Aquino','Rosemarie Chua','Eugene Ong','Shirley Uy',
            'Franklin Co','Josephine Tan','Arnold Legaspi','Divina Mercado',
            'Ramon Espiritu','Susana Trinidad','Teodoro Gallardo','Angelica Salcedo',
            'Bernardo Tuazon','Corazon Meneses','Dexter Pangilinan','Edna Villamor',
            'Fidel Estrella','Gloria Mayoralgo'
        ])[g] AS full_name
    FROM generate_series(1, 60) AS g
)
INSERT INTO customers (name, phone, email, address, customer_type, created_at)
SELECT
    full_name,
    '09' || LPAD(((g * 137) % 1000000000)::text, 9, '0'),
    LOWER(SPLIT_PART(full_name, ' ', 1)) || g::text || '@example.ph',
    'Brgy. '
        || (ARRAY['San Jose','Santa Cruz','Poblacion','Mabini','Rizal','Burgos',
                  'Gandara','Bagong Bayan','Dona Imelda','Sampaloc'])[(g % 10) + 1]
        || ', '
        || (ARRAY['Manila','Quezon City','Makati','Pasig','Taguig','Marikina',
                  'Caloocan','Paranaque','Las Pinas','Muntinlupa'])[(g % 10) + 1],
    (ARRAY['walk-in','regular','wholesale','walk-in','regular'])[(g % 5) + 1],
    NOW() - ((g % 60) || ' days')::interval
FROM customer_source;

-- ---------------------------------------------------------------------
-- 180 sales across the last 90 days (2 sales per calendar day)
-- ---------------------------------------------------------------------
INSERT INTO sales (invoice_no, customer_id, sale_date, payment_method)
SELECT
    'INV-' || TO_CHAR(CURRENT_DATE - ((g - 1) / 2), 'YYYYMMDD')
            || '-' || LPAD(g::text, 4, '0'),
    ((g - 1) % 60) + 1,
    CURRENT_DATE - ((g - 1) / 2),
    (ARRAY['cash','cash','gcash','maya','credit'])[(g % 5) + 1]
FROM generate_series(1, 180) AS g;

-- ---------------------------------------------------------------------
-- 300 sale items: sales 1-120 get 2 lines, sales 121-180 get 1 line.
-- The +7 offset keeps the two lines of a sale on different products.
-- ---------------------------------------------------------------------
WITH item_source AS (
    SELECT
        g,
        ((g - 1) % 180) + 1 AS sale_id,
        (1 + (g % 5)) AS quantity,
        (((g * 17) + CASE WHEN g > 180 THEN 7 ELSE 0 END) % 60) + 1 AS product_id
    FROM generate_series(1, 300) AS g
)
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
SELECT
    i.sale_id,
    i.product_id,
    i.quantity,
    p.price,
    ROUND(p.price * i.quantity, 2)
FROM item_source i
JOIN products p ON p.id = i.product_id;

-- ---------------------------------------------------------------------
-- Recompute sales totals from the lines so every sale is consistent:
-- subtotal = SUM(line_total), discount = 0/2%/5% by sale id,
-- total = subtotal - discount.
-- ---------------------------------------------------------------------
UPDATE sales AS s
SET subtotal = agg.subtotal,
    discount = agg.discount,
    total    = agg.subtotal - agg.discount
FROM (
    SELECT
        si.sale_id,
        SUM(si.line_total) AS subtotal,
        ROUND(
            SUM(si.line_total) *
            CASE
                WHEN si.sale_id % 10 = 0 THEN 0.05
                WHEN si.sale_id % 7  = 0 THEN 0.02
                ELSE 0
            END,
            2
        ) AS discount
    FROM sale_items AS si
    GROUP BY si.sale_id
) AS agg
WHERE s.id = agg.sale_id;

-- ---------------------------------------------------------------------
-- 300 inventory transactions: opening stock for all 60 products plus
-- 240 subsequent receipts / withdrawals. Stock on hand stays positive.
-- ---------------------------------------------------------------------
INSERT INTO inventory_transactions
    (product_id, txn_type, quantity, reference, txn_date, note)
SELECT
    CASE WHEN g <= 60 THEN g ELSE ((g - 61) % 60) + 1 END,
    CASE WHEN g <= 60 OR g % 2 = 0 THEN 'IN' ELSE 'OUT' END,
    CASE
        WHEN g <= 60 THEN 50 + (g % 5) * 10
        WHEN g % 2 = 0 THEN 10 + (g % 10)
        ELSE 1 + (g % 5)
    END,
    CASE
        WHEN g <= 60 THEN 'OPENING-STOCK'
        WHEN g % 2 = 0 THEN 'PO-' || LPAD(g::text, 5, '0')
        ELSE 'INV-' || LPAD(g::text, 5, '0')
    END,
    CURRENT_DATE - ((g * 3) % 90),
    CASE WHEN g <= 60 THEN 'Opening stock count' ELSE NULL END
FROM generate_series(1, 300) AS g;

-- ---------------------------------------------------------------------
-- 60 marketing campaigns across Facebook / Messenger / Tiktok / SMS /
-- In-store, all within the last ~80 days.
-- ---------------------------------------------------------------------
WITH campaign_source AS (
    SELECT
        g,
        (ARRAY['Facebook','Messenger','Tiktok','SMS','In-store'])[(g % 5) + 1] AS channel,
        CURRENT_DATE - ((g * 2) % 80) AS start_date,
        ((g * 13) % 45) + 3 AS duration
    FROM generate_series(1, 60) AS g
)
INSERT INTO marketing_campaigns
    (name, channel, start_date, end_date, budget, impressions, clicks, conversions, revenue)
SELECT
    channel || ' Promo #' || LPAD(g::text, 2, '0'),
    channel,
    start_date,
    start_date + duration,
    ROUND((500 + (g * 137) % 9500)::numeric, 2),
    1000 + (g * 733) % 50000,
    50 + (g * 47) % 5000,
    5 + (g * 11) % 500,
    ROUND(((5 + (g * 11) % 500) * (80 + (g * 7) % 220))::numeric, 2)
FROM campaign_source;

COMMIT;
