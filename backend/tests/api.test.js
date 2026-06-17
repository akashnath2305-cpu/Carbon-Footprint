import request from 'supertest';
import app from '../server.js';
import pool from '../db.js';

describe('API Routes', () => {
  afterAll(async () => {
    // Close the DB connection after tests
    await pool.end();
  });

  describe('GET /api/tips', () => {
    it('should return a list of eco tips', async () => {
      const response = await request(app).get('/api/tips?limit=2');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tips');
      expect(Array.isArray(response.body.tips)).toBe(true);
    });
  });

  describe('Auth Routes (Invalid)', () => {
    it('should fail to login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'invalid_user_test123', password: 'wrongpassword' });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication for protected routes', async () => {
      const response = await request(app).get('/api/dashboard');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access denied. No token provided.');
    });
  });
});
