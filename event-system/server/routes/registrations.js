// server/routes/registrations.js - Registrations Management Routes
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// POST /api/registrations - Participant registers for an event
router.post('/', requireAuth, requireRole('participant'), async (req, res, next) => {
  try {
    const { event_id } = req.body;
    const participant_id = req.user.participant_id;

    if (!event_id) {
      return res.status(400).json({ error: 'event_id is required' });
    }
    if (!participant_id) {
      return res.status(400).json({ error: 'Participant profile not found for this account' });
    }

    // Database trigger trg_capacity checks capacity limit.
    // Database unique constraint UNIQUE(participant_id, event_id) checks duplicates.
    const [result] = await query(`
      INSERT INTO registration (participant_id, event_id, status)
      VALUES (?, ?, 'Pending')
    `, [participant_id, parseInt(event_id, 10)]);

    res.status(201).json({
      registration_id: result.insertId,
      participant_id,
      event_id: parseInt(event_id, 10),
      status: 'Pending',
      message: 'Registration created successfully. Please complete payment if required.'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/registrations/me - Participant views their own registrations
router.get('/me', requireAuth, requireRole('participant'), async (req, res, next) => {
  try {
    const participant_id = req.user.participant_id;
    const [rows] = await query(`
      SELECT r.*,
        e.event_name, e.event_type, e.start_datetime, e.end_datetime, e.fee, e.description,
        v.venue_name, v.location AS venue_location,
        p.payment_id, p.amount AS payment_amount, p.payment_mode, p.status AS payment_status,
        ce.attendance_pct, ce.eligible AS certificate_eligible,
        fb.feedback_id, fb.rating AS feedback_rating, fb.comments AS feedback_comments
      FROM registration r
      JOIN event e ON r.event_id = e.event_id
      JOIN venue v ON e.venue_id = v.venue_id
      LEFT JOIN payment p ON p.registration_id = r.registration_id
      LEFT JOIN certificate_eligibility ce ON ce.registration_id = r.registration_id
      LEFT JOIN feedback fb ON fb.registration_id = r.registration_id
      WHERE r.participant_id = ?
      ORDER BY r.reg_date DESC
    `, [participant_id]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/registrations - Admin / Coordinator view all registrations (filter by event_id)
router.get('/', requireAuth, requireRole('admin', 'coordinator', 'management'), async (req, res, next) => {
  try {
    const { event_id, status } = req.query;
    let sql = `
      SELECT r.*,
        p.name AS participant_name, p.email AS participant_email, p.phone AS participant_phone, p.organization AS participant_organization,
        e.event_name, e.fee,
        pay.payment_id, pay.amount AS payment_amount, pay.payment_mode, pay.status AS payment_status,
        ce.attendance_pct, ce.eligible AS certificate_eligible
      FROM registration r
      JOIN participant p ON r.participant_id = p.participant_id
      JOIN event e ON r.event_id = e.event_id
      LEFT JOIN payment pay ON pay.registration_id = r.registration_id
      LEFT JOIN certificate_eligibility ce ON ce.registration_id = r.registration_id
    `;
    const params = [];
    const conditions = [];

    if (event_id) {
      conditions.push('r.event_id = ?');
      params.push(event_id);
    }
    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY r.reg_date DESC';

    const [rows] = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/registrations/:id - Cancel a registration
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const regId = req.params.id;
    const [regs] = await query('SELECT * FROM registration WHERE registration_id = ?', [regId]);
    if (regs.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const reg = regs[0];
    if (req.user.role === 'participant' && reg.participant_id !== req.user.participant_id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this registration.' });
    }

    // Set status to Cancelled (freeing up capacity)
    await query('UPDATE registration SET status = ? WHERE registration_id = ?', ['Cancelled', regId]);
    res.json({ message: 'Registration cancelled successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
