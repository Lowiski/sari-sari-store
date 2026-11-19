import { Pool, neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

// Node 18/20 do not expose a global WebSocket that @neondatabase/serverless can use.
neonConfig.webSocketConstructor = WebSocket;

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Copy backend/.env.example to backend/.env and paste your Neon connection string.'
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/**
 * Thin wrapper around pool.query with optional slow-query logging.
 * @param {string} text SQL text with $1, $2 ... placeholders
 * @param {unknown[]} params
 */
export async function query(text, params = []) {
  const started = Date.now();
  try {
    const result = await pool.query(text, params);
    const elapsed = Date.now() - started;
    if (elapsed > 1000) {
      console.warn(`[db] slow query (${elapsed}ms): ${text.slice(0, 160)}`);
    }
    return result;
  } catch (error) {
    console.error('[db] query failed:', error.message);
    throw error;
  }
}

/** Run several statements in one transaction; callback receives query function. */
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function healthCheck() {
  const result = await query('SELECT 1 AS ok, NOW() AS server_time');
  return result.rows[0];
}
