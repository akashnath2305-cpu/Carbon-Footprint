import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

pool.on('error', (err) => {
  console.error('Unexpected error on inactive database client', err);
});

// Wrapper to retry queries if database is in recovery mode or disconnected
const originalQuery = pool.query;
pool.query = async function (...args) {
  let retries = 5;
  while (retries > 0) {
    try {
      return await originalQuery.apply(pool, args);
    } catch (err) {
      if (err.code === '57P03' || err.code === 'ECONNREFUSED') {
        retries -= 1;
        if (retries === 0) throw err;
        console.warn(`Database not ready (code ${err.code}). Retrying query in 2 seconds...`);
        await new Promise(res => setTimeout(res, 2000));
      } else {
        throw err;
      }
    }
  }
};

const originalConnect = pool.connect;
pool.connect = async function (...args) {
  let retries = 5;
  while (retries > 0) {
    try {
      return await originalConnect.apply(pool, args);
    } catch (err) {
      if (err.code === '57P03' || err.code === 'ECONNREFUSED') {
        retries -= 1;
        if (retries === 0) throw err;
        console.warn(`Database not ready (code ${err.code}). Retrying connect in 2 seconds...`);
        await new Promise(res => setTimeout(res, 2000));
      } else {
        throw err;
      }
    }
  }
};

export default pool;
