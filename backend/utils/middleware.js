import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'carbon_footprint_super_secret_key';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  // Harden token verification by explicitly checking the signature algorithm
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
}

export function globalErrorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
}
