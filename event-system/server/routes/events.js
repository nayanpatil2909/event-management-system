// server/routes/events.js - Events Management Routes
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/events - Public list of events
router.get('/', async (req, res, next) => {
  try {
    const { type, timeframe } = req.query;
    let sql = `
      SELECT e.*,
        v.venue_name, v.location AS venue_location, v.capacity,
        c.name AS coordinator_name, c.email AS coordinator_email,
        COUNT(DISTINCT CASE WHEN r.status <> 'Cancelled' THEN r.registration_id END) AS registered_count,
        (v.capacity - COUNT(DISTINCT CASE WHEN r.status <> 'Cancelled' THEN r.registration_id END)) AS seats_left,
        COUNT(DISTINCT s.session_id) AS session_count,
        ROUND(AVG(fb.rating), 1) AS avg_rating,
        COUNT(DISTINCT fb.feedback_id) AS feedback_count
      FROM event e
      JOIN venue v ON e.venue_id = v.venue_id
      JOIN coordinator c ON e.coordinator_id = c.coordinator_id
      LEFT JOIN registration r ON r.event_id = e.event_id
      LEFT JOIN session s ON s.event_id = e.event_id
      LEFT JOIN feedback fb ON fb.registration_id = r.registration_id
    `;

    const whereClauses = [];
    const params = [];

    if (type) {
      whereClauses.push('e.event_type = ?');
      params.push(type);
    }
    if (timeframe === 'upcoming') {
      whereClauses.push('e.end_datetime >= NOW()');
    } else if (timeframe === 'past') {
      whereClauses.push('e.end_datetime < NOW()');
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' GROUP BY e.event_id ORDER BY e.start_datetime ASC';

    const [rows] = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id - Public event details with sessions and speakers
router.get('/:id', async (req, res, next) => {
  try {
    const [eventRows] = await query(`
      SELECT e.*,
        v.venue_name, v.location AS venue_location, v.capacity,
        c.name AS coordinator_name, c.email AS coordinator_email, c.phone AS coordinator_phone,
        COUNT(DISTINCT CASE WHEN r.status <> 'Cancelled' THEN r.registration_id END) AS registered_count,
        (v.capacity - COUNT(DISTINCT CASE WHEN r.status <> 'Cancelled' THEN r.registration_id END)) AS seats_left,
        ROUND(AVG(fb.rating), 1) AS avg_rating
      FROM event e
      JOIN venue v ON e.venue_id = v.venue_id
      JOIN coordinator c ON e.coordinator_id = c.coordinator_id
      LEFT JOIN registration r ON r.event_id = e.event_id
      LEFT JOIN feedback fb ON fb.registration_id = r.registration_id
      WHERE e.event_id = ?
      GROUP BY e.event_id
    `, [req.params.id]);

    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventRows[0];

    // Fetch associated sessions
    const [sessions] = await query(`
      SELECT s.*, sp.name AS speaker_name, sp.email AS speaker_email, sp.organization AS speaker_organization
      FROM session s
      JOIN speaker sp ON s.speaker_id = sp.speaker_id
      WHERE s.event_id = ?
      ORDER BY s.session_date ASC, s.start_time ASC
    `, [req.params.id]);

    event.sessions = sessions;
    res.json(event);
  } catch (err) {
    next(err);
  }
});

// POST /api/events - Admin / Coordinator only
router.post('/', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const {
      event_name, event_type, start_datetime, end_datetime,
      fee, description, venue_id, coordinator_id
    } = req.body;

    if (!event_name || !event_type || !start_datetime || !end_datetime || !venue_id) {
      return res.status(400).json({
        error: 'Event name, type, start time, end time, and venue are required.'
      });
    }

    // Default coordinator to logged in user if coordinator
    let coordId = coordinator_id;
    if (!coordId && req.user.role === 'coordinator' && req.user.coordinator_id) {
      coordId = req.user.coordinator_id;
    }
    if (!coordId) {
      // Pick first coordinator
      const [coords] = await query('SELECT coordinator_id FROM coordinator LIMIT 1');
      coordId = coords.length > 0 ? coords[0].coordinator_id : 1;
    }

    // Database triggers trg_venue_overlap_ins and check constraint will automatically enforce rules
    const [result] = await query(`
      INSERT INTO event (event_name, event_type, start_datetime, end_datetime, fee, description, venue_id, coordinator_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      event_name.trim(),
      event_type,
      start_datetime,
      end_datetime,
      parseFloat(fee || 0),
      description ? description.trim() : null,
      parseInt(venue_id, 10),
      parseInt(coordId, 10)
    ]);

    res.status(201).json({
      event_id: result.insertId,
      message: 'Event created successfully'
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/:id - Admin / Coordinator only
router.put('/:id', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const {
      event_name, event_type, start_datetime, end_datetime,
      fee, description, venue_id, coordinator_id
    } = req.body;

    if (!event_name || !event_type || !start_datetime || !end_datetime || !venue_id || !coordinator_id) {
      return res.status(400).json({ error: 'All primary event fields are required.' });
    }

    // Database trigger trg_venue_overlap_upd will prevent overlap
    const [result] = await query(`
      UPDATE event
      SET event_name = ?, event_type = ?, start_datetime = ?, end_datetime = ?,
          fee = ?, description = ?, venue_id = ?, coordinator_id = ?
      WHERE event_id = ?
    `, [
      event_name.trim(),
      event_type,
      start_datetime,
      end_datetime,
      parseFloat(fee || 0),
      description ? description.trim() : null,
      parseInt(venue_id, 10),
      parseInt(coordinator_id, 10),
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id - Admin / Coordinator only
router.delete('/:id', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const [result] = await query('DELETE FROM event WHERE event_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
