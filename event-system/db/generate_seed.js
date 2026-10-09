const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function generate() {
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const coordHash = await bcrypt.hash('Coord@123', 10);
  const speakerHash = await bcrypt.hash('Speaker@123', 10);
  const partHash = await bcrypt.hash('Participant@123', 10);
  const manageHash = await bcrypt.hash('Manage@123', 10);

  let sql = `-- Woxsen University DBMS Project 31
-- Seed Data Script
-- Passwords:
-- Admin: Admin@123
-- Coordinators: Coord@123
-- Speakers: Speaker@123
-- Participants: Participant@123
-- Management: Manage@123

-- 1. Venues (5 venues as specified)
INSERT INTO venue (venue_id, venue_name, location, capacity) VALUES
(1, 'Auditorium 500', 'Central Block, Ground Floor', 500),
(2, 'Seminar Hall A', 'Academic Block 1, Level 2', 150),
(3, 'Seminar Hall B', 'Academic Block 2, Level 3', 100),
(4, 'Workshop Lab 40', 'Science & Technology Block, Lab 4', 40),
(5, 'Open Air Theatre 800', 'Campus Amphitheatre Grounds', 800);

-- 2. Users & Roles
-- Admin (user_id = 1)
INSERT INTO users (user_id, email, password_hash, role) VALUES
(1, 'admin@woxsen.edu.in', '${adminHash}', 'admin');

-- Coordinators (user_id = 2, 3)
INSERT INTO users (user_id, email, password_hash, role) VALUES
(2, 'coord1@woxsen.edu.in', '${coordHash}', 'coordinator'),
(3, 'coord2@woxsen.edu.in', '${coordHash}', 'coordinator');

-- Speakers (user_id = 4, 5, 6, 7)
INSERT INTO users (user_id, email, password_hash, role) VALUES
(4, 'speaker1@woxsen.edu.in', '${speakerHash}', 'speaker'),
(5, 'speaker2@woxsen.edu.in', '${speakerHash}', 'speaker'),
(6, 'speaker3@woxsen.edu.in', '${speakerHash}', 'speaker'),
(7, 'speaker4@woxsen.edu.in', '${speakerHash}', 'speaker');

-- Management (user_id = 8)
INSERT INTO users (user_id, email, password_hash, role) VALUES
(8, 'management@woxsen.edu.in', '${manageHash}', 'management');

-- Participants (user_id = 9 to 48) - 40 participants
INSERT INTO users (user_id, email, password_hash, role) VALUES
`;

  const partUsers = [];
  for (let i = 1; i <= 40; i++) {
    partUsers.push(`(${8 + i}, 'participant${i}@woxsen.edu.in', '${partHash}', 'participant')`);
  }
  sql += partUsers.join(',\n') + ';\n\n';

  // 3. Coordinators Table
  sql += `-- 3. Coordinator Profiles
INSERT INTO coordinator (coordinator_id, user_id, name, email, phone) VALUES
(1, 2, 'Dr. Ramesh Sharma', 'coord1@woxsen.edu.in', '+91 98765 43210'),
(2, 3, 'Prof. Priya Menon', 'coord2@woxsen.edu.in', '+91 98765 43211');

-- 4. Speaker Profiles
INSERT INTO speaker (speaker_id, user_id, name, email, phone, organization) VALUES
(1, 4, 'Dr. Arvind Swaminathan', 'speaker1@woxsen.edu.in', '+91 98111 22334', 'Google AI Research'),
(2, 5, 'Ms. Ananya Roy', 'speaker2@woxsen.edu.in', '+91 98222 33445', 'Microsoft Azure'),
(3, 6, 'Prof. Vikramaditya Sen', 'speaker3@woxsen.edu.in', '+91 98333 44556', 'IIT Hyderabad'),
(4, 7, 'Mr. K. V. Rao', 'speaker4@woxsen.edu.in', '+91 98444 55667', 'Woxsen School of Arts');

-- 5. Participant Profiles
INSERT INTO participant (participant_id, user_id, name, email, phone, organization) VALUES
`;
  const partProfiles = [];
  const sampleNames = [
    'Aarav Mehta', 'Ananya Iyer', 'Rohan Verma', 'Diya Patel', 'Kabir Reddy',
    'Ishita Nair', 'Aditya Joshi', 'Sneha Kulkarni', 'Arjun Rao', 'Tanvi Deshmukh',
    'Siddharth Bhat', 'Pooja Hegde', 'Varun Kapoor', 'Rhea Chakraborty', 'Nikhil Gupta',
    'Meera Nambiar', 'Karan Malhotra', 'Divya Saxena', 'Akash Tripathi', 'Shruti Shinde',
    'Yashwardhan Singhania', 'Kritika Sen', 'Harsh Vardhan', 'Avani Chawla', 'Pranav Menon',
    'Simran Kaur', 'Tushar Agarwal', 'Anika Pillai', 'Gaurav Das', 'Bhavna Chauhan',
    'Manish Pandey', 'Lavanya Sundaram', 'Abhinav Tyagi', 'Ritu Sethi', 'Suraj Yadav',
    'Swati Dubey', 'Kunal Goswami', 'Pallavi Mishra', 'Deepak Tiwari', 'Neha Mahajan'
  ];

  for (let i = 1; i <= 40; i++) {
    const name = sampleNames[i - 1] || `Participant ${i}`;
    partProfiles.push(`(${i}, ${8 + i}, '${name}', 'participant${i}@woxsen.edu.in', '+91 99000 ${String(1000 + i).slice(1)}', 'Woxsen University')`);
  }
  sql += partProfiles.join(',\n') + ';\n\n';

  // 6. Events (6 events: mix of Seminar, Workshop, Cultural; past & upcoming; no venue overlap)
  // Current simulated date: 2026-10-07
  sql += `-- 6. Events (No venue overlaps)
INSERT INTO event (event_id, event_name, event_type, start_datetime, end_datetime, fee, description, venue_id, coordinator_id) VALUES
-- Event 1: Upcoming Seminar in Auditorium 500 (Venue 1)
(1, 'AI & Generative Models Summit 2026', 'Seminar', '2026-11-15 09:30:00', '2026-11-15 17:30:00', 500.00, 'Comprehensive industry seminar on state of the art Large Language Models and Enterprise Diffusion Architectures.', 1, 1),

-- Event 2: Upcoming Workshop in Seminar Hall A (Venue 2)
(2, 'Full-Stack Cloud & DevOps Workshop', 'Workshop', '2026-11-20 10:00:00', '2026-11-20 16:00:00', 300.00, 'Hands-on intensive masterclass on microservices, containerization, and modern CI/CD pipelines.', 2, 2),

-- Event 3: Upcoming Cultural in Open Air Theatre (Venue 5)
(3, 'Woxsen Annual Cultural Gala 2026', 'Cultural', '2026-11-25 18:00:00', '2026-11-25 22:30:00', 150.00, 'Vibrant university celebration featuring music ensembles, choreography, and dramatic performances.', 5, 1),

-- Event 4: Past Seminar in Seminar Hall B (Venue 3)
(4, 'Quantum Computing & Algorithms Symposium', 'Seminar', '2026-09-10 09:00:00', '2026-09-10 15:00:00', 400.00, 'Academic deep dive into quantum supremacy, qubit entanglement, and Shor algorithm implementations.', 3, 2),

-- Event 5: Past Workshop in Seminar Hall A (Venue 2) - Non-overlapping with Event 2 dates
(5, 'Modern Microservices & API Architecture', 'Workshop', '2026-09-18 10:00:00', '2026-09-18 16:30:00', 250.00, 'Production-grade RESTful API patterns and event-driven architectures with distributed caching.', 2, 1),

-- Event 6: Small Capacity Workshop in Workshop Lab 40 (Venue 4) - 40 Seats, FULLY BOOKED TO DEMO CAPACITY TRIGGER
(6, 'Rapid Embedded Robotics & IoT Workshop', 'Workshop', '2026-11-28 09:00:00', '2026-11-28 17:00:00', 200.00, 'Intensive embedded electronics and edge computing lab session with hardware kits. Strictly limited to 40 lab benches.', 4, 2);

-- 7. Sessions (2 to 4 sessions per event)
INSERT INTO session (session_id, event_id, speaker_id, session_title, session_date, start_time, end_time) VALUES
-- Event 1 Sessions (3 sessions)
(1, 1, 1, 'Keynote: Next Frontier in Foundation Models', '2026-11-15', '09:30:00', '11:30:00'),
(2, 1, 2, 'Enterprise Cloud Orchestration for AI', '2026-11-15', '12:00:00', '14:00:00'),
(3, 1, 3, 'Ethics, Alignment, and Future Directions', '2026-11-15', '14:30:00', '16:30:00'),

-- Event 2 Sessions (2 sessions)
(4, 2, 2, 'Container Lifecycle & Kubernetes Deep-Dive', '2026-11-20', '10:00:00', '12:30:00'),
(5, 2, 3, 'Zero-Downtime GitOps Deployments', '2026-11-20', '13:30:00', '16:00:00'),

-- Event 3 Sessions (2 sessions)
(6, 3, 4, 'Classical Fusion Music & Folk Performance', '2026-11-25', '18:00:00', '20:00:00'),
(7, 3, 4, 'Theatrical Showcase: Epochs of Expression', '2026-11-25', '20:30:00', '22:30:00'),

-- Event 4 Sessions (4 sessions - Past Event used for Attendance & Certificate calculations)
(8, 4, 3, 'Introduction to Qubits & Superposition', '2026-09-10', '09:00:00', '10:15:00'),
(9, 4, 3, 'Quantum Logic Gates & Circuits', '2026-09-10', '10:30:00', '12:00:00'),
(10, 4, 1, 'Quantum Teleportation & Cryptography', '2026-09-10', '12:45:00', '14:00:00'),
(11, 4, 3, 'Qiskit Practical Demonstration', '2026-09-10', '14:15:00', '15:00:00'),

-- Event 5 Sessions (2 sessions - Past Event)
(12, 5, 2, 'Domain-Driven Design for Microservices', '2026-09-18', '10:00:00', '12:30:00'),
(13, 5, 1, 'Distributed Tracing & Resilience Patterns', '2026-09-18', '13:30:00', '16:00:00'),

-- Event 6 Sessions (2 sessions - Lab 40)
(14, 6, 1, 'Microcontrollers & Sensor Interfacing', '2026-11-28', '09:00:00', '12:30:00'),
(15, 6, 2, 'Autonomous Navigation Algorithms', '2026-11-28', '13:30:00', '17:00:00');

-- 8. Registrations
-- A. Event 6 (Workshop Lab 40) - ALL 40 PARTICIPANTS REGISTERED TO DEMO CAPACITY LIMIT
INSERT INTO registration (registration_id, participant_id, event_id, reg_date, status) VALUES
`;
  const event6Regs = [];
  for (let i = 1; i <= 40; i++) {
    event6Regs.push(`(${i}, ${i}, 6, '2026-10-01 10:00:00', 'Confirmed')`);
  }
  sql += event6Regs.join(',\n') + ';\n\n';

  // B. Event 4 (Past event with 4 sessions): Participants 1 to 10 registered
  sql += `-- B. Event 4 Registrations (Past Event: Participants 1-10 for Attendance & Certificate test)
INSERT INTO registration (registration_id, participant_id, event_id, reg_date, status) VALUES
(41, 1, 4, '2026-09-01 11:00:00', 'Confirmed'),
(42, 2, 4, '2026-09-01 11:15:00', 'Confirmed'),
(43, 3, 4, '2026-09-01 11:30:00', 'Confirmed'),
(44, 4, 4, '2026-09-01 11:45:00', 'Confirmed'),
(45, 5, 4, '2026-09-01 12:00:00', 'Confirmed'),
(46, 6, 4, '2026-09-01 12:15:00', 'Confirmed'),
(47, 7, 4, '2026-09-01 12:30:00', 'Confirmed'),
(48, 8, 4, '2026-09-01 12:45:00', 'Confirmed'),
(49, 9, 4, '2026-09-01 13:00:00', 'Confirmed'),
(50, 10, 4, '2026-09-01 13:15:00', 'Confirmed');

-- C. Event 1 (Upcoming Seminar): Participants 1 to 8 registered (mix of Confirmed and Pending)
INSERT INTO registration (registration_id, participant_id, event_id, reg_date, status) VALUES
(51, 1, 1, '2026-10-02 09:00:00', 'Confirmed'),
(52, 2, 1, '2026-10-02 09:30:00', 'Confirmed'),
(53, 3, 1, '2026-10-02 10:00:00', 'Confirmed'),
(54, 4, 1, '2026-10-02 10:30:00', 'Pending'),
(55, 5, 1, '2026-10-02 11:00:00', 'Pending'),
(56, 6, 1, '2026-10-02 11:30:00', 'Confirmed'),
(57, 7, 1, '2026-10-02 12:00:00', 'Pending'),
(58, 8, 1, '2026-10-02 12:30:00', 'Cancelled');

-- D. Event 2 (Upcoming Workshop): Participants 9 to 15 registered
INSERT INTO registration (registration_id, participant_id, event_id, reg_date, status) VALUES
(59, 9, 2, '2026-10-03 14:00:00', 'Confirmed'),
(60, 10, 2, '2026-10-03 14:15:00', 'Confirmed'),
(61, 11, 2, '2026-10-03 14:30:00', 'Pending'),
(62, 12, 2, '2026-10-03 14:45:00', 'Confirmed'),
(63, 13, 2, '2026-10-03 15:00:00', 'Pending');

-- E. Event 5 (Past Workshop): Participants 1 to 5
INSERT INTO registration (registration_id, participant_id, event_id, reg_date, status) VALUES
(64, 1, 5, '2026-09-12 10:00:00', 'Confirmed'),
(65, 2, 5, '2026-09-12 10:15:00', 'Confirmed'),
(66, 3, 5, '2026-09-12 10:30:00', 'Confirmed'),
(67, 4, 5, '2026-09-12 10:45:00', 'Confirmed');

-- 9. Payments (Mix of Paid and Pending, with various payment modes)
INSERT INTO payment (payment_id, registration_id, amount, payment_date, payment_mode, status) VALUES
-- Event 4 Payments (fee 400.00)
(1, 41, 400.00, '2026-09-01 11:05:00', 'UPI', 'Paid'),
(2, 42, 400.00, '2026-09-01 11:20:00', 'Card', 'Paid'),
(3, 43, 400.00, '2026-09-01 11:35:00', 'NetBanking', 'Paid'),
(4, 44, 400.00, '2026-09-01 11:50:00', 'UPI', 'Paid'),
(5, 45, 400.00, '2026-09-01 12:05:00', 'Card', 'Paid'),
(6, 46, 400.00, '2026-09-01 12:20:00', 'Cash', 'Paid'),
(7, 47, 400.00, '2026-09-01 12:35:00', 'UPI', 'Paid'),
(8, 48, 400.00, '2026-09-01 12:50:00', 'NetBanking', 'Paid'),
(9, 49, 400.00, '2026-09-01 13:05:00', 'UPI', 'Paid'),
(10, 50, 400.00, '2026-09-01 13:20:00', 'Card', 'Paid'),

-- Event 1 Payments (fee 500.00)
(11, 51, 500.00, '2026-10-02 09:05:00', 'UPI', 'Paid'),
(12, 52, 500.00, '2026-10-02 09:35:00', 'Card', 'Paid'),
(13, 53, 500.00, '2026-10-02 10:05:00', 'NetBanking', 'Paid'),
(14, 54, 500.00, '2026-10-02 10:30:00', 'UPI', 'Pending'),
(15, 55, 500.00, '2026-10-02 11:00:00', 'Card', 'Pending'),
(16, 56, 500.00, '2026-10-02 11:35:00', 'UPI', 'Paid'),
(17, 57, 500.00, '2026-10-02 12:00:00', 'NetBanking', 'Pending'),

-- Event 2 Payments (fee 300.00)
(18, 59, 300.00, '2026-10-03 14:05:00', 'UPI', 'Paid'),
(19, 60, 300.00, '2026-10-03 14:20:00', 'Card', 'Paid'),
(20, 61, 300.00, '2026-10-03 14:30:00', 'UPI', 'Pending'),
(21, 62, 300.00, '2026-10-03 14:50:00', 'Cash', 'Paid'),
(22, 63, 300.00, '2026-10-03 15:00:00', 'NetBanking', 'Pending'),

-- Event 5 Payments (fee 250.00)
(23, 64, 250.00, '2026-09-12 10:05:00', 'UPI', 'Paid'),
(24, 65, 250.00, '2026-09-12 10:20:00', 'Card', 'Paid'),
(25, 66, 250.00, '2026-09-12 10:35:00', 'NetBanking', 'Paid'),
(26, 67, 250.00, '2026-09-12 10:50:00', 'Cash', 'Paid');

-- Event 6 Payments (fee 200.00) - First 40 registrations
INSERT INTO payment (payment_id, registration_id, amount, payment_date, payment_mode, status) VALUES
`;
  const event6Payments = [];
  for (let i = 1; i <= 40; i++) {
    const modes = ['UPI', 'Card', 'NetBanking', 'Cash'];
    const mode = modes[i % 4];
    event6Payments.push(`(${26 + i}, ${i}, 200.00, '2026-10-01 10:05:00', '${mode}', 'Paid')`);
  }
  sql += event6Payments.join(',\n') + ';\n\n';

  // 10. Attendance Records for Event 4 (Sessions 8, 9, 10, 11) - 4 total sessions
  // Demonstrating >= 75% (3 or 4 Present) vs < 75% (0, 1, or 2 Present):
  // Reg 41 (Part 1): 4 Present = 100% (Eligible)
  // Reg 42 (Part 2): 3 Present, 1 Absent = 75% (Eligible)
  // Reg 43 (Part 3): 2 Present, 2 Absent = 50% (NOT Eligible)
  // Reg 44 (Part 4): 1 Present, 3 Absent = 25% (NOT Eligible)
  // Reg 45 (Part 5): 4 Present = 100% (Eligible)
  // Reg 46 (Part 6): 3 Present = 75% (Eligible)
  // Reg 47 (Part 7): 0 Present = 0% (NOT Eligible)
  sql += `-- 10. Attendance Records (Testing Certificate Eligibility View >= 75% vs < 75%)
INSERT INTO attendance (registration_id, session_id, status) VALUES
-- Reg 41: 4/4 Present (100% - Eligible)
(41, 8, 'Present'), (41, 9, 'Present'), (41, 10, 'Present'), (41, 11, 'Present'),

-- Reg 42: 3/4 Present (75% - Eligible)
(42, 8, 'Present'), (42, 9, 'Present'), (42, 10, 'Present'), (42, 11, 'Absent'),

-- Reg 43: 2/4 Present (50% - Not Eligible)
(43, 8, 'Present'), (43, 9, 'Present'), (43, 10, 'Absent'), (43, 11, 'Absent'),

-- Reg 44: 1/4 Present (25% - Not Eligible)
(44, 8, 'Present'), (44, 9, 'Absent'), (44, 10, 'Absent'), (44, 11, 'Absent'),

-- Reg 45: 4/4 Present (100% - Eligible)
(45, 8, 'Present'), (45, 9, 'Present'), (45, 10, 'Present'), (45, 11, 'Present'),

-- Reg 46: 3/4 Present (75% - Eligible)
(46, 8, 'Absent'), (46, 9, 'Present'), (46, 10, 'Present'), (46, 11, 'Present'),

-- Reg 47: 0/4 Present (0% - Not Eligible)
(47, 8, 'Absent'), (47, 9, 'Absent'), (47, 10, 'Absent'), (47, 11, 'Absent'),

-- Event 5 Attendance (Sessions 12, 13) - 2 sessions
-- Reg 64: 2/2 Present (100% - Eligible)
(64, 12, 'Present'), (64, 13, 'Present'),
-- Reg 65: 1/2 Present (50% - Not Eligible)
(65, 12, 'Present'), (65, 13, 'Absent');

-- 11. Feedback Records (for attended events)
INSERT INTO feedback (registration_id, rating, comments) VALUES
(41, 5, 'Exceptional symposium! The deep dive into quantum entanglement and Qiskit was profoundly insightful.'),
(42, 4, 'Very well coordinated event with stellar faculty insights. Audio setup in Seminar Hall B was crisp.'),
(45, 5, 'One of the best technical seminars hosted at Woxsen this semester! Looking forward to part 2.'),
(46, 4, 'Great speaker lineup and clear explanation of quantum logic gates.'),
(64, 5, 'Practical microservices patterns that I could immediately apply to my semester lab project.');
`;

  const outputPath = path.join(__dirname, 'seed.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`Generated ${outputPath} with valid bcrypt hashes.`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
