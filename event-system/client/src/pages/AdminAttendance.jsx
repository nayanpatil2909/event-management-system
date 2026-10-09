// client/src/pages/AdminAttendance.jsx - Session Roll Call & Attendance Marking
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckSquare, Save, Users, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function AdminAttendance() {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [roster, setRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load events on mount
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await authFetch('/api/events');
        const data = await res.json();
        setEvents(data);
        if (data.length > 0) {
          // Select event with sessions (e.g. event 4 or first event)
          setSelectedEventId(String(data[0].event_id));
        }
      } catch (err) {
        showToast('Failed to load events', 'error');
      }
    }
    loadEvents();
  }, []);

  // When selected event changes, load its sessions
  useEffect(() => {
    if (!selectedEventId) return;
    async function loadSessions() {
      try {
        const res = await authFetch(`/api/sessions?event_id=${selectedEventId}`);
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId(String(data[0].session_id));
        } else {
          setSelectedSessionId('');
          setRoster([]);
        }
      } catch (err) {
        showToast('Failed to load sessions', 'error');
      }
    }
    loadSessions();
  }, [selectedEventId]);

  // When selected session changes, load attendance roster
  useEffect(() => {
    if (!selectedSessionId) {
      setRoster([]);
      return;
    }
    async function loadRoster() {
      try {
        setLoading(true);
        const res = await authFetch(`/api/attendance/session/${selectedSessionId}`);
        const data = await res.json();
        setRoster(data.participants || []);

        // Initialize attendance map
        const initialMap = {};
        (data.participants || []).forEach((p) => {
          initialMap[p.registration_id] = p.attendance_status || 'Present';
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        showToast('Failed to load attendance roster', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadRoster();
  }, [selectedSessionId]);

  const setStatus = (regId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [regId]: status }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    roster.forEach((p) => {
      updated[p.registration_id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSessionId || roster.length === 0) return;
    setSaving(true);
    try {
      const records = roster.map((p) => ({
        registration_id: p.registration_id,
        status: attendanceMap[p.registration_id] || 'Present'
      }));

      const res = await authFetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: parseInt(selectedSessionId, 10),
          records
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');

      showToast('Attendance recorded and certificates eligibility recalculated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'Absent').length;

  return (
    <>
      <Header
        title="Session Attendance & Roll Call"
        subtitle="Mark live session presence; drives the 75% certificate eligibility rule"
      />

      <div className="page-body">
        {/* Event & Session Pickers Card */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="att-event-select">1. Select Event</label>
              <select
                id="att-event-select"
                className="form-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.map((e) => (
                  <option key={e.event_id} value={e.event_id}>
                    {e.event_name} ({e.event_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="att-session-select">2. Select Session</label>
              <select
                id="att-session-select"
                className="form-select"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={sessions.length === 0}
              >
                {sessions.length === 0 && <option value="">No sessions scheduled for this event</option>}
                {sessions.map((s) => (
                  <option key={s.session_id} value={s.session_id}>
                    {s.session_title} — {s.start_time.slice(0, 5)} to {s.end_time.slice(0, 5)} ({s.speaker_name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Marking Table */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2>Roster Marking ({roster.length} Registered)</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Present: <strong style={{ color: '#4C8A3A' }}>{presentCount}</strong> | Absent: <strong style={{ color: '#c0392b' }}>{absentCount}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleMarkAll('Present')}
              >
                Mark All Present
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleMarkAll('Absent')}
              >
                Mark All Absent
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveAttendance}
                disabled={saving || roster.length === 0}
                id="save-attendance-btn"
              >
                {saving ? (
                  <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  <><Save size={16} /> Save Attendance</>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : roster.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-state-icon" />
              <h3>No registered participants</h3>
              <p className="text-muted">There are no confirmed registrations for this session's parent event.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Participant Name</th>
                    <th>Email & Phone</th>
                    <th>Status</th>
                    <th style={{ width: '220px' }}>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((p) => {
                    const currentStatus = attendanceMap[p.registration_id] || 'Present';
                    return (
                      <tr key={p.registration_id}>
                        <td style={{ fontWeight: 700 }}>#{p.registration_id}</td>
                        <td style={{ fontWeight: 600 }}>{p.participant_name}</td>
                        <td style={{ fontSize: '0.82rem' }}>
                          <div>{p.participant_email}</div>
                          <div className="text-muted">{p.participant_phone || 'No phone'}</div>
                        </td>
                        <td>
                          <span className={`badge ${currentStatus === 'Present' ? 'badge-green' : 'badge-danger'}`}>
                            {currentStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'inline-flex', background: '#F2F8EE', borderRadius: '8px', padding: '0.2rem', border: '1px solid #dfe8d8' }}>
                            <button
                              type="button"
                              onClick={() => setStatus(p.registration_id, 'Present')}
                              className={`btn btn-sm ${currentStatus === 'Present' ? 'btn-primary' : 'btn-outline'}`}
                              style={{ padding: '0.25rem 0.65rem', border: 'none' }}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus(p.registration_id, 'Absent')}
                              className={`btn btn-sm ${currentStatus === 'Absent' ? 'btn-danger' : 'btn-outline'}`}
                              style={{ padding: '0.25rem 0.65rem', border: 'none' }}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
