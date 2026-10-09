// client/src/pages/AdminCertificates.jsx - Certificate Eligibility View
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Award, CheckCircle2, XCircle, Filter, Download } from 'lucide-react';

export default function AdminCertificates() {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eligibilityList, setEligibilityList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await authFetch('/api/events');
        const data = await res.json();
        setEvents(data);
        if (data.length > 0) {
          // Default to event 4 (past event with marked attendance) or first event
          const pastEvent = data.find((e) => e.event_id === 4) || data[0];
          setSelectedEventId(String(pastEvent.event_id));
        }
      } catch (err) {
        showToast('Failed to load events', 'error');
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    async function loadEligibility() {
      try {
        setLoading(true);
        const res = await authFetch(`/api/certificates/event/${selectedEventId}`);
        const data = await res.json();
        setEligibilityList(data);
      } catch (err) {
        showToast('Failed to load certificate eligibility records', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadEligibility();
  }, [selectedEventId]);

  const eligibleCount = eligibilityList.filter((e) => e.eligible === 1).length;
  const inEligibleCount = eligibilityList.filter((e) => e.eligible === 0).length;

  return (
    <>
      <Header
        title="Certificate Eligibility Audit"
        subtitle="Computed directly by MySQL view certificate_eligibility (Attendance >= 75%)"
      />

      <div className="page-body">
        {/* Metric summary */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#F2F8EE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #dfe8d8' }}>
                <Award size={28} color="#6AA84F" />
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>75% Threshold Rule</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#333' }}>
                  {eligibleCount} of {eligibilityList.length} Participants Eligible
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Event:</span>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.map((e) => (
                  <option key={e.event_id} value={e.event_id}>
                    {e.event_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Audit Roster ({eligibilityList.length} Participants)</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Source: MySQL View <code>certificate_eligibility</code>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : eligibilityList.length === 0 ? (
            <div className="empty-state">
              <Award size={48} className="empty-state-icon" />
              <h3>No participant data</h3>
              <p className="text-muted">No registrations found for this event.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Registration ID</th>
                    <th>Participant Name</th>
                    <th>Email & Phone</th>
                    <th>Organization</th>
                    <th>Attendance %</th>
                    <th>Certificate Status</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibilityList.map((row) => (
                    <tr key={row.registration_id}>
                      <td style={{ fontWeight: 700 }}>#{row.registration_id}</td>
                      <td style={{ fontWeight: 600 }}>{row.participant_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div>{row.participant_email}</div>
                        <div className="text-muted">{row.participant_phone || 'N/A'}</div>
                      </td>
                      <td>{row.participant_organization || 'Woxsen University'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 60, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(parseFloat(row.attendance_pct || 0), 100)}%`,
                                height: '100%',
                                background: parseFloat(row.attendance_pct || 0) >= 75 ? '#6AA84F' : '#c0392b'
                              }}
                            />
                          </div>
                          <span style={{ fontWeight: 700 }}>
                            {row.attendance_pct !== null ? `${row.attendance_pct}%` : '0.0%'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {row.eligible === 1 ? (
                          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> Eligible
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <XCircle size={13} /> Not Eligible (&lt; 75%)
                          </span>
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
