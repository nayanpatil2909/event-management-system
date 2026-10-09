// client/src/pages/AdminPayments.jsx - Payment Records & Transaction Verification
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CreditCard, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminPayments() {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    registration_id: '',
    amount: '',
    payment_mode: 'UPI',
    status: 'Paid'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      showToast('Failed to load payment transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openRecordModal = () => {
    setFormError('');
    setFormData({
      registration_id: '',
      amount: '',
      payment_mode: 'Cash',
      status: 'Paid'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await authFetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: parseInt(formData.registration_id, 10),
          amount: parseFloat(formData.amount),
          payment_mode: formData.payment_mode,
          status: formData.status
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      showToast('Payment recorded and registration status synchronized!', 'success');
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      setFormError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <>
      <Header
        title="Payment Records & Audit Trail"
        subtitle="Live payment verification with automatic registration confirmation"
        action={
          <button className="btn btn-primary btn-sm" onClick={openRecordModal} id="record-payment-btn">
            <Plus size={16} /> Record Payment
          </button>
        }
      />

      <div className="page-body">
        {/* Metric banner */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#F2F8EE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Verified Collection</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4C8A3A', fontFamily: 'var(--font-heading)' }}>
                ₹{totalCollected.toFixed(2)}
              </div>
            </div>
            <div style={{ fontSize: '0.88rem' }}>
              <div><strong>Total Transactions:</strong> {payments.length}</div>
              <div className="text-muted">Enforced atomic concurrency on checkout</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Transaction Records ({payments.length})</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Full log of Cash, Card, UPI, and NetBanking payments</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Registration ID</th>
                    <th>Participant</th>
                    <th>Event</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Date / Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.payment_id}>
                      <td style={{ fontWeight: 700 }}>#{p.payment_id}</td>
                      <td>#{p.registration_id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.participant_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.participant_email}</div>
                      </td>
                      <td>{p.event_name}</td>
                      <td style={{ fontWeight: 700, color: '#4C8A3A' }}>₹{parseFloat(p.amount).toFixed(2)}</td>
                      <td>
                        <span className="badge badge-gray">{p.payment_mode}</span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{p.payment_date ? p.payment_date.replace('T', ' ') : 'N/A'}</td>
                      <td>
                        <span className={`badge ${p.status === 'Paid' ? 'badge-green' : p.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                          {p.status}
                        </span>
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
        title="Record Payment Transaction"
      >
        {formError && (
          <div className="conflict-alert" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={20} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="pay-reg-id">Registration ID *</label>
            <input
              id="pay-reg-id"
              type="number"
              required
              className="form-input"
              placeholder="e.g. 54"
              value={formData.registration_id}
              onChange={(e) => setFormData({ ...formData, registration_id: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pay-amount">Amount (CHECK amount &gt;= 0) *</label>
              <input
                id="pay-amount"
                type="number"
                min="0"
                step="0.01"
                required
                className="form-input"
                placeholder="500.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pay-mode">Payment Mode *</label>
              <select
                id="pay-mode"
                className="form-select"
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="NetBanking">NetBanking</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-status">Status *</label>
            <select
              id="pay-status"
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Paid">Paid (Will auto-confirm registration)</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : <><CheckCircle2 size={16} /> Submit Transaction</>}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
