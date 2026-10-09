// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, LogIn, Key, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div style={{ maxWidth: 460, margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#F2F8EE', borderRadius: '16px', marginBottom: '0.75rem' }}>
            <Calendar size={32} color="#6AA84F" />
          </div>
          <h1>System Sign In</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Event Registration & Venue Scheduling</p>
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
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                className="form-input"
                placeholder="name@woxsen.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? <span className="loading-spinner" style={{ width: 18, height: 18 }} /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        {/* Demo Fast-Login Selector */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #dfe8d8' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7a63', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Quick Demo Logins (Click to autofill):
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemo('admin@woxsen.edu.in', 'Admin@123')}
              id="demo-admin-btn"
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemo('coord1@woxsen.edu.in', 'Coord@123')}
              id="demo-coord-btn"
            >
              Coordinator
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemo('speaker1@woxsen.edu.in', 'Speaker@123')}
              id="demo-speaker-btn"
            >
              Speaker
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemo('participant1@woxsen.edu.in', 'Participant@123')}
              id="demo-part-btn"
            >
              Participant 1
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemo('management@woxsen.edu.in', 'Manage@123')}
              id="demo-manage-btn"
            >
              Management
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.88rem' }}>
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register" style={{ color: '#4C8A3A', fontWeight: 700, textDecoration: 'none' }}>
            Register as Participant
          </Link>
        </div>
      </div>
    </div>
  );
}
