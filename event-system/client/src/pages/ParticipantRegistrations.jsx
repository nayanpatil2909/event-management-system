// client/src/pages/ParticipantRegistrations.jsx - Participant Registrations & Feedback Portal
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  CreditCard,
  Award,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
  Trash2,
  MessageSquare
} from 'lucide-react';

export default function ParticipantRegistrations() {
  const { authFetch, user } = useAuth();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedRegForPay, setSelectedRegForPay] = useState(null);
  const [payMode, setPayMode] = useState('UPI');
  const [paying, setPaying] = useState(false);

  // Feedback Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedRegForFeedback, setSelectedRegForFeedback] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/registrations/me');
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      showToast('Failed to load your registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const openPayModal = (reg) => {
    setSelectedRegForPay(reg);
    setPayMode('UPI');
    setPayModalOpen(true);
  };

  const handlePay = async () => {
    if (!selectedRegForPay) return;
    setPaying(true);
    try {
      const res = await authFetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: selectedRegForPay.registration_id,
          amount: parseFloat(selectedRegForPay.fee || 0),
          payment_mode: payMode,
          status: 'Paid'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      showToast('Payment confirmed! Registration is now Confirmed.', 'success');
      setPayModalOpen(false);
      fetchMyRegistrations();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPaying(false);
    }
  };

  const openFeedbackModal = (reg) => {
    setSelectedRegForFeedback(reg);
    setRating(reg.feedback_rating || 5);
    setComments(reg.feedback_comments || '');
    setFeedbackError('');
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedRegForFeedback) return;
    setSubmittingFeedback(true);
    setFeedbackError('');

    try {
      const res = await authFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: selectedRegForFeedback.registration_id,
          rating,
          comments
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Feedback submission failed');

      showToast('Feedback submitted successfully! Thank you.', 'success');
      setFeedbackModalOpen(false);
      fetchMyRegistrations();
    } catch (err) {
      setFeedbackError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCancel = async (regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      const res = await authFetch(`/api/registrations/${regId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel registration');
      showToast('Registration cancelled', 'success');
      fetchMyRegistrations();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <Header
        title={`My Event Registrations — ${user?.name}`}
        subtitle="Manage tickets, track certificate attendance eligibility, and share feedback"
      />

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Active Enrollments ({registrations.length})</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Track payments, attendance % and certificate awards</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} className="empty-state-icon" />
              <h3>No event registrations yet</h3>
              <p className="text-muted">Browse our campus events catalogue to register for symposiums and workshops.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {registrations.map((r) => {
                const isPaid = r.payment_status === 'Paid' || parseFloat(r.fee) === 0;
                const hasFeedback = !!r.feedback_id;

                return (
                  <div key={r.registration_id} className="card" style={{ padding: '1.25rem', marginBottom: 0, border: '1.5px solid #dfe8d8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className={`badge ${r.status === 'Confirmed' ? 'badge-green' : r.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {r.status}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                        Reg #{r.registration_id}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: '#333', marginBottom: '0.35rem' }}>{r.event_name}</h3>
                    <div className="accent-line" style={{ width: 32, marginBottom: '0.75rem' }} />

                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#6AA84F" />
                        <span>{r.venue_name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} color="#6AA84F" />
                        <span>{r.start_datetime.replace('T', ' ')}</span>
                      </div>
                    </div>

                    {/* Attendance & Certificate Eligibility Indicator */}
                    <div style={{ background: '#FAFBF9', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1rem', border: '1px solid #edf2e8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span className="text-muted">Attendance Progress:</span>
                        <strong>{r.attendance_pct !== null ? `${r.attendance_pct}%` : 'Not marked yet'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-muted">Certificate Status:</span>
                        {r.certificate_eligible === 1 ? (
                          <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                            <Award size={12} /> Eligible (&gt;= 75%)
                          </span>
                        ) : r.attendance_pct !== null ? (
                          <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                            &lt; 75% Attendance
                          </span>
                        ) : (
                          <span className="badge badge-gray" style={{ fontSize: '0.72rem' }}>
                            Awaiting Sessions
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #edf2e8' }}>
                      {!isPaid && r.status !== 'Cancelled' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openPayModal(r)}
                          id={`pay-now-btn-${r.registration_id}`}
                        >
                          <CreditCard size={14} /> Pay ₹{parseFloat(r.fee).toFixed(2)}
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4C8A3A' }}>
                          ✓ Ticket Paid
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {r.status !== 'Cancelled' && (
                          <button
                            type="button"
                            className={`btn btn-sm ${hasFeedback ? 'btn-outline' : 'btn-secondary'}`}
                            onClick={() => openFeedbackModal(r)}
                            id={`feedback-btn-${r.registration_id}`}
                          >
                            <Star size={13} fill={hasFeedback ? '#6AA84F' : 'none'} />
                            {hasFeedback ? `Feedback (${r.feedback_rating}★)` : 'Give Feedback'}
                          </button>
                        )}
                        {r.status !== 'Cancelled' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#c0392b' }}
                            onClick={() => handleCancel(r.registration_id)}
                            title="Cancel Registration"
                            id={`cancel-my-reg-${r.registration_id}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pay Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={selectedRegForPay ? `Pay Fee for ${selectedRegForPay.event_name}` : 'Submit Payment'}
      >
        {selectedRegForPay && (
          <div>
            <div style={{ background: '#F2F8EE', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem' }}>
                <div><strong>Event:</strong> {selectedRegForPay.event_name}</div>
                <div><strong>Amount Due:</strong> ₹{parseFloat(selectedRegForPay.fee).toFixed(2)}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Payment Channel</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {['UPI', 'Card', 'NetBanking', 'Cash'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPayMode(mode)}
                    className={`btn btn-sm ${payMode === mode ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setPayModalOpen(false)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePay}
                disabled={paying}
                id="submit-payment-confirm-btn"
              >
                {paying ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : <><CheckCircle2 size={16} /> Confirm ₹{parseFloat(selectedRegForPay.fee).toFixed(2)}</>}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title={selectedRegForFeedback ? `Session Feedback: ${selectedRegForFeedback.event_name}` : 'Feedback'}
      >
        <div>
          {feedbackError && (
            <div className="conflict-alert" id="feedback-conflict-alert" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={20} />
              <div>
                <strong>Attendance Constraint Enforced:</strong>
                <div style={{ marginTop: '0.2rem' }}>{feedbackError}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitFeedback}>
            <div className="form-group">
              <label className="form-label">Overall Rating (1 to 5 Stars) *</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      color: star <= rating ? '#f39c12' : '#dfe8d8'
                    }}
                    id={`star-rating-btn-${star}`}
                  >
                    <Star size={30} fill={star <= rating ? '#f39c12' : 'none'} />
                  </button>
                ))}
                <span style={{ marginLeft: '0.5rem', fontWeight: 700, fontSize: '1.1rem', color: '#4C8A3A' }}>
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fb-comments">Detailed Comments & Key Takeaways</label>
              <textarea
                id="fb-comments"
                rows={4}
                className="form-textarea"
                placeholder="What did you think of the venue acoustic quality, keynote presentation, and technical discussions?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setFeedbackModalOpen(false)}>Close</button>
              <button type="submit" className="btn btn-primary" disabled={submittingFeedback} id="submit-feedback-btn">
                {submittingFeedback ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : <><CheckCircle2 size={16} /> Submit Feedback</>}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
