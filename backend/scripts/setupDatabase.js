/**
 * Applies database/schema.sql, seed.sql and views.sql to the Neon database
 * configured by backend/.env. Equivalent to pasting the three files into the
 * Neon SQL Editor, but runnable from the command line.
 */
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/config/database.js';

const here = dirname(fileURLToPath(import.meta.url));
const databaseDir = resolve(here, '../../database');
const files = ['schema.sql', 'seed.sql', 'views.sql'];

try {
  for (const file of files) {
    const sql = await readFile(resolve(databaseDir, file), 'utf8');
    process.stdout.write(`Applying ${file}... `);
    await pool.query(sql);
    console.log('done');
  }

  const { rows } = await pool.query(`
    SELECT 'users' AS table_name, COUNT(*)::int AS records FROM users
    UNION ALL SELECT 'categories', COUNT(*)::int FROM categories
    UNION ALL SELECT 'products', COUNT(*)::int FROM products
    UNION ALL SELECT 'customers', COUNT(*)::int FROM customers
    UNION ALL SELECT 'sales', COUNT(*)::int FROM sales
    UNION ALL SELECT 'sale_items', COUNT(*)::int FROM sale_items
    UNION ALL SELECT 'inventory_transactions', COUNT(*)::int FROM inventory_transactions
    UNION ALL SELECT 'marketing_campaigns', COUNT(*)::int FROM marketing_campaigns
    ORDER BY table_name
  `);
  console.log('\nDatabase ready:');
  console.table(rows);
} catch (error) {
  console.error('\nDatabase setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
