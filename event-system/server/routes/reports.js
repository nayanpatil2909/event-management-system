// server/routes/reports.js - Analytical Reports with CSV Export Support
const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// Helper to convert array of objects to CSV string
function toCsv(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];

  for (const row of rows) {
    const line = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) return '""';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
    csvLines.push(line);
  }
  return csvLines.join('\r\n');
}

// Middleware helper to send CSV or JSON based on req.query.format
function sendReport(res, req, data, filename = 'report.csv') {
  if (req.query.format === 'csv') {
    const csvContent = toCsv(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  }
  res.json(data);
}

// Protect all reports for management and admin roles
router.use(requireAuth, requireRole('admin', 'management'));

// 1. Registrations per event
router.get('/registrations-per-event', async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT e.event_id, e.event_name, e.event_type,
        v.venue_name, v.capacity,
        COUNT(CASE WHEN r.status = 'Confirmed' THEN 1 END) AS confirmed_registrations,
        COUNT(CASE WHEN r.status = 'Pending' THEN 1 END) AS pending_registrations,
        COUNT(CASE WHEN r.status = 'Cancelled' THEN 1 END) AS cancelled_registrations,
        COUNT(CASE WHEN r.status <> 'Cancelled' THEN 1 END) AS total_active_registrations,
        ROUND(100 * COUNT(CASE WHEN r.status <> 'Cancelled' THEN 1 END) / v.capacity, 1) AS occupancy_pct
      FROM event e
      JOIN venue v ON e.venue_id = v.venue_id
      LEFT JOIN registration r ON e.event_id = r.event_id
      GROUP BY e.event_id, v.venue_id
      ORDER BY total_active_registrations DESC
    `);
    sendReport(res, req, rows, 'registrations_per_event.csv');
  } catch (err) {
    next(err);
  }
});

// 2. Revenue per event and total
router.get('/revenue', async (req, res, next) => {
  try {
    const [perEvent] = await query(`
      SELECT e.event_id, e.event_name, e.event_type, e.fee AS ticket_fee,
        COUNT(DISTINCT r.registration_id) AS total_registrations,
        COUNT(DISTINCT CASE WHEN p.status = 'Paid' THEN p.payment_id END) AS paid_transactions,
        COALESCE(SUM(CASE WHEN p.status = 'Paid' THEN p.amount ELSE 0 END), 0) AS total_collected_revenue,
        COALESCE(SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END), 0) AS pending_revenue
      FROM event e
      LEFT JOIN registration r ON e.event_id = r.event_id
      LEFT JOIN payment p ON r.registration_id = p.registration_id
      GROUP BY e.event_id
      ORDER BY total_collected_revenue DESC
    `);

    if (req.query.format === 'csv') {
      return sendReport(res, req, perEvent, 'revenue_report.csv');
    }

    // Summary calculation for JSON view
    const totalCollected = perEvent.reduce((sum, item) => sum + parseFloat(item.total_collected_revenue), 0);
    const totalPending = perEvent.reduce((sum, item) => sum + parseFloat(item.pending_revenue), 0);

    res.json({
      summary: {
        total_collected_revenue: totalCollected.toFixed(2),
        total_pending_revenue: totalPending.toFixed(2),
        total_events: perEvent.length
      },
      events: perEvent
    });
  } catch (err) {
    next(err);
  }
});

// 3. Venue utilization (booked hours)
router.get('/venue-utilization', async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT v.venue_id, v.venue_name, v.location, v.capacity,
        COUNT(e.event_id) AS total_events_hosted,
        COALESCE(ROUND(SUM(TIMESTAMPDIFF(MINUTE, e.start_datetime, e.end_datetime) / 60.0), 1), 0) AS total_booked_hours,
        COALESCE(SUM(CASE WHEN e.end_datetime >= NOW() THEN 1 ELSE 0 END), 0) AS upcoming_events
      FROM venue v
      LEFT JOIN event e ON v.venue_id = e.venue_id
      GROUP BY v.venue_id
      ORDER BY total_booked_hours DESC
    `);
    sendReport(res, req, rows, 'venue_utilization.csv');
  } catch (err) {
    next(err);
  }
});

// 4. Average rating per event
router.get('/ratings', async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT e.event_id, e.event_name, e.event_type,
        c.name AS coordinator_name,
        COUNT(fb.feedback_id) AS feedback_count,
        ROUND(AVG(fb.rating), 2) AS average_rating,
        MIN(fb.rating) AS lowest_rating,
        MAX(fb.rating) AS highest_rating
      FROM event e
      JOIN coordinator c ON e.coordinator_id = c.coordinator_id
      LEFT JOIN registration r ON e.event_id = r.event_id
      LEFT JOIN feedback fb ON r.registration_id = fb.registration_id
      GROUP BY e.event_id, c.coordinator_id
      ORDER BY average_rating DESC
    `);
    sendReport(res, req, rows, 'event_ratings.csv');
  } catch (err) {
    next(err);
  }
});

// 5. Certificate-eligible list (from certificate_eligibility view)
router.get('/certificate-eligible', async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT ce.registration_id, ce.participant_id, ce.event_id,
        p.name AS participant_name, p.email AS participant_email, p.organization,
        e.event_name, e.event_type,
        ce.attendance_pct,
        CASE WHEN ce.eligible = 1 THEN 'Yes' ELSE 'No' END AS is_eligible
      FROM certificate_eligibility ce
      JOIN participant p ON ce.participant_id = p.participant_id
      JOIN event e ON ce.event_id = e.event_id
      ORDER BY e.event_id ASC, ce.attendance_pct DESC
    `);
    sendReport(res, req, rows, 'certificate_eligibility_report.csv');
  } catch (err) {
    next(err);
  }
});

// 6. Unpaid registrations
router.get('/unpaid-registrations', async (req, res, next) => {
  try {
    const [rows] = await query(`
      SELECT r.registration_id, r.participant_id, r.event_id, r.reg_date, r.status AS reg_status,
        p.name AS participant_name, p.email AS participant_email, p.phone AS participant_phone,
        e.event_name, e.fee AS amount_due,
        pay.payment_id, pay.status AS payment_status
      FROM registration r
      JOIN participant p ON r.participant_id = p.participant_id
      JOIN event e ON r.event_id = e.event_id
      LEFT JOIN payment pay ON r.registration_id = pay.registration_id
      WHERE (r.status = 'Pending' OR pay.status = 'Pending' OR pay.payment_id IS NULL)
        AND r.status <> 'Cancelled'
        AND e.fee > 0
      ORDER BY r.reg_date DESC
    `);
    sendReport(res, req, rows, 'unpaid_registrations.csv');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
