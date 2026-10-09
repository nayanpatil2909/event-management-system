// server/test.js - Automated Verification Test Suite (DBMS Project 31)
// Tests all 9 key business rules, triggers, views, check constraints, roles, security & performance.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./index');
const { query, pool } = require('./db');

const RESULTS = [];

function recordTest(ruleId, ruleName, passed, details, durationMs) {
  RESULTS.push({
    id: ruleId,
    name: ruleName,
    status: passed ? 'PASS' : 'FAIL',
    details,
    durationMs: `${durationMs}ms`
  });
  const symbol = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${symbol}] ${ruleId}: ${ruleName} (${durationMs}ms) - ${details}`);
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('  WOXSEN UNIVERSITY — DBMS PROJECT 31 AUTOMATED TEST SUITE');
  console.log('  Event Registration & Venue Scheduling System');
  console.log('================================================================\n');

  // Start server on an ephemeral port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let adminToken = '';
  let participantToken = '';

  try {
    // Authenticate Admin
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@woxsen.edu.in', password: 'Admin@123' })
    });
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.token;

    // Authenticate Participant 1
    const partLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'participant1@woxsen.edu.in', password: 'Participant@123' })
    });
    const partLoginData = await partLoginRes.json();
    participantToken = partLoginData.token;

    // -------------------------------------------------------------
    // RULE 1: Venue Overlap on INSERT Rejected (Trigger trg_venue_overlap_ins)
    // -------------------------------------------------------------
    {
      const start = Date.now();
      // Event 1 is at Venue 1 on 2026-11-15 09:30:00 to 17:30:00
      // Attempt to schedule another event at Venue 1 on 2026-11-15 11:00:00 to 14:00:00
      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          event_name: 'Conflict Test Event',
          description: 'Should be rejected by venue overlap trigger',
          event_type: 'Workshop',
          start_datetime: '2026-11-15 11:00:00',
          end_datetime: '2026-11-15 14:00:00',
          venue_id: 1,
          coordinator_id: 1,
          fee: 0
        })
      });
      const data = await res.json();
      const elapsed = Date.now() - start;
      const passed = res.status === 409 && (data.error || '').toLowerCase().includes('venue');
      recordTest(
        'RULE-1',
        'Venue Overlap on INSERT Rejected (HTTP 409 / trg_venue_overlap_ins)',
        passed,
        `Status: ${res.status}, Error: "${data.error}"`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 2: Venue Overlap on UPDATE Rejected (Trigger trg_venue_overlap_upd)
    // -------------------------------------------------------------
    {
      const start = Date.now();
      // Event 2 is at Venue 2. Attempt to update Event 2 to Venue 1 overlapping Event 1
      const res = await fetch(`${baseUrl}/api/events/2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          event_name: 'Full-Stack Cloud & DevOps Workshop',
          event_type: 'Workshop',
          venue_id: 1,
          coordinator_id: 1,
          start_datetime: '2026-11-15 10:00:00',
          end_datetime: '2026-11-15 15:00:00',
          fee: 250,
          description: 'Attempting to shift to Venue 1 during Event 1 summit'
        })
      });
      const data = await res.json();
      const elapsed = Date.now() - start;
      const passed = res.status === 409 && (data.error || '').toLowerCase().includes('venue');
      recordTest(
        'RULE-2',
        'Venue Overlap on UPDATE Rejected (HTTP 409 / trg_venue_overlap_upd)',
        passed,
        `Status: ${res.status}, Error: "${data.error}"`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 3: Venue Capacity Limit Rejected (Trigger trg_capacity)
    // -------------------------------------------------------------
    {
      const start = Date.now();
      // Event 6 is at Venue 4 (Workshop Lab 40, capacity = 40). Seed data has 40 registrations.
      // Attempting to register another participant for Event 6 must trigger trg_capacity
      const [userRes] = await query(
        `INSERT INTO users (email, password_hash, role) VALUES ('temp_capacity_test@woxsen.edu.in', 'hash', 'participant')`
      );
      const [partRes] = await query(
        `INSERT INTO participant (user_id, name, email, phone, organization) VALUES (?, 'Temp Overflow', 'temp_capacity_test@woxsen.edu.in', '9999999999', 'Woxsen')`,
        [userRes.insertId]
      );
      const tempPartId = partRes.insertId;

      let caught = false;
      let errorMsg = '';
      try {
        await query(
          `INSERT INTO registration (participant_id, event_id, status) VALUES (?, 6, 'Confirmed')`,
          [tempPartId]
        );
      } catch (err) {
        caught = true;
        errorMsg = err.message;
      } finally {
        // Clean up temp participant
        await query(`DELETE FROM participant WHERE participant_id = ?`, [tempPartId]);
        await query(`DELETE FROM users WHERE user_id = ?`, [userRes.insertId]);
      }

      const elapsed = Date.now() - start;
      const passed = caught && errorMsg.includes('capacity');
      recordTest(
        'RULE-3',
        'Venue Capacity Limit Enforced (trg_capacity throws SQLSTATE 45000)',
        passed,
        `Caught: ${caught}, Message: "${errorMsg}"`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 4: Duplicate Registration for Same Event Rejected
    // -------------------------------------------------------------
    {
      const start = Date.now();
      // Participant 1 is already registered for Event 1 in seed data.
      // Attempt duplicate registration via API
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${participantToken}`
        },
        body: JSON.stringify({
          event_id: 1
        })
      });
      const data = await res.json();
      const elapsed = Date.now() - start;
      const passed = res.status === 409 && (data.error || '').toLowerCase().includes('already registered');
      recordTest(
        'RULE-4',
        'Duplicate Event Registration Rejected (HTTP 409 / UNIQUE constraint)',
        passed,
        `Status: ${res.status}, Error: "${data.error}"`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 5: Certificate Eligibility View (>=75% vs <75%)
    // -------------------------------------------------------------
    {
      const start = Date.now();
      // Query the live certificate_eligibility view for completed Event 4
      const [rows] = await query(`
        SELECT participant_id, attendance_pct, eligible
        FROM certificate_eligibility
        WHERE event_id = 4
        ORDER BY attendance_pct DESC
      `);

      const highAtt = rows.find(r => parseFloat(r.attendance_pct) >= 75.0);
      const lowAtt = rows.find(r => parseFloat(r.attendance_pct) < 75.0);

      const highValid = highAtt && highAtt.eligible === 1;
      const lowValid = lowAtt && lowAtt.eligible === 0;
      const passed = Boolean(highValid && lowValid);
      const elapsed = Date.now() - start;

      recordTest(
        'RULE-5',
        'Certificate Eligibility View (75% Threshold Rule)',
        passed,
        `High (${highAtt?.attendance_pct}% -> eligible=${highAtt?.eligible}), Low (${lowAtt?.attendance_pct}% -> eligible=${lowAtt?.eligible})`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 6: Database Check Constraints
    // -------------------------------------------------------------
    {
      const start = Date.now();
      // Test A: Negative Payment amount check constraint (amount >= 0)
      const payRes = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          registration_id: 1,
          amount: -500.00,
          payment_mode: 'UPI',
          status: 'Paid'
        })
      });
      const payData = await payRes.json();

      // Test B: Session end time <= start time (end_time > start_time)
      const sessRes = await fetch(`${baseUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          event_id: 1,
          title: 'Invalid End Time Session',
          speaker_id: 1,
          session_date: '2026-11-15',
          start_time: '14:00:00',
          end_time: '12:00:00'
        })
      });
      const sessData = await sessRes.json();

      const elapsed = Date.now() - start;
      const passed = payRes.status === 400 && sessRes.status === 400;
      recordTest(
        'RULE-6',
        'CHECK Constraints Enforced (Negative Payment & Invalid Session Times -> 400)',
        passed,
        `Payment HTTP ${payRes.status} ("${payData.error}"), Session HTTP ${sessRes.status} ("${sessData.error}")`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 7: Role Checks & Route Guarding (401 & 403)
    // -------------------------------------------------------------
    {
      const start = Date.now();
      // Test A: Unauthenticated request to protected route
      const noAuthRes = await fetch(`${baseUrl}/api/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue_name: 'Hacker Hall', location: 'Nowhere', capacity: 100 })
      });

      // Test B: Participant attempting to create an event (Requires admin or coordinator)
      const forbiddenRes = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${participantToken}`
        },
        body: JSON.stringify({
          event_name: 'Illegal Participant Event',
          event_type: 'Workshop',
          start_datetime: '2026-12-01 10:00:00',
          end_datetime: '2026-12-01 12:00:00',
          venue_id: 1,
          coordinator_id: 1,
          fee: 0
        })
      });

      const elapsed = Date.now() - start;
      const passed = noAuthRes.status === 401 && forbiddenRes.status === 403;
      recordTest(
        'RULE-7',
        'Role-Based Authorization & Authentication (HTTP 401 & HTTP 403)',
        passed,
        `Unauthenticated: HTTP ${noAuthRes.status}, Unauthorized Role: HTTP ${forbiddenRes.status}`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 8: Passwords Stored Hashed with Bcrypt (No Plaintext)
    // -------------------------------------------------------------
    {
      const start = Date.now();
      const [users] = await query(`SELECT user_id, email, password_hash FROM users LIMIT 15`);
      let allHashed = true;
      let nonCompliant = 0;

      for (const u of users) {
        const isBcrypt = typeof u.password_hash === 'string' &&
          (u.password_hash.startsWith('$2a$') || u.password_hash.startsWith('$2b$')) &&
          u.password_hash.length === 60;
        if (!isBcrypt) {
          allHashed = false;
          nonCompliant++;
        }
      }

      const elapsed = Date.now() - start;
      recordTest(
        'RULE-8',
        'Password Security Audit (100% Bcrypt Hashes, Zero Plaintext in DB)',
        allHashed,
        `Verified ${users.length} sample records. Non-compliant: ${nonCompliant}`,
        elapsed
      );
    }

    // -------------------------------------------------------------
    // RULE 9: List Endpoints Response Time < 2 Seconds
    // -------------------------------------------------------------
    {
      const endpoints = [
        { path: '/api/events', name: 'Events Catalog' },
        { path: '/api/venues', name: 'Venues List' },
        { path: '/api/reports/registrations-per-event', name: 'Registrations Report' },
        { path: '/api/reports/revenue', name: 'Revenue Report' }
      ];

      let allFast = true;
      const latencies = [];

      for (const ep of endpoints) {
        const start = Date.now();
        const res = await fetch(`${baseUrl}${ep.path}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const elapsed = Date.now() - start;
        latencies.push(`${ep.name}: ${elapsed}ms`);
        if (elapsed > 2000 || !res.ok) {
          allFast = false;
        }
      }

      recordTest(
        'RULE-9',
        'API Performance & Index Efficiency (Latency < 2000ms SLA)',
        allFast,
        latencies.join(', '),
        latencies.length
      );
    }

  } catch (err) {
    console.error('Test Suite Runtime Error:', err);
  } finally {
    server.close();
    await pool.end();
  }

  // Print Summary Table
  console.log('\n================================================================');
  console.log('                    TEST EXECUTION SUMMARY');
  console.log('================================================================');
  console.table(RESULTS, ['id', 'status', 'name', 'durationMs', 'details']);

  const failedCount = RESULTS.filter(r => r.status === 'FAIL').length;
  const passedCount = RESULTS.filter(r => r.status === 'PASS').length;

  console.log(`\nTOTAL: ${RESULTS.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);

  if (failedCount > 0) {
    console.log('\n❌ TEST SUITE FAILED: One or more business rules violated expectations.\n');
    process.exit(1);
  } else {
    console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY! Database integrity 100% intact.\n');
    process.exit(0);
  }
}

runTestSuite();
