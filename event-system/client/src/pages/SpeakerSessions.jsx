// client/src/pages/SpeakerSessions.jsx - Speaker Portal Sessions
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mic2, Clock, Calendar, MapPin, Edit2, CheckCircle2 } from 'lucide-react';

export default function SpeakerSessions() {
  const { authFetch, user } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    session_title: '',
    session_date: '',
    start_time: '',
    end_time: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMySessions = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/sessions/speaker/me');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      showToast('Failed to load your assigned sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySessions();
  }, []);

  const openEditModal = (s) => {
    setEditingSession(s);
    setFormData({
      session_title: s.session_title,
      session_date: s.session_date,
      start_time: s.start_time.slice(0, 5),
      end_time: s.end_time.slice(0, 5)
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingSession) return;
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/sessions/${editingSession.session_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_title: formData.session_title.trim(),
          session_date: formData.session_date,
          start_time: formData.start_time + ':00',
          end_time: formData.end_time + ':00'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update session');

      showToast('Your session details were updated successfully!', 'success');
      setModalOpen(false);
      fetchMySessions();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title={`Speaker Workspace — ${user?.name}`}
        subtitle="Manage and refine your presentation titles and scheduling slots"
      />

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Assigned Presentation Keynotes ({sessions.length})</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>You may adjust session titles and time slots for your events</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <Mic2 size={48} className="empty-state-icon" />
              <h3>No speaker sessions assigned</h3>
              <p className="text-muted">You have no upcoming keynote sessions assigned to your profile yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {sessions.map((s) => (
                <div key={s.session_id} className="card" style={{ padding: '1.25rem', marginBottom: 0, border: '1.5px solid #dfe8d8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-green">{s.event_type}</span>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => openEditModal(s)}
                      id={`speaker-edit-btn-${s.session_id}`}
                    >
                      <Edit2 size={13} /> Edit Session
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#333', marginBottom: '0.5rem' }}>{s.session_title}</h3>
                  <div className="accent-line" style={{ width: 32, marginBottom: '0.75rem' }} />

                  <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#4C8A3A', marginBottom: '0.2rem' }}>{s.event_name}</div>
                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>{s.event_description}</p>
                  </div>

                  <div style={{ background: '#FAFBF9', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', border: '1px solid #edf2e8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="#6AA84F" />
                      <span>{s.session_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} color="#6AA84F" />
                      <span>{s.start_time.slice(0, 5)} — {s.end_time.slice(0, 5)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} color="#6AA84F" />
                      <span>{s.venue_name} ({s.venue_location})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSession ? `Edit: ${editingSession.session_title}` : 'Edit Session'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="sp-title">Session Title *</label>
            <input
              id="sp-title"
              type="text"
              required
              className="form-input"
              value={formData.session_title}
              onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sp-date">Session Date *</label>
            <input
              id="sp-date"
              type="date"
              required
              className="form-input"
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="sp-start">Start Time *</label>
              <input
                id="sp-start"
                type="time"
                required
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sp-end">End Time (CHECK end &gt; start) *</label>
              <input
                id="sp-end"
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
              {submitting ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : <><CheckCircle2 size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
