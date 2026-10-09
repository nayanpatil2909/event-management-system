// server/routes/venues.js - Venues Management Routes
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/venues - Public list of venues
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT v.*,
        COUNT(e.event_id) AS total_events
      FROM venue v
      LEFT JOIN event e ON e.venue_id = v.venue_id
      GROUP BY v.venue_id
      ORDER BY v.venue_name ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/venues/:id - Public venue details
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await query('SELECT * FROM venue WHERE venue_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/venues - Admin / Coordinator only
router.post('/', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const { venue_name, location, capacity } = req.body;
    if (!venue_name || !capacity) {
      return res.status(400).json({ error: 'Venue name and capacity are required.' });
    }
    const [result] = await query(
      'INSERT INTO venue (venue_name, location, capacity) VALUES (?, ?, ?)',
      [venue_name.trim(), location ? location.trim() : null, parseInt(capacity, 10)]
    );
    res.status(201).json({
      venue_id: result.insertId,
      venue_name: venue_name.trim(),
      location,
      capacity: parseInt(capacity, 10)
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/venues/:id - Admin / Coordinator only
router.put('/:id', requireAuth, requireRole('admin', 'coordinator'), async (req, res, next) => {
  try {
    const { venue_name, location, capacity } = req.body;
    if (!venue_name || !capacity) {
      return res.status(400).json({ error: 'Venue name and capacity are required.' });
    }
    const [result] = await query(
      'UPDATE venue SET venue_name = ?, location = ?, capacity = ? WHERE venue_id = ?',
      [venue_name.trim(), location ? location.trim() : null, parseInt(capacity, 10), req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json({ message: 'Venue updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/venues/:id - Admin only
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const [result] = await query('DELETE FROM venue WHERE venue_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json({ message: 'Venue deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
