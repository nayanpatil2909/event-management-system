// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ShieldAlert, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organization: 'Woxsen University'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await register(formData);
      showToast(`Account created! Welcome, ${user.name}`, 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#F2F8EE', borderRadius: '16px', marginBottom: '0.75rem' }}>
            <Calendar size={32} color="#6AA84F" />
          </div>
          <h1>Participant Registration</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Join seminars, workshops, and university galas</p>
          <div className="accent-line" style={{ margin: '0.75rem auto' }} />
        </div>

        {errorMsg && (
          <div className="conflict-alert" style={{ marginBottom: '1.25rem' }}>
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name *</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              required
              className="form-input"
              placeholder="e.g. Nayan Patil"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              required
              className="form-input"
              placeholder="nayan@woxsen.edu.in"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password (minimum 6 characters) *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              required
              minLength={6}
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-org">Organization / School</label>
              <input
                id="reg-org"
                type="text"
                name="organization"
                className="form-input"
                placeholder="Woxsen University"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? <span className="loading-spinner" style={{ width: 18, height: 18 }} /> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem' }}>
          <span className="text-muted">Already registered? </span>
          <Link to="/login" style={{ color: '#4C8A3A', fontWeight: 700, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
