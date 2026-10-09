// client/src/pages/AdminSessions.jsx - Sessions & Speaker Scheduling
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Clock, Plus, Edit2, Trash2, Mic2, Calendar, CheckCircle2 } from 'lucide-react';

export default function AdminSessions() {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    event_id: '',
    speaker_id: '',
    session_title: '',
    session_date: '',
    start_time: '10:00',
    end_time: '12:00'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, eventsRes] = await Promise.all([
        authFetch('/api/sessions'),
        authFetch('/api/events')
      ]);
      const sessionsData = await sessionsRes.json();
      const eventsData = await eventsRes.json();
      setSessions(sessionsData);
      setEvents(eventsData);

      // Extract unique speakers from sessions
      const spMap = new Map();
      sessionsData.forEach((s) => {
        if (!spMap.has(s.speaker_id)) {
          spMap.set(s.speaker_id, {
            speaker_id: s.speaker_id,
            name: s.speaker_name,
            organization: s.speaker_organization
          });
        }
      });
      // Also fetch speakers 1..4
      if (spMap.size === 0) {
        setSpeakers([
          { speaker_id: 1, name: 'Dr. Arvind Swaminathan (Google AI)' },
          { speaker_id: 2, name: 'Ms. Ananya Roy (Microsoft Azure)' },
          { speaker_id: 3, name: 'Prof. Vikramaditya Sen (IIT Hyderabad)' },
          { speaker_id: 4, name: 'Mr. K. V. Rao (Woxsen School of Arts)' }
        ]);
      } else {
        setSpeakers(Array.from(spMap.values()));
      }
    } catch (err) {
      showToast('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingSession(null);
    setFormData({
      event_id: events[0]?.event_id || '',
      speaker_id: speakers[0]?.speaker_id || 1,
      session_title: '',
      session_date: '2026-11-15',
      start_time: '10:00',
      end_time: '12:00'
    });
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingSession(s);
    setFormData({
      event_id: s.event_id,
      speaker_id: s.speaker_id,
      session_title: s.session_title,
      session_date: s.session_date,
      start_time: s.start_time.slice(0, 5),
      end_time: s.end_time.slice(0, 5)
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingSession ? `/api/sessions/${editingSession.session_id}` : '/api/sessions';
      const method = editingSession ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          start_time: formData.start_time + ':00',
          end_time: formData.end_time + ':00'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save session');

      showToast(editingSession ? 'Session updated!' : 'Session scheduled!', 'success');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      const res = await authFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete session');
      showToast('Session deleted', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredSessions = selectedEventId === 'All'
    ? sessions
    : sessions.filter((s) => String(s.event_id) === String(selectedEventId));

  return (
    <>
      <Header
        title="Session Scheduling & Speaker Assignments"
        subtitle="Organize keynotes, masterclasses, and speaker allocations per event"
        action={
          <button className="btn btn-primary btn-sm" onClick={openCreateModal} id="create-session-btn">
            <Plus size={16} /> Schedule Session
          </button>
        }
      />

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Scheduled Sessions ({filteredSessions.length})</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Filter by event to view corresponding timeline</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Event:</span>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="All">All Events</option>
                {events.map((e) => (
                  <option key={e.event_id} value={e.event_id}>{e.event_name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Session Title</th>
                    <th>Parent Event</th>
                    <th>Keynote Speaker</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr key={s.session_id}>
                      <td style={{ fontWeight: 700 }}>{s.session_title}</td>
                      <td>{s.event_name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Mic2 size={15} color="#6AA84F" />
                          <span style={{ fontWeight: 600 }}>{s.speaker_name}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.speaker_organization}</div>
                      </td>
                      <td>{s.session_date}</td>
                      <td>
                        <span className="badge badge-green" style={{ fontSize: '0.78rem' }}>
                          <Clock size={12} /> {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditModal(s)}
                            id={`edit-session-btn-${s.session_id}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#c0392b' }}
                            onClick={() => handleDelete(s.session_id)}
                            id={`delete-session-btn-${s.session_id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSession ? `Edit Session: ${editingSession.session_title}` : 'Add New Session'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="sess-title">Session Title *</label>
            <input
              id="sess-title"
              type="text"
              required
              className="form-input"
              value={formData.session_title}
              onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="sess-event">Associated Event *</label>
              <select
                id="sess-event"
                required
                className="form-select"
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
              >
                {events.map((e) => (
                  <option key={e.event_id} value={e.event_id}>{e.event_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sess-speaker">Speaker Assigned *</label>
              <select
                id="sess-speaker"
                required
                className="form-select"
                value={formData.speaker_id}
                onChange={(e) => setFormData({ ...formData, speaker_id: e.target.value })}
              >
                {speakers.map((sp) => (
                  <option key={sp.speaker_id} value={sp.speaker_id}>
                    {sp.name} {sp.organization ? `(${sp.organization})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="sess-date">Session Date *</label>
              <input
                id="sess-date"
                type="date"
                required
                className="form-input"
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sess-start">Start Time *</label>
              <input
                id="sess-start"
                type="time"
                required
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sess-end">End Time (CHECK end &gt; start) *</label>
              <input
                id="sess-end"
                type="time"
                required
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : <><CheckCircle2 size={16} /> Save Session</>}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
