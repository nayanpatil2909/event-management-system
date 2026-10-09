-- Woxsen University DBMS Project 31
-- Event Registration & Venue Scheduling System
-- Source of Truth Database Schema

DROP VIEW IF EXISTS certificate_eligibility;
DROP TRIGGER IF EXISTS trg_venue_overlap_ins;
DROP TRIGGER IF EXISTS trg_venue_overlap_upd;
DROP TRIGGER IF EXISTS trg_capacity;

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS registration;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS speaker;
DROP TABLE IF EXISTS participant;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS coordinator;
DROP TABLE IF EXISTS venue;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','coordinator','speaker','participant','management') NOT NULL
);

CREATE TABLE venue (
  venue_id INT AUTO_INCREMENT PRIMARY KEY,
  venue_name VARCHAR(100) NOT NULL,
  location VARCHAR(150),
  capacity INT NOT NULL CHECK (capacity > 0)
);

CREATE TABLE coordinator (
  coordinator_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE event (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(150) NOT NULL,
  event_type ENUM('Seminar','Workshop','Cultural') NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  description TEXT,
  venue_id INT NOT NULL,
  coordinator_id INT NOT NULL,
  CHECK (end_datetime > start_datetime),
  FOREIGN KEY (venue_id) REFERENCES venue(venue_id),
  FOREIGN KEY (coordinator_id) REFERENCES coordinator(coordinator_id)
);

CREATE TABLE speaker (
  speaker_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  organization VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE session (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  speaker_id INT NOT NULL,
  session_title VARCHAR(150) NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (end_time > start_time),
  FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
  FOREIGN KEY (speaker_id) REFERENCES speaker(speaker_id)
);

CREATE TABLE participant (
  participant_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  organization VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE registration (
  registration_id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  event_id INT NOT NULL,
  reg_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  UNIQUE (participant_id, event_id),
  FOREIGN KEY (participant_id) REFERENCES participant(participant_id),
  FOREIGN KEY (event_id) REFERENCES event(event_id)
);

CREATE TABLE payment (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_mode ENUM('Cash','Card','UPI','NetBanking'),
  status ENUM('Paid','Pending','Failed') DEFAULT 'Pending',
  FOREIGN KEY (registration_id) REFERENCES registration(registration_id)
);

CREATE TABLE attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  session_id INT NOT NULL,
  status ENUM('Present','Absent') NOT NULL,
  UNIQUE (registration_id, session_id),
  FOREIGN KEY (registration_id) REFERENCES registration(registration_id),
  FOREIGN KEY (session_id) REFERENCES session(session_id)
);

CREATE TABLE feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT UNIQUE NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  FOREIGN KEY (registration_id) REFERENCES registration(registration_id)
);

-- Useful performance indexes
CREATE INDEX idx_event_venue ON event(venue_id);
CREATE INDEX idx_event_start ON event(start_datetime);
CREATE INDEX idx_registration_event ON registration(event_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);

DELIMITER //
CREATE TRIGGER trg_venue_overlap_ins BEFORE INSERT ON event FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM event WHERE venue_id = NEW.venue_id
             AND NEW.start_datetime < end_datetime AND NEW.end_datetime > start_datetime) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Venue already booked for this time';
  END IF;
END//

CREATE TRIGGER trg_venue_overlap_upd BEFORE UPDATE ON event FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM event WHERE venue_id = NEW.venue_id AND event_id <> NEW.event_id
             AND NEW.start_datetime < end_datetime AND NEW.end_datetime > start_datetime) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Venue already booked for this time';
  END IF;
END//

CREATE TRIGGER trg_capacity BEFORE INSERT ON registration FOR EACH ROW
BEGIN
  IF (SELECT COUNT(*) FROM registration WHERE event_id = NEW.event_id AND status <> 'Cancelled')
     >= (SELECT v.capacity FROM venue v JOIN event e ON e.venue_id = v.venue_id WHERE e.event_id = NEW.event_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Venue capacity reached';
  END IF;
END//
DELIMITER ;

CREATE VIEW certificate_eligibility AS
SELECT r.registration_id, r.participant_id, r.event_id,
  ROUND(100 * SUM(a.status='Present') / NULLIF((SELECT COUNT(*) FROM session s WHERE s.event_id = r.event_id),0), 1) AS attendance_pct,
  (100 * SUM(a.status='Present') / NULLIF((SELECT COUNT(*) FROM session s WHERE s.event_id = r.event_id),0)) >= 75 AS eligible
FROM registration r LEFT JOIN attendance a ON a.registration_id = r.registration_id
GROUP BY r.registration_id, r.participant_id, r.event_id;
