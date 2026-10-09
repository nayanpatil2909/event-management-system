// server/routes/sessions.js - Sessions Management Routes
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/sessions - List sessions (filter by event_id or speaker_id)
router.get('/', async (req, res, next) => {
  try {
    const { event_id, speaker_id } = req.query;
    let sql = `
      SELECT s.*, e.event_name, e.event_type,
        sp.name AS speaker_name, sp.email AS speaker_email, sp.organization AS speaker_organization
      FROM session s
      JOIN event e ON s.event_id = e.event_id
      JOIN speaker sp ON s.speaker_id = sp.speaker_id
    `;
    const params = [];
    const conditions = [];

    if (event_id) {
      conditions.push('s.event_id = ?');
      params.push(event_id);
    }
    if (speaker_id) {
      conditions.push('s.speaker_id = ?');
      params.push(speaker_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY s.session_date ASC, s.start_time ASC';

    const [rows] = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/speaker/me - Speaker views only their own sessions
router.get('/speaker/me', requireAuth, requireRole('speaker'), async (req, res, next) => {
  try {
    const speakerId = req.user.speaker_id;
    if (!speakerId) {
      return res.status(403).json({ error: 'Speaker profile not found.' });
    }

    const [rows] = await query(`
      SELECT s.*, e.event_name, e.event_type, e.description AS event_description,
        v.venue_name, v.location AS venue_location
      FROM session s
      JOIN event e ON s.event_id = e.event_id
      JOIN venue v ON e.venue_id = v.venue_id
      WHERE s.speaker_id = ?
      ORDER BY s.session_date ASC, s.start_time ASC
    `, [speakerId]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions - Admin / Coordinator only
router.post('/', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const { event_id, speaker_id, session_title, session_date, start_time, end_time } = req.body;
    if (!event_id || !speaker_id || !session_title || !session_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'All session fields are required.' });
    }

    const [result] = await query(`
      INSERT INTO session (event_id, speaker_id, session_title, session_date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [event_id, speaker_id, session_title.trim(), session_date, start_time, end_time]);

    res.status(201).json({
      session_id: result.insertId,
      message: 'Session created successfully'
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sessions/:id - Admin / Coordinator, or Speaker editing their OWN session
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const { session_title, session_date, start_time, end_time, speaker_id } = req.body;

    const [sessions] = await query('SELECT * FROM session WHERE session_id = ?', [sessionId]);
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const currentSession = sessions[0];

    // If speaker, verify they own the session
    if (req.user.role === 'speaker') {
      if (currentSession.speaker_id !== req.user.speaker_id) {
        return res.status(403).json({ error: 'You are only permitted to edit your own sessions.' });
      }

      // Speaker can only update title, date, start_time, end_time
      await query(`
        UPDATE session
        SET session_title = ?, session_date = ?, start_time = ?, end_time = ?
        WHERE session_id = ?
      `, [
        session_title ? session_title.trim() : currentSession.session_title,
        session_date || currentSession.session_date,
        start_time || currentSession.start_time,
        end_time || currentSession.end_time,
        sessionId
      ]);
      return res.json({ message: 'Session updated successfully' });
    }

    // Admin and Coordinator can edit everything
    if (req.user.role === 'admin' || req.user.role === 'coordinator') {
      await query(`
        UPDATE session
        SET session_title = ?, session_date = ?, start_time = ?, end_time = ?, speaker_id = ?
        WHERE session_id = ?
      `, [
        session_title ? session_title.trim() : currentSession.session_title,
        session_date || currentSession.session_date,
        start_time || currentSession.start_time,
        end_time || currentSession.end_time,
        speaker_id || currentSession.speaker_id,
        sessionId
      ]);
      return res.json({ message: 'Session updated successfully' });
    }

    return res.status(403).json({ error: 'Unauthorized to edit sessions.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sessions/:id - Admin / Coordinator only
router.delete('/:id', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const [result] = await query('DELETE FROM session WHERE session_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
