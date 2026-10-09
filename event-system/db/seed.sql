-- Woxsen University DBMS Project 31
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
(1, 'admin@woxsen.edu.in', '$2a$10$cjxfAJDMc7bel.29WwREFufrvsyh0iP.fHDM/Xn6n6dFBhAb3NDCm', 'admin');

-- Coordinators (user_id = 2, 3)
INSERT INTO users (user_id, email, password_hash, role) VALUES
(2, 'coord1@woxsen.edu.in', '$2a$10$p/1Wn.MmwtrefFnOtonuc.ufUlvJNKmtGvQOCuGiXY5.BH2K6LE3a', 'coordinator'),
(3, 'coord2@woxsen.edu.in', '$2a$10$p/1Wn.MmwtrefFnOtonuc.ufUlvJNKmtGvQOCuGiXY5.BH2K6LE3a', 'coordinator');

-- Speakers (user_id = 4, 5, 6, 7)
INSERT INTO users (user_id, email, password_hash, role) VALUES
(4, 'speaker1@woxsen.edu.in', '$2a$10$8nn0my60eBfSCYFgTq7fgeLqncjBPXGkBKCKauAi2dmOftcd1uzcG', 'speaker'),
(5, 'speaker2@woxsen.edu.in', '$2a$10$8nn0my60eBfSCYFgTq7fgeLqncjBPXGkBKCKauAi2dmOftcd1uzcG', 'speaker'),
(6, 'speaker3@woxsen.edu.in', '$2a$10$8nn0my60eBfSCYFgTq7fgeLqncjBPXGkBKCKauAi2dmOftcd1uzcG', 'speaker'),
(7, 'speaker4@woxsen.edu.in', '$2a$10$8nn0my60eBfSCYFgTq7fgeLqncjBPXGkBKCKauAi2dmOftcd1uzcG', 'speaker');

-- Management (user_id = 8)
INSERT INTO users (user_id, email, password_hash, role) VALUES
(8, 'management@woxsen.edu.in', '$2a$10$1/vdJ3cyIU5f8kg575o1uOASVydXm7g2Z3xn2FQOPGtQwaGWWmIgC', 'management');

-- Participants (user_id = 9 to 48) - 40 participants
INSERT INTO users (user_id, email, password_hash, role) VALUES
(9, 'participant1@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(10, 'participant2@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(11, 'participant3@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(12, 'participant4@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(13, 'participant5@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(14, 'participant6@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(15, 'participant7@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(16, 'participant8@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(17, 'participant9@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(18, 'participant10@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(19, 'participant11@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(20, 'participant12@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(21, 'participant13@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(22, 'participant14@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(23, 'participant15@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(24, 'participant16@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(25, 'participant17@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(26, 'participant18@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(27, 'participant19@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(28, 'participant20@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(29, 'participant21@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(30, 'participant22@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(31, 'participant23@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(32, 'participant24@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(33, 'participant25@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(34, 'participant26@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(35, 'participant27@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(36, 'participant28@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(37, 'participant29@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(38, 'participant30@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(39, 'participant31@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(40, 'participant32@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(41, 'participant33@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(42, 'participant34@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(43, 'participant35@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(44, 'participant36@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(45, 'participant37@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(46, 'participant38@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(47, 'participant39@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant'),
(48, 'participant40@woxsen.edu.in', '$2a$10$Zyl98kreVJIukrlvi4d3lOukB/jKtYIe37PjVd2oasfGd4v5yBsEC', 'participant');

-- 3. Coordinator Profiles
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
(1, 9, 'Aarav Mehta', 'participant1@woxsen.edu.in', '+91 99000 001', 'Woxsen University'),
(2, 10, 'Ananya Iyer', 'participant2@woxsen.edu.in', '+91 99000 002', 'Woxsen University'),
(3, 11, 'Rohan Verma', 'participant3@woxsen.edu.in', '+91 99000 003', 'Woxsen University'),
(4, 12, 'Diya Patel', 'participant4@woxsen.edu.in', '+91 99000 004', 'Woxsen University'),
(5, 13, 'Kabir Reddy', 'participant5@woxsen.edu.in', '+91 99000 005', 'Woxsen University'),
(6, 14, 'Ishita Nair', 'participant6@woxsen.edu.in', '+91 99000 006', 'Woxsen University'),
(7, 15, 'Aditya Joshi', 'participant7@woxsen.edu.in', '+91 99000 007', 'Woxsen University'),
(8, 16, 'Sneha Kulkarni', 'participant8@woxsen.edu.in', '+91 99000 008', 'Woxsen University'),
(9, 17, 'Arjun Rao', 'participant9@woxsen.edu.in', '+91 99000 009', 'Woxsen University'),
(10, 18, 'Tanvi Deshmukh', 'participant10@woxsen.edu.in', '+91 99000 010', 'Woxsen University'),
(11, 19, 'Siddharth Bhat', 'participant11@woxsen.edu.in', '+91 99000 011', 'Woxsen University'),
(12, 20, 'Pooja Hegde', 'participant12@woxsen.edu.in', '+91 99000 012', 'Woxsen University'),
(13, 21, 'Varun Kapoor', 'participant13@woxsen.edu.in', '+91 99000 013', 'Woxsen University'),
(14, 22, 'Rhea Chakraborty', 'participant14@woxsen.edu.in', '+91 99000 014', 'Woxsen University'),
(15, 23, 'Nikhil Gupta', 'participant15@woxsen.edu.in', '+91 99000 015', 'Woxsen University'),
(16, 24, 'Meera Nambiar', 'participant16@woxsen.edu.in', '+91 99000 016', 'Woxsen University'),
(17, 25, 'Karan Malhotra', 'participant17@woxsen.edu.in', '+91 99000 017', 'Woxsen University'),
(18, 26, 'Divya Saxena', 'participant18@woxsen.edu.in', '+91 99000 018', 'Woxsen University'),
(19, 27, 'Akash Tripathi', 'participant19@woxsen.edu.in', '+91 99000 019', 'Woxsen University'),
(20, 28, 'Shruti Shinde', 'participant20@woxsen.edu.in', '+91 99000 020', 'Woxsen University'),
(21, 29, 'Yashwardhan Singhania', 'participant21@woxsen.edu.in', '+91 99000 021', 'Woxsen University'),
(22, 30, 'Kritika Sen', 'participant22@woxsen.edu.in', '+91 99000 022', 'Woxsen University'),
(23, 31, 'Harsh Vardhan', 'participant23@woxsen.edu.in', '+91 99000 023', 'Woxsen University'),
(24, 32, 'Avani Chawla', 'participant24@woxsen.edu.in', '+91 99000 024', 'Woxsen University'),
(25, 33, 'Pranav Menon', 'participant25@woxsen.edu.in', '+91 99000 025', 'Woxsen University'),
(26, 34, 'Simran Kaur', 'participant26@woxsen.edu.in', '+91 99000 026', 'Woxsen University'),
(27, 35, 'Tushar Agarwal', 'participant27@woxsen.edu.in', '+91 99000 027', 'Woxsen University'),
(28, 36, 'Anika Pillai', 'participant28@woxsen.edu.in', '+91 99000 028', 'Woxsen University'),
(29, 37, 'Gaurav Das', 'participant29@woxsen.edu.in', '+91 99000 029', 'Woxsen University'),
(30, 38, 'Bhavna Chauhan', 'participant30@woxsen.edu.in', '+91 99000 030', 'Woxsen University'),
(31, 39, 'Manish Pandey', 'participant31@woxsen.edu.in', '+91 99000 031', 'Woxsen University'),
(32, 40, 'Lavanya Sundaram', 'participant32@woxsen.edu.in', '+91 99000 032', 'Woxsen University'),
(33, 41, 'Abhinav Tyagi', 'participant33@woxsen.edu.in', '+91 99000 033', 'Woxsen University'),
(34, 42, 'Ritu Sethi', 'participant34@woxsen.edu.in', '+91 99000 034', 'Woxsen University'),
(35, 43, 'Suraj Yadav', 'participant35@woxsen.edu.in', '+91 99000 035', 'Woxsen University'),
(36, 44, 'Swati Dubey', 'participant36@woxsen.edu.in', '+91 99000 036', 'Woxsen University'),
(37, 45, 'Kunal Goswami', 'participant37@woxsen.edu.in', '+91 99000 037', 'Woxsen University'),
(38, 46, 'Pallavi Mishra', 'participant38@woxsen.edu.in', '+91 99000 038', 'Woxsen University'),
(39, 47, 'Deepak Tiwari', 'participant39@woxsen.edu.in', '+91 99000 039', 'Woxsen University'),
(40, 48, 'Neha Mahajan', 'participant40@woxsen.edu.in', '+91 99000 040', 'Woxsen University');

-- 6. Events (No venue overlaps)
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
(1, 1, 6, '2026-10-01 10:00:00', 'Confirmed'),
(2, 2, 6, '2026-10-01 10:00:00', 'Confirmed'),
(3, 3, 6, '2026-10-01 10:00:00', 'Confirmed'),
(4, 4, 6, '2026-10-01 10:00:00', 'Confirmed'),
(5, 5, 6, '2026-10-01 10:00:00', 'Confirmed'),
(6, 6, 6, '2026-10-01 10:00:00', 'Confirmed'),
(7, 7, 6, '2026-10-01 10:00:00', 'Confirmed'),
(8, 8, 6, '2026-10-01 10:00:00', 'Confirmed'),
(9, 9, 6, '2026-10-01 10:00:00', 'Confirmed'),
(10, 10, 6, '2026-10-01 10:00:00', 'Confirmed'),
(11, 11, 6, '2026-10-01 10:00:00', 'Confirmed'),
(12, 12, 6, '2026-10-01 10:00:00', 'Confirmed'),
(13, 13, 6, '2026-10-01 10:00:00', 'Confirmed'),
(14, 14, 6, '2026-10-01 10:00:00', 'Confirmed'),
(15, 15, 6, '2026-10-01 10:00:00', 'Confirmed'),
(16, 16, 6, '2026-10-01 10:00:00', 'Confirmed'),
(17, 17, 6, '2026-10-01 10:00:00', 'Confirmed'),
(18, 18, 6, '2026-10-01 10:00:00', 'Confirmed'),
(19, 19, 6, '2026-10-01 10:00:00', 'Confirmed'),
(20, 20, 6, '2026-10-01 10:00:00', 'Confirmed'),
(21, 21, 6, '2026-10-01 10:00:00', 'Confirmed'),
(22, 22, 6, '2026-10-01 10:00:00', 'Confirmed'),
(23, 23, 6, '2026-10-01 10:00:00', 'Confirmed'),
(24, 24, 6, '2026-10-01 10:00:00', 'Confirmed'),
(25, 25, 6, '2026-10-01 10:00:00', 'Confirmed'),
(26, 26, 6, '2026-10-01 10:00:00', 'Confirmed'),
(27, 27, 6, '2026-10-01 10:00:00', 'Confirmed'),
(28, 28, 6, '2026-10-01 10:00:00', 'Confirmed'),
(29, 29, 6, '2026-10-01 10:00:00', 'Confirmed'),
(30, 30, 6, '2026-10-01 10:00:00', 'Confirmed'),
(31, 31, 6, '2026-10-01 10:00:00', 'Confirmed'),
(32, 32, 6, '2026-10-01 10:00:00', 'Confirmed'),
(33, 33, 6, '2026-10-01 10:00:00', 'Confirmed'),
(34, 34, 6, '2026-10-01 10:00:00', 'Confirmed'),
(35, 35, 6, '2026-10-01 10:00:00', 'Confirmed'),
(36, 36, 6, '2026-10-01 10:00:00', 'Confirmed'),
(37, 37, 6, '2026-10-01 10:00:00', 'Confirmed'),
(38, 38, 6, '2026-10-01 10:00:00', 'Confirmed'),
(39, 39, 6, '2026-10-01 10:00:00', 'Confirmed'),
(40, 40, 6, '2026-10-01 10:00:00', 'Confirmed');

-- B. Event 4 Registrations (Past Event: Participants 1-10 for Attendance & Certificate test)
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
(27, 1, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(28, 2, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(29, 3, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(30, 4, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(31, 5, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(32, 6, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(33, 7, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(34, 8, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(35, 9, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(36, 10, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(37, 11, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(38, 12, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(39, 13, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(40, 14, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(41, 15, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(42, 16, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(43, 17, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(44, 18, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(45, 19, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(46, 20, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(47, 21, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(48, 22, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(49, 23, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(50, 24, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(51, 25, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(52, 26, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(53, 27, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(54, 28, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(55, 29, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(56, 30, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(57, 31, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(58, 32, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(59, 33, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(60, 34, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(61, 35, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(62, 36, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid'),
(63, 37, 200.00, '2026-10-01 10:05:00', 'Card', 'Paid'),
(64, 38, 200.00, '2026-10-01 10:05:00', 'NetBanking', 'Paid'),
(65, 39, 200.00, '2026-10-01 10:05:00', 'Cash', 'Paid'),
(66, 40, 200.00, '2026-10-01 10:05:00', 'UPI', 'Paid');

-- 10. Attendance Records (Testing Certificate Eligibility View >= 75% vs < 75%)
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
