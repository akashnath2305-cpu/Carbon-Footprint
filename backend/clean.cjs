const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/carbon_footprint' });
pool.query("DELETE FROM carbon_logs WHERE category = 'system'").then(() => {
  console.log('Cleaned up old system logs');
  pool.end();
});
