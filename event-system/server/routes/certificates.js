// server/routes/certificates.js - Certificate Eligibility Routes
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/certificates/me - Participant views certificate eligibility for their events
router.get('/me', requireAuth, requireRole('participant'), async (req, res, next) => {
  try {
    const participant_id = req.user.participant_id;

    const [rows] = await query(`
      SELECT ce.*,
        e.event_name, e.event_type, e.start_datetime, e.end_datetime,
        v.venue_name,
        p.name AS participant_name, p.email AS participant_email
      FROM certificate_eligibility ce
      JOIN event e ON ce.event_id = e.event_id
      JOIN venue v ON e.venue_id = v.venue_id
      JOIN participant p ON ce.participant_id = p.participant_id
      WHERE ce.participant_id = ?
      ORDER BY e.start_datetime DESC
    `, [participant_id]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/certificates/event/:id - Admin / Coordinator / Management view eligibility for an event
router.get('/event/:id', requireAuth, requireRole('admin', 'coordinator', 'management'), async (req, res, next) => {
  try {
    const eventId = req.params.id;

    const [rows] = await query(`
      SELECT ce.*,
        p.name AS participant_name, p.email AS participant_email, p.phone AS participant_phone, p.organization AS participant_organization,
        e.event_name
      FROM certificate_eligibility ce
      JOIN participant p ON ce.participant_id = p.participant_id
      JOIN event e ON ce.event_id = e.event_id
      WHERE ce.event_id = ?
      ORDER BY p.name ASC
    `, [eventId]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
