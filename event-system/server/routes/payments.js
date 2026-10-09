// server/routes/payments.js - Payment Recording with Atomic Transactions
const express = require('express');
const router = express.Router();
const { query, withTransaction } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// POST /api/payments - Record payment (and atomically confirm registration when Paid)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { registration_id, amount, payment_mode, status = 'Paid' } = req.body;

    if (!registration_id || amount === undefined || !payment_mode) {
      return res.status(400).json({ error: 'registration_id, amount, and payment_mode are required.' });
    }

    const numericAmount = parseFloat(amount);
    // Explicit check alongside DB CHECK constraint
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ error: 'Payment amount cannot be negative.' });
    }

    // Verify registration existence and permission
    const [regs] = await query('SELECT * FROM registration WHERE registration_id = ?', [registration_id]);
    if (regs.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const reg = regs[0];
    if (req.user.role === 'participant' && reg.participant_id !== req.user.participant_id) {
      return res.status(403).json({ error: 'Unauthorized to submit payment for this registration.' });
    }

    // Run payment recording and registration status update in ONE ATOMIC TRANSACTION
    const paymentRecord = await withTransaction(async (conn) => {
      // 1. Insert payment record (DB CHECK constraint ensures amount >= 0)
      const [payResult] = await conn.query(`
        INSERT INTO payment (registration_id, amount, payment_mode, status)
        VALUES (?, ?, ?, ?)
      `, [registration_id, numericAmount, payment_mode, status]);

      // 2. If status is 'Paid', update registration status to 'Confirmed'
      if (status === 'Paid') {
        await conn.query(`
          UPDATE registration
          SET status = 'Confirmed'
          WHERE registration_id = ?
        `, [registration_id]);
      }

      return {
        payment_id: payResult.insertId,
        registration_id,
        amount: numericAmount,
        payment_mode,
        status,
        registration_status: status === 'Paid' ? 'Confirmed' : reg.status
      };
    });

    res.status(201).json({
      message: 'Payment processed successfully',
      payment: paymentRecord
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments - Admin / Coordinator / Management list all payments
router.get('/', requireAuth, requireRole('admin', 'coordinator', 'management'), async (req, res, next) => {
  try {
    const { event_id, status } = req.query;
    let sql = `
      SELECT p.*,
        r.participant_id, r.event_id, r.status AS registration_status,
        part.name AS participant_name, part.email AS participant_email,
        e.event_name, e.fee AS event_fee
      FROM payment p
      JOIN registration r ON p.registration_id = r.registration_id
      JOIN participant part ON r.participant_id = part.participant_id
      JOIN event e ON r.event_id = e.event_id
    `;
    const params = [];
    const conditions = [];

    if (event_id) {
      conditions.push('r.event_id = ?');
      params.push(event_id);
    }
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY p.payment_date DESC';

    const [rows] = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/me - Participant payment history
router.get('/me', requireAuth, requireRole('participant'), async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT p.*, e.event_name, e.event_id
      FROM payment p
      JOIN registration r ON p.registration_id = r.registration_id
      JOIN event e ON r.event_id = e.event_id
      WHERE r.participant_id = ?
      ORDER BY p.payment_date DESC
    `, [req.user.participant_id]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
