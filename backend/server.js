import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getPersonalizedInsights, calculateDynamicFootprint } from './gemini.js';
import { calculateEmissions } from './utils/emissions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'carbon_footprint_super_secret_key';

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth routes
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs for general API routes
  message: { error: 'Too many API requests, please try again later.' }
});

app.use('/api/', apiLimiter);

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
}

// --- AUTHENTICATION ROUTES ---

// POST /api/auth/register - Register a new user
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Username, email, and password required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar_url, total_points, used_points, pending_points',
      [username, email, hashedPassword, avatarUrl]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Database error during registration.' });
  }
});

// POST /api/auth/login - Authenticate user
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username/Email and password required.' });

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
    if (userResult.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    // Remove password before sending to client
    delete user.password;
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error during login.' });
  }
});

// PUT /api/auth/avatar - Update user avatar
app.put('/api/auth/avatar', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { avatar_url } = req.body;
  if (!avatar_url) return res.status(400).json({ error: 'avatar_url required.' });
  try {
    const updateResult = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, email, avatar_url',
      [avatar_url, userId]
    );
    if (updateResult.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: updateResult.rows[0] });
  } catch (err) {
    console.error('Update avatar error:', err);
    res.status(500).json({ error: 'Database error updating avatar.' });
  }
});

// PUT /api/rewards/use - Use reward points
app.put('/api/rewards/use', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const points = parseInt(req.body.points, 10);
  
  if (isNaN(points) || points <= 0) {
    return res.status(400).json({ error: 'Valid points amount required.' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Use FOR UPDATE to lock the row and prevent race conditions during redemption
    const userResult = await client.query('SELECT total_points, used_points FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found.' });
    }
    
    const total = parseInt(userResult.rows[0].total_points || 0, 10);
    const used = parseInt(userResult.rows[0].used_points || 0, 10);
    const available = total - used;
    
    if (available < points) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough points.' });
    }
    
    const updateResult = await client.query(
      'UPDATE users SET used_points = used_points + $1 WHERE id = $2 RETURNING total_points, used_points',
      [points, userId]
    );
    
    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Use points error:', err);
    res.status(500).json({ error: 'Database error updating points.' });
  } finally {
    client.release();
  }
});

// PUT /api/rewards/earn - Earn reward points
app.put('/api/rewards/earn', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const points = parseInt(req.body.points, 10);
  
  if (isNaN(points) || points <= 0) {
    return res.status(400).json({ error: 'Valid points amount required.' });
  }
  
  try {
    const updateResult = await pool.query(
      'UPDATE users SET total_points = total_points + $1 WHERE id = $2 RETURNING total_points',
      [points, userId]
    );
    if (updateResult.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Earn points error:', err);
    res.status(500).json({ error: 'Database error updating points.' });
  }
});

// PUT /api/campaigns/join - Join campaign and get pending points
app.put('/api/campaigns/join', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { points } = req.body;
  if (!points || points <= 0) return res.status(400).json({ error: 'Valid points amount required.' });
  
  try {
    const updateResult = await pool.query(
      'UPDATE users SET pending_points = pending_points + $1 WHERE id = $2 RETURNING pending_points',
      [points, userId]
    );
    if (updateResult.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Join campaign error:', err);
    res.status(500).json({ error: 'Database error joining campaign.' });
  }
});

// --- PROTECTED ROUTES ---

// 1. GET /api/dashboard - Returns user's footprint summaries
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [totalQuery, breakdownQuery, logsQuery] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(carbon_emissions), 0) as total FROM carbon_logs WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT category, COALESCE(SUM(carbon_emissions), 0) as emissions, COALESCE(SUM(input_value), 0) as total_val 
         FROM carbon_logs 
         WHERE user_id = $1 
         GROUP BY category`,
        [userId]
      ),
      pool.query(
        `SELECT * FROM carbon_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 1000`,
        [userId]
      )
    ]);

    const totalEmissions = parseFloat(totalQuery.rows[0].total);

    res.json({
      userId,
      totalEmissions,
      breakdown: breakdownQuery.rows,
      recentLogs: logsQuery.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Database error fetching dashboard statistics' });
  }
});

// 2. POST /api/logs - Creates a new carbon activity log
app.post('/api/logs', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { category, subCategory, inputValue, unit } = req.body;

  if (!category || !subCategory || inputValue === undefined || !unit) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const emissions = calculateEmissions(category, subCategory, inputValue);

  try {
    const insertQuery = await pool.query(
      `INSERT INTO carbon_logs (user_id, category, sub_category, input_value, unit, carbon_emissions, logged_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, category, subCategory, inputValue, unit, emissions]
    );

    res.status(201).json(insertQuery.rows[0]);
  } catch (error) {
    console.error('Error creating activity log:', error);
    res.status(500).json({ error: 'Database error creating activity log' });
  }
});

// 3. GET /api/tips - Returns paginated eco tips (Public)
app.get('/api/tips', async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const tipsQuery = await pool.query(
      `SELECT * FROM eco_tips ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countQuery = await pool.query(`SELECT COUNT(*) FROM eco_tips`);
    const totalTips = parseInt(countQuery.rows[0].count);

    res.json({
      tips: tipsQuery.rows,
      hasMore: offset + limit < totalTips,
      total: totalTips
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({ error: 'Database error fetching tips' });
  }
});

// 4. GET /api/ai-insights - Fetches Gemini recommendations
app.get('/api/ai-insights', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const cachedQuery = await pool.query(
      `SELECT * FROM ai_insights 
       WHERE user_id = $1 AND created_at > CURRENT_TIMESTAMP - INTERVAL '15 minutes' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (cachedQuery.rows.length > 0) {
      console.log('Returning cached Gemini insights.');
      return res.json(cachedQuery.rows[0].insights);
    }

    const logsQuery = await pool.query(
      `SELECT category, sub_category, input_value, unit, carbon_emissions 
       FROM carbon_logs 
       WHERE user_id = $1 
       ORDER BY logged_at DESC LIMIT 30`,
      [userId]
    );

    const insights = await getPersonalizedInsights(logsQuery.rows);

    await pool.query(
      `INSERT INTO ai_insights (user_id, insights, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [userId, JSON.stringify(insights)]
    );

    res.json(insights);
  } catch (error) {
    console.error('Error handling AI insights endpoint:', error);
    res.status(500).json({ error: 'Failed to retrieve AI sustainability insights' });
  }
});

// 5. POST /api/calculate-footprint - Dynamically calculates footprint from raw wizard inputs via Gemini
app.post('/api/calculate-footprint', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const inputs = req.body;
  try {
    const result = await calculateDynamicFootprint(inputs);

    const sessionId = crypto.randomUUID();
    const details = JSON.stringify({ inputs, result });

    // Insert each category individually so the dashboard breakdown charts populate correctly
    for (const item of result.breakdown) {
      let cat = item.name.toLowerCase();
      if (cat === 'transport') cat = 'transportation';
      
      await pool.query(
        `INSERT INTO carbon_logs (user_id, category, sub_category, input_value, unit, carbon_emissions, logged_at, session_id, details)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8)`,
        [userId, cat, 'Dynamic Audit', 1, 'audit', item.emissions, sessionId, details]
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error calculating dynamic footprint:', error);
    res.status(500).json({ error: 'Failed to dynamically calculate footprint' });
  }
});

// 6. GET /api/history - Get all user history logs
app.get('/api/history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const logsQuery = await pool.query(
      `SELECT * FROM carbon_logs WHERE user_id = $1 ORDER BY logged_at DESC`,
      [userId]
    );
    res.json(logsQuery.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Database error fetching history' });
  }
});

// 7. DELETE /api/history/:id
app.delete('/api/history/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const logId = req.params.id;
  
  try {
    // Check if it's part of a session
    const logCheck = await pool.query('SELECT session_id FROM carbon_logs WHERE id = $1 AND user_id = $2', [logId, userId]);
    if (logCheck.rows.length === 0) return res.status(404).json({ error: 'Log not found' });
    
    const sessionId = logCheck.rows[0].session_id;
    if (sessionId) {
      await pool.query('DELETE FROM carbon_logs WHERE session_id = $1 AND user_id = $2', [sessionId, userId]);
    } else {
      await pool.query('DELETE FROM carbon_logs WHERE id = $1 AND user_id = $2', [logId, userId]);
    }
    
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ error: 'Database error deleting history' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
