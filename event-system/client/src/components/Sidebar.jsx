// client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Calendar,
  Compass,
  MapPin,
  Clock,
  Users,
  CreditCard,
  CheckSquare,
  Award,
  BarChart3,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Mic2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar" id="app-sidebar">
      <div className="sidebar-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="brand-title">
            <Calendar size={24} color="#6AA84F" />
            <span>Woxsen Events</span>
          </div>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {/* Public browse always visible */}
        <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Compass size={18} />
          <span>Browse Events</span>
        </NavLink>

        {/* Admin and Coordinator Navigation */}
        {user && (user.role === 'admin' || user.role === 'coordinator') && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Events</span>
            </NavLink>
            <NavLink to="/admin/venues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MapPin size={18} />
              <span>Venues</span>
            </NavLink>
            <NavLink to="/admin/sessions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Clock size={18} />
              <span>Sessions</span>
            </NavLink>
            <NavLink to="/admin/registrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Registrations</span>
            </NavLink>
            <NavLink to="/admin/payments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} />
              <span>Payments</span>
            </NavLink>
            <NavLink to="/admin/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CheckSquare size={18} />
              <span>Attendance</span>
            </NavLink>
            <NavLink to="/admin/certificates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Award size={18} />
              <span>Certificates</span>
            </NavLink>
            <NavLink to="/management/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
          </>
        )}

        {/* Speaker Navigation */}
        {user && user.role === 'speaker' && (
          <NavLink to="/speaker/sessions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Mic2 size={18} />
            <span>My Sessions</span>
          </NavLink>
        )}

        {/* Participant Navigation */}
        {user && user.role === 'participant' && (
          <NavLink to="/participant/registrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Award size={18} />
            <span>My Registrations</span>
          </NavLink>
        )}

        {/* Management Navigation */}
        {user && user.role === 'management' && (
          <NavLink to="/management/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Analytics & Reports</span>
          </NavLink>
        )}

        {/* Guest links */}
        {!user && (
          <>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LogIn size={18} />
              <span>Sign In</span>
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <UserPlus size={18} />
              <span>Register</span>
            </NavLink>
          </>
        )}
        {/* Sign Out / Switch Role button inside sidebar navigation */}
        {user && (
          <button
            onClick={logout}
            className="nav-link"
            style={{
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              color: 'var(--color-error, #c0392b)',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            title="Sign out and switch to another role"
            id="nav-logout-btn"
          >
            <LogOut size={18} />
            <span>Sign Out ({user.role})</span>
          </button>
        )}
      </nav>

      {/* User profile footer */}
      {user && (
        <div className="sidebar-user">
          <div className="user-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
              <div className="user-info-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || user.email}
              </div>
              <div className="user-info-role" style={{ textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
              title="Sign Out to switch role"
              id="sidebar-logout-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
