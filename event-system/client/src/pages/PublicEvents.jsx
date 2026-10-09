// client/src/pages/PublicEvents.jsx - Browse Events Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Star,
  Info
} from 'lucide-react';

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [registering, setRegistering] = useState(false);
  const [conflictError, setConflictError] = useState('');

  const { user, token, authFetch } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openRegisterModal = (evt) => {
    if (!user) {
      showToast('Please sign in to register for events', 'info');
      navigate('/login');
      return;
    }
    if (user.role !== 'participant') {
      showToast('Only participants can register for events', 'error');
      return;
    }
    setSelectedEvent(evt);
    setConflictError('');
    setRegisterModalOpen(true);
  };

  const handleRegisterAndPay = async () => {
    if (!selectedEvent) return;
    setRegistering(true);
    setConflictError('');

    try {
      // 1. Create Registration
      const regRes = await authFetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent.event_id })
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.error || 'Registration failed');
      }

      const regId = regData.registration_id;

      // 2. Submit Payment if fee > 0, otherwise free
      const payRes = await authFetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: regId,
          amount: parseFloat(selectedEvent.fee || 0),
          payment_mode: paymentMode,
          status: 'Paid'
        })
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || 'Payment failed');
      }

      showToast('Registration and payment confirmed successfully!', 'success');
      setRegisterModalOpen(false);
      fetchEvents();
      navigate('/participant/registrations');
    } catch (err) {
      setConflictError(err.message);
      showToast(err.message, 'error');
    } finally {
      setRegistering(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.event_name.toLowerCase().includes(search.toLowerCase()) ||
      e.venue_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'All' || e.event_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <Header
        title="Explore Campus Events"
        subtitle="Discover academic symposiums, technical masterclasses, and cultural galas"
      />

      <div className="page-body">
        {/* Search & Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by event title, venue, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="events-search-input"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="#6b7a63" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Type:</span>
              {['All', 'Seminar', 'Workshop', 'Cultural'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-outline'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p style={{ marginTop: '1rem' }}>Loading events catalogue...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="card empty-state">
            <Calendar size={48} className="empty-state-icon" />
            <h3>No events found</h3>
            <p className="text-muted">Try adjusting your search criteria or filter type.</p>
          </div>
        )}

        {/* Events Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredEvents.map((evt) => {
            const isFull = evt.seats_left <= 0;
            const isPast = new Date(evt.end_datetime) < new Date();

            return (
              <div key={evt.event_id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge ${
                    evt.event_type === 'Seminar' ? 'badge-green' :
                    evt.event_type === 'Workshop' ? 'badge-warning' : 'badge-gray'
                  }`}>
                    {evt.event_type}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b78103', fontSize: '0.85rem', fontWeight: 700 }}>
                    {evt.avg_rating ? (
                      <>
                        <Star size={14} fill="#b78103" />
                        <span>{evt.avg_rating}</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>({evt.feedback_count})</span>
                      </>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>New</span>
                    )}
                  </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#333' }}>
                  {evt.event_name}
                </h2>
                <div className="accent-line" style={{ width: 36, marginBottom: '0.75rem' }} />

                <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {evt.description || 'Join this curated university session led by distinguished faculty and industry fellows.'}
                </p>

                {/* Event Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem', background: '#FBFDF9', padding: '0.75rem', borderRadius: '12px', border: '1px solid #dfe8d8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="#6AA84F" />
                    <span><strong>{evt.venue_name}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={15} color="#6AA84F" />
                    <span>{evt.start_datetime.replace('T', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={15} color="#6AA84F" />
                      <span>{evt.registered_count} / {evt.capacity} booked</span>
                    </div>
                    {isFull ? (
                      <span className="badge badge-danger">Capacity Reached</span>
                    ) : (
                      <span className="badge badge-green">{evt.seats_left} seats left</span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Fee and Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #edf2e8' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Registration Fee</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4C8A3A' }}>
                      {parseFloat(evt.fee) === 0 ? 'FREE' : `₹${parseFloat(evt.fee).toFixed(2)}`}
                    </span>
                  </div>

                  <button
                    onClick={() => openRegisterModal(evt)}
                    className={`btn ${isFull || isPast ? 'btn-outline' : 'btn-primary'}`}
                    disabled={isPast}
                    id={`register-btn-${evt.event_id}`}
                  >
                    {isPast ? 'Event Ended' : isFull ? 'Register (Test Capacity)' : 'Register & Pay'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Register & Pay Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title={selectedEvent ? `Register for ${selectedEvent.event_name}` : 'Register'}
      >
        {selectedEvent && (
          <div>
            {conflictError && (
              <div className="conflict-alert" id="register-conflict-alert">
                <AlertCircle size={20} />
                <div>
                  <strong>Registration Rejected by Database:</strong>
                  <div style={{ marginTop: '0.2rem' }}>{conflictError}</div>
                </div>
              </div>
            )}

            <div style={{ background: '#F2F8EE', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.88rem' }}>
                <div><strong>Venue:</strong> {selectedEvent.venue_name} (Capacity: {selectedEvent.capacity})</div>
                <div><strong>Seats Available:</strong> {selectedEvent.seats_left}</div>
                <div><strong>Time:</strong> {selectedEvent.start_datetime}</div>
                <div><strong>Registration Fee:</strong> ₹{parseFloat(selectedEvent.fee).toFixed(2)}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {['UPI', 'Card', 'NetBanking', 'Cash'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`btn btn-sm ${paymentMode === mode ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setRegisterModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRegisterAndPay}
                disabled={registering}
                id="confirm-registration-btn"
              >
                {registering ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : <><CheckCircle2 size={16} /> Confirm & Pay ₹{parseFloat(selectedEvent.fee).toFixed(2)}</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
