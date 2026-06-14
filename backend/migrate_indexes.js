import pool from './db.js';

async function migrate() {
  try {
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_carbon_logs_user_id ON carbon_logs(user_id);`);
    console.log('Indexes created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
