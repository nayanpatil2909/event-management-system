// client/src/pages/AdminEvents.jsx - Events Management with Real-Time Conflict Error Banner
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function AdminEvents() {
  const { authFetch, user } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [conflictError, setConflictError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    event_name: '',
    event_type: 'Seminar',
    start_datetime: '',
    end_datetime: '',
    fee: 0,
    venue_id: '',
    coordinator_id: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, venuesRes] = await Promise.all([
        authFetch('/api/events'),
        authFetch('/api/venues')
      ]);
      const eventsData = await eventsRes.json();
      const venuesData = await venuesRes.json();
      setEvents(eventsData);
      setVenues(venuesData);
    } catch (err) {
      showToast('Error loading events & venues', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setConflictError('');
    setFormData({
      event_name: '',
      event_type: 'Seminar',
      start_datetime: '2026-11-15T09:30',
      end_datetime: '2026-11-15T17:30',
      fee: 0,
      venue_id: venues[0]?.venue_id || '',
      coordinator_id: user?.coordinator_id || 1,
      description: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setConflictError('');
    setFormData({
      event_name: evt.event_name,
      event_type: evt.event_type,
      start_datetime: evt.start_datetime.replace(' ', 'T').slice(0, 16),
      end_datetime: evt.end_datetime.replace(' ', 'T').slice(0, 16),
      fee: evt.fee,
      venue_id: evt.venue_id,
      coordinator_id: evt.coordinator_id || 1,
      description: evt.description || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');
    setSubmitting(true);

    try {
      const url = editingEvent ? `/api/events/${editingEvent.event_id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        start_datetime: formData.start_datetime.replace('T', ' ') + ':00',
        end_datetime: formData.end_datetime.replace('T', ' ') + ':00',
        fee: parseFloat(formData.fee),
        venue_id: parseInt(formData.venue_id, 10),
        coordinator_id: parseInt(formData.coordinator_id, 10)
      };

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event');
      }

      showToast(editingEvent ? 'Event updated!' : 'Event scheduled successfully!', 'success');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setConflictError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove sessions.')) return;
    try {
      const res = await authFetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete event');
      }
      showToast('Event deleted', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <Header
        title="Event Scheduling & Venue Allocations"
        subtitle="Manage academic calendar, assign halls, and detect scheduling conflicts"
        action={
          <button className="btn btn-primary btn-sm" onClick={openCreateModal} id="create-event-btn">
            <Plus size={16} /> Schedule New Event
          </button>
        }
      />

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Scheduled University Events</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Full roster of active, past, and upcoming events</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} className="empty-state-icon" />
              <h3>No events registered</h3>
              <p className="text-muted">Get started by creating your first event schedule.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Event Details</th>
                    <th>Type</th>
                    <th>Assigned Venue</th>
                    <th>Schedule Window</th>
                    <th>Capacity / Bookings</th>
                    <th>Fee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt.event_id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#333' }}>{evt.event_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>Coord: {evt.coordinator_name}</div>
                      </td>
                      <td>
                        <span className={`badge ${evt.event_type === 'Seminar' ? 'badge-green' : evt.event_type === 'Workshop' ? 'badge-warning' : 'badge-gray'}`}>
                          {evt.event_type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{evt.venue_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{evt.venue_location}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div><strong>Start:</strong> {evt.start_datetime.replace('T', ' ')}</div>
                        <div><strong>End:</strong> {evt.end_datetime.replace('T', ' ')}</div>
                      </td>
                      <td>
                        <div>{evt.registered_count} / {evt.capacity} seats</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{evt.seats_left} available</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#4C8A3A' }}>
                        {parseFloat(evt.fee) === 0 ? 'Free' : `₹${parseFloat(evt.fee).toFixed(2)}`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            title="Edit Event"
                            onClick={() => openEditModal(evt)}
                            id={`edit-event-btn-${evt.event_id}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            title="Delete Event"
                            style={{ color: '#c0392b' }}
                            onClick={() => handleDelete(evt.event_id)}
                            id={`delete-event-btn-${evt.event_id}`}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? `Edit Event: ${editingEvent.event_name}` : 'Schedule New Event'}
      >
        <div>
          {/* Conflict Error Banner */}
          {conflictError && (
            <div className="conflict-alert" id="venue-conflict-alert" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={22} style={{ flexShrink: 0 }} />
              <div>
                <strong>Database Trigger Conflict (SQLSTATE 45000):</strong>
                <div style={{ marginTop: '0.2rem' }}>{conflictError}</div>
                <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: '#555' }}>
                  Please select an alternative venue or change the schedule timeframe to resolve the overlap.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="evt-name">Event Title *</label>
              <input
                id="evt-name"
                type="text"
                required
                className="form-input"
                placeholder="e.g. Woxsen Deep Learning Symposium"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="evt-type">Event Type *</label>
                <select
                  id="evt-type"
                  className="form-select"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                >
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cultural">Cultural</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-venue">Venue Allocation *</label>
                <select
                  id="evt-venue"
                  required
                  className="form-select"
                  value={formData.venue_id}
                  onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                >
                  <option value="">Select a venue</option>
                  {venues.map((v) => (
                    <option key={v.venue_id} value={v.venue_id}>
                      {v.venue_name} (Capacity: {v.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="evt-start">Start Date & Time *</label>
                <input
                  id="evt-start"
                  type="datetime-local"
                  required
                  className="form-input"
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-end">End Date & Time *</label>
                <input
                  id="evt-end"
                  type="datetime-local"
                  required
                  className="form-input"
                  value={formData.end_datetime}
                  onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="evt-fee">Registration Fee (₹)</label>
                <input
                  id="evt-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="form-input"
                  placeholder="0.00"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="evt-coord">Coordinator ID</label>
                <input
                  id="evt-coord"
                  type="number"
                  required
                  className="form-input"
                  value={formData.coordinator_id}
                  onChange={(e) => setFormData({ ...formData, coordinator_id: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="evt-desc">Event Description</label>
              <textarea
                id="evt-desc"
                rows={3}
                className="form-textarea"
                placeholder="Key objectives, keynote agenda, prerequisites..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                id="save-event-submit-btn"
              >
                {submitting ? (
                  <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  <><CheckCircle2 size={16} /> {editingEvent ? 'Save Changes' : 'Confirm Schedule'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
