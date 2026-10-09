import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header({ title, subtitle, action }) {
  const { user, logout } = useAuth();

  return (
    <header className="top-header" id="app-top-header">
      <div className="header-title-container">
        <div>
          <h1 style={{ fontSize: '1.45rem', marginBottom: '0.1rem' }}>{title}</h1>
          {subtitle && <p className="text-muted" style={{ fontSize: '0.85rem' }}>{subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {action && <div>{action}</div>}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#F2F8EE', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid #dfe8d8' }}>
              <User size={16} color="#6AA84F" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
              <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', textTransform: 'capitalize' }}>{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                borderColor: '#e2bcbc',
                color: '#c0392b',
                background: '#fff9f9'
              }}
              title="Sign Out to switch roles"
              id="top-header-logout-btn"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
