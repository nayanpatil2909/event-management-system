// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CreditCard,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({
    eventsCount: 0,
    upcomingCount: 0,
    registrationsCount: 0,
    totalRevenue: '0.00',
    venuesCount: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        // Load events
        const eventsRes = await authFetch('/api/events');
        const events = await eventsRes.json();

        // Load venues
        const venuesRes = await authFetch('/api/venues');
        const venues = await venuesRes.json();

        // Load registrations
        const regsRes = await authFetch('/api/registrations');
        const regs = await regsRes.json();

        // Load revenue report
        const revRes = await authFetch('/api/reports/revenue');
        const revData = await revRes.json();

        const upcoming = events.filter((e) => new Date(e.end_datetime) >= new Date());

        setStats({
          eventsCount: events.length,
          upcomingCount: upcoming.length,
          registrationsCount: regs.filter((r) => r.status !== 'Cancelled').length,
          totalRevenue: revData.summary ? revData.summary.total_collected_revenue : '0.00',
          venuesCount: venues.length
        });

        setUpcomingEvents(upcoming.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <>
      <Header
        title="Administrative Overview"
        subtitle="Real-time venue operations, registrations tally, and scheduled sessions"
        action={
          <Link to="/admin/events" className="btn btn-primary btn-sm">
            <Plus size={16} /> Manage Events
          </Link>
        }
      />

      <div className="page-body">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Events</div>
            <div className="stat-value">{stats.eventsCount}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {stats.upcomingCount} upcoming on schedule
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Active Registrations</div>
            <div className="stat-value">{stats.registrationsCount}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Across all venues
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Collected Revenue</div>
            <div className="stat-value">₹{stats.totalRevenue}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Confirmed transactions
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Active Venues</div>
            <div className="stat-value">{stats.venuesCount}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Campus halls & labs
            </div>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/admin/events" className="card" style={{ textDecoration: 'none', padding: '1.25rem', transition: 'transform 0.15s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', background: '#F2F8EE', borderRadius: '12px' }}>
                  <Calendar size={20} color="#6AA84F" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#333' }}>Event Scheduling</h3>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>Create, edit & test venue overlap</p>
                </div>
              </div>
              <ArrowRight size={18} color="#6AA84F" />
            </div>
          </Link>

          <Link to="/admin/attendance" className="card" style={{ textDecoration: 'none', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', background: '#F2F8EE', borderRadius: '12px' }}>
                  <Users size={20} color="#6AA84F" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#333' }}>Mark Attendance</h3>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>Session-by-session roll calls</p>
                </div>
              </div>
              <ArrowRight size={18} color="#6AA84F" />
            </div>
          </Link>

          <Link to="/management/reports" className="card" style={{ textDecoration: 'none', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.6rem', background: '#F2F8EE', borderRadius: '12px' }}>
                  <TrendingUp size={20} color="#6AA84F" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#333' }}>Reports & CSV</h3>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>Utilization, revenue & exports</p>
                </div>
              </div>
              <ArrowRight size={18} color="#6AA84F" />
            </div>
          </Link>
        </div>

        {/* Upcoming Events Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Upcoming Campus Schedules</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Next upcoming sessions across university venues</p>
            </div>
            <Link to="/admin/events" className="btn btn-outline btn-sm">
              View All Events
            </Link>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="empty-state">
              <Calendar size={36} className="empty-state-icon" />
              <p>No upcoming events currently scheduled.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Venue</th>
                    <th>Date & Time</th>
                    <th>Registrations</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingEvents.map((e) => (
                    <tr key={e.event_id}>
                      <td style={{ fontWeight: 700 }}>{e.event_name}</td>
                      <td>
                        <span className={`badge ${e.event_type === 'Seminar' ? 'badge-green' : e.event_type === 'Workshop' ? 'badge-warning' : 'badge-gray'}`}>
                          {e.event_type}
                        </span>
                      </td>
                      <td>{e.venue_name}</td>
                      <td>{e.start_datetime.replace('T', ' ')}</td>
                      <td>{e.registered_count} / {e.capacity}</td>
                      <td style={{ fontWeight: 700, color: '#4C8A3A' }}>
                        {parseFloat(e.fee) === 0 ? 'Free' : `₹${parseFloat(e.fee).toFixed(2)}`}
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
