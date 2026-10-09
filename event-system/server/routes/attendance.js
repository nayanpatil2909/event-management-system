// server/routes/attendance.js - Attendance Tracking Routes
const express = require('express');
const router = express.Router();
const { query, withTransaction } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/attendance/session/:id - View registered participants and marked attendance for a session
router.get('/session/:id', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    // Get session info and its event
    const [sessions] = await query(`
      SELECT s.*, e.event_name, e.event_id
      FROM session s
      JOIN event e ON s.event_id = e.event_id
      WHERE s.session_id = ?
    `, [sessionId]);

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const session = sessions[0];

    // Get all confirmed participants for this event with attendance record for this session (if any)
    const [participants] = await query(`
      SELECT r.registration_id, r.participant_id, r.status AS registration_status,
        p.name AS participant_name, p.email AS participant_email, p.phone AS participant_phone,
        a.attendance_id, a.status AS attendance_status
      FROM registration r
      JOIN participant p ON r.participant_id = p.participant_id
      LEFT JOIN attendance a ON a.registration_id = r.registration_id AND a.session_id = ?
      WHERE r.event_id = ? AND r.status <> 'Cancelled'
      ORDER BY p.name ASC
    `, [sessionId, session.event_id]);

    res.json({
      session,
      participants
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance - Bulk mark attendance for a session
router.post('/', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const { session_id, records } = req.body;

    if (!session_id || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'session_id and records array are required.' });
    }

    // Verify session exists
    const [sessions] = await query('SELECT session_id FROM session WHERE session_id = ?', [session_id]);
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await withTransaction(async (conn) => {
      for (const rec of records) {
        const { registration_id, status } = rec;
        if (!registration_id || !['Present', 'Absent'].includes(status)) {
          continue;
        }

        // Upsert attendance record using ON DUPLICATE KEY UPDATE
        await conn.query(`
          INSERT INTO attendance (registration_id, session_id, status)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE status = VALUES(status)
        `, [registration_id, session_id, status]);
      }
    });

    res.json({
      message: 'Attendance successfully saved for session.',
      updated_count: records.length
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
