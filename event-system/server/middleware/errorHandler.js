// server/middleware/errorHandler.js - MySQL Error Translation

function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. MySQL Custom Trigger SIGNAL (SQLSTATE 45000)
  // e.g. 'Venue already booked for this time', 'Venue capacity reached'
  if (err.sqlState === '45000') {
    return res.status(409).json({
      error: err.sqlMessage || err.message || 'Conflict occurred'
    });
  }

  // 2. MySQL Duplicate Key Error (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    const msg = (err.sqlMessage || err.message || '').toLowerCase();
    if (msg.includes('participant_id') || msg.includes('event_id') || req.originalUrl.includes('/registrations')) {
      return res.status(409).json({
        error: 'Already registered for this event'
      });
    }
    if (msg.includes('email') || req.originalUrl.includes('/register')) {
      return res.status(409).json({
        error: 'An account with this email already exists'
      });
    }
    if (msg.includes('session_id') || req.originalUrl.includes('/attendance')) {
      return res.status(409).json({
        error: 'Attendance already recorded for this session'
      });
    }
    return res.status(409).json({
      error: 'Duplicate record already exists in database'
    });
  }

  // 3. MySQL CHECK constraint violations (ER_CHECK_CONSTRAINT_VIOLATED or SQLSTATE 3819)
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.sqlState === '3819' || err.errno === 3819) {
    return res.status(400).json({
      error: err.sqlMessage || 'Validation failed: Check constraint violated'
    });
  }

  // 4. MySQL Foreign Key Violations
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    return res.status(400).json({
      error: 'Referenced entity (e.g. venue, coordinator, speaker, or event) does not exist'
    });
  }

  // 5. Explicit validation or 400 Bad Request errors thrown by route logic
  if (err.status && err.status < 500) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  // 6. Generic/Fallback Server Error
  console.error('[SERVER ERROR]', err);
  return res.status(500).json({
    error: err.message || 'Internal server error'
  });
}

module.exports = errorHandler;
