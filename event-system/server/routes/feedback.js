// server/routes/feedback.js - Participant Event Feedback Routes
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// POST /api/feedback - Only for a registration the participant owns, only after attending
router.post('/', requireAuth, requireRole('participant'), async (req, res, next) => {
  try {
    const { registration_id, rating, comments } = req.body;

    if (!registration_id || rating === undefined) {
      return res.status(400).json({ error: 'registration_id and rating are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    // 1. Verify ownership of registration
    const [regs] = await query('SELECT * FROM registration WHERE registration_id = ?', [registration_id]);
    if (regs.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const reg = regs[0];
    if (reg.participant_id !== req.user.participant_id) {
      return res.status(403).json({ error: 'You can only submit feedback for your own registration.' });
    }

    // 2. Verify participant has attended (at least one session marked Present)
    const [att] = await query(
      "SELECT 1 FROM attendance WHERE registration_id = ? AND status = 'Present' LIMIT 1",
      [registration_id]
    );

    if (att.length === 0) {
      return res.status(400).json({
        error: 'Feedback can only be submitted after attending at least one session of the event.'
      });
    }

    // 3. Insert feedback (UNIQUE registration_id constraint prevents double submissions)
    const [result] = await query(`
      INSERT INTO feedback (registration_id, rating, comments)
      VALUES (?, ?, ?)
    `, [registration_id, numRating, comments ? comments.trim() : null]);

    res.status(201).json({
      feedback_id: result.insertId,
      registration_id,
      rating: numRating,
      comments,
      message: 'Thank you! Your feedback has been recorded.'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback/event/:id - View feedbacks for an event
router.get('/event/:id', async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT fb.*, p.name AS participant_name, r.event_id
      FROM feedback fb
      JOIN registration r ON fb.registration_id = r.registration_id
      JOIN participant p ON r.participant_id = p.participant_id
      WHERE r.event_id = ?
      ORDER BY fb.feedback_id DESC
    `, [req.params.id]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
