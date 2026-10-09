// server/db.js - MySQL Connection Pool
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'evt_app',
  password: process.env.DB_PASSWORD || 'StrongPass#123',
  database: process.env.DB_NAME || 'event_system',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  dateStrings: true // Return date/time as strings for consistent formatting
});

// Helper for atomic transaction execution
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query: (sql, params) => pool.query(sql, params),
  execute: (sql, params) => pool.execute(sql, params),
  withTransaction
};
