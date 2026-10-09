// server/routes/auth.js - Registration & Authentication Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { query, withTransaction } = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// Rate limiter for login endpoint (strict to prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP, please try again later.' }
});

// Helper to look up profile info based on user role
async function getProfileForUser(user_id, role) {
  if (role === 'participant') {
    const [rows] = await query('SELECT participant_id, name, phone, organization FROM participant WHERE user_id = ?', [user_id]);
    return rows[0] || {};
  } else if (role === 'coordinator') {
    const [rows] = await query('SELECT coordinator_id, name, phone FROM coordinator WHERE user_id = ?', [user_id]);
    return rows[0] || {};
  } else if (role === 'speaker') {
    const [rows] = await query('SELECT speaker_id, name, phone, organization FROM speaker WHERE user_id = ?', [user_id]);
    return rows[0] || {};
  }
  return {};
}

// POST /api/auth/register (Participants only)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone, organization } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await withTransaction(async (conn) => {
      // 1. Insert into users
      const [userResult] = await conn.query(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email.trim().toLowerCase(), password_hash, 'participant']
      );
      const user_id = userResult.insertId;

      // 2. Insert into participant
      const [partResult] = await conn.query(
        'INSERT INTO participant (user_id, name, email, phone, organization) VALUES (?, ?, ?, ?, ?)',
        [user_id, name.trim(), email.trim().toLowerCase(), phone || null, organization || null]
      );
      const participant_id = partResult.insertId;

      return { user_id, participant_id };
    });

    const userObj = {
      user_id: result.user_id,
      email: email.trim().toLowerCase(),
      role: 'participant',
      name: name.trim(),
      participant_id: result.participant_id
    };

    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const profile = await getProfileForUser(user.user_id, user.role);

    const userObj = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: profile.name || (user.role === 'admin' ? 'Administrator' : 'Management Officer'),
      participant_id: profile.participant_id,
      coordinator_id: profile.coordinator_id,
      speaker_id: profile.speaker_id,
      organization: profile.organization
    };

    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const profile = await getProfileForUser(req.user.user_id, req.user.role);
    res.json({
      user: {
        ...req.user,
        ...profile
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
