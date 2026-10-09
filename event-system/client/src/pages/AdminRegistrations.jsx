// client/src/pages/AdminRegistrations.jsx - Registrations Management & Roster
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Filter, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';

export default function AdminRegistrations() {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regsRes, eventsRes] = await Promise.all([
        authFetch('/api/registrations'),
        authFetch('/api/events')
      ]);
      const regsData = await regsRes.json();
      const eventsData = await eventsRes.json();
      setRegistrations(regsData);
      setEvents(eventsData);
    } catch (err) {
      showToast('Failed to load registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelRegistration = async (regId) => {
    if (!window.confirm('Cancel this registration? This will update status to Cancelled and free up venue capacity.')) return;
    try {
      const res = await authFetch(`/api/registrations/${regId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel');
      showToast('Registration cancelled and capacity restored', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesEvent = selectedEventId === 'All' || String(r.event_id) === String(selectedEventId);
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesEvent && matchesStatus;
  });

  return (
    <>
      <Header
        title="Participant Registrations & Enrollment Roster"
        subtitle="Track registration status, payment states, and manage participant entries"
      />

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Enrollment Records ({filteredRegistrations.length})</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Filter by event and registration state</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Event:</span>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Status:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-state-icon" />
              <h3>No registration records found</h3>
              <p className="text-muted">No entries match the chosen filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Participant</th>
                    <th>Event</th>
                    <th>Date Registered</th>
                    <th>Enrollment Status</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((r) => (
                    <tr key={r.registration_id}>
                      <td style={{ fontWeight: 700 }}>#{r.registration_id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.participant_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.participant_email}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.participant_organization}</div>
                      </td>
                      <td>{r.event_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>{r.reg_date ? r.reg_date.replace('T', ' ') : 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          r.status === 'Confirmed' ? 'badge-green' :
                          r.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          r.payment_status === 'Paid' ? 'badge-green' :
                          r.payment_status === 'Pending' ? 'badge-warning' : 'badge-gray'
                        }`}>
                          {r.payment_status || 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        {r.status !== 'Cancelled' && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#c0392b' }}
                            onClick={() => handleCancelRegistration(r.registration_id)}
                            title="Cancel Registration"
                            id={`cancel-reg-btn-${r.registration_id}`}
                          >
                            <Trash2 size={14} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
