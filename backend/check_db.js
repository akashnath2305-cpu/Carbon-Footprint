import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool();

async function check() {
  try {
    const res = await pool.query('SELECT * FROM carbon_logs ORDER BY id DESC LIMIT 5;');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
