import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool();

async function migrate() {
  try {
    await pool.query('ALTER TABLE carbon_logs ADD COLUMN session_id TEXT;');
    console.log('Migration successful: session_id added');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column session_id already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    pool.end();
  }
}

migrate();
