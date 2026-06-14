import fs from 'fs';
import pool from './db.js';

const sql = fs.readFileSync('db_init.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Database initialized successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });
