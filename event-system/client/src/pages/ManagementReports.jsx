// client/src/pages/ManagementReports.jsx - Management & Admin Analytics & Reports
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Download,
  BarChart3,
  IndianRupee,
  MapPin,
  Star,
  Award,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';

const COLORS = ['#6AA84F', '#4C8A3A', '#93C47D', '#B6D7A8', '#D9EAD3', '#38761D'];
const PIE_COLORS = ['#6AA84F', '#E06666'];

export default function ManagementReports() {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' | 'revenue' | 'venues' | 'ratings' | 'certificates' | 'unpaid'
  const [loading, setLoading] = useState(false);

  // Data states
  const [regData, setRegData] = useState([]);
  const [revenueData, setRevenueData] = useState({ summary: {}, events: [] });
  const [venueData, setVenueData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [certData, setCertData] = useState([]);
  const [unpaidData, setUnpaidData] = useState([]);

  // Fetch report data based on active tab or all
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        authFetch('/api/reports/registrations-per-event').then(res => res.json()),
        authFetch('/api/reports/revenue').then(res => res.json()),
        authFetch('/api/reports/venue-utilization').then(res => res.json()),
        authFetch('/api/reports/ratings').then(res => res.json()),
        authFetch('/api/reports/certificate-eligible').then(res => res.json()),
        authFetch('/api/reports/unpaid-registrations').then(res => res.json())
      ]);

      setRegData(Array.isArray(r1) ? r1 : []);
      setRevenueData(r2 || { summary: {}, events: [] });
      setVenueData(Array.isArray(r3) ? r3 : []);
      setRatingsData(Array.isArray(r4) ? r4 : []);
      setCertData(Array.isArray(r5) ? r5 : []);
      setUnpaidData(Array.isArray(r6) ? r6 : []);
    } catch (err) {
      showToast('Error loading report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDownloadCsv = async (endpoint, defaultFilename) => {
    try {
      const res = await authFetch(`/api/reports/${endpoint}?format=csv`);
      if (!res.ok) throw new Error('Failed to generate CSV export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Exported ${defaultFilename} successfully`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Cert eligibility pie chart calculations
  const eligibleCount = certData.filter(c => c.is_eligible === 'Yes').length;
  const ineligibleCount = certData.length - eligibleCount;
  const certPieData = [
    { name: 'Eligible (>=75%)', value: eligibleCount },
    { name: 'Ineligible (<75%)', value: ineligibleCount }
  ];

  return (
    <>
      <Header
        title="Executive Analytics & Institutional Reports"
        subtitle="Real-time operational metrics, financial tracking, capacity utilization, and accreditation reporting."
      />

      <div className="page-body" id="management-reports-page">
        {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`btn btn-sm ${activeTab === 'registrations' ? 'btn-primary' : 'btn-outline'}`}
          id="tab-registrations"
        >
          <Users size={16} /> Registrations per Event
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`btn btn-sm ${activeTab === 'revenue' ? 'btn-primary' : 'btn-outline'}`}
          id="tab-revenue"
        >
          <IndianRupee size={16} /> Revenue & Fees
        </button>
        <button
          onClick={() => setActiveTab('venues')}
          className={`btn btn-sm ${activeTab === 'venues' ? 'btn-primary' : 'btn-outline'}`}
          id="tab-venues"
        >
          <MapPin size={16} /> Venue Utilization
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`btn btn-sm ${activeTab === 'ratings' ? 'btn-primary' : 'btn-outline'}`}
          id="tab-ratings"
        >
          <Star size={16} /> Participant Ratings
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`btn btn-sm ${activeTab === 'certificates' ? 'btn-primary' : 'btn-outline'}`}
          id="tab-certificates"
        >
          <Award size={16} /> Certificate Eligibility
        </button>
        <button
          onClick={() => setActiveTab('unpaid')}
          className={`btn btn-sm ${activeTab === 'unpaid' ? 'btn-primary' : 'btn-outline'}`}
          id="tab-unpaid"
        >
          <AlertTriangle size={16} /> Unpaid Registrations
        </button>

        <button
          onClick={fetchAllData}
          className="btn btn-sm btn-outline"
          style={{ marginLeft: 'auto' }}
          title="Refresh All Reports"
          id="btn-refresh-reports"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* TAB 1: REGISTRATIONS PER EVENT */}
      {activeTab === 'registrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Event Registration & Capacity Distribution</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Total active participants vs. physical venue seat capacity
                </p>
              </div>
              <button
                onClick={() => handleDownloadCsv('registrations-per-event', 'registrations_per_event.csv')}
                className="btn btn-outline btn-sm"
                id="btn-download-registrations-csv"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>

            <div style={{ height: '320px', width: '100%', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="event_name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                  <Bar dataKey="confirmed_registrations" name="Confirmed" fill="#6AA84F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending_registrations" name="Pending" fill="#F1C232" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Venue Capacity" fill="#C9DAF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Detailed Registrations Table</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Venue</th>
                    <th>Capacity</th>
                    <th>Confirmed</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                    <th>Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {regData.map(row => (
                    <tr key={row.event_id}>
                      <td>#{row.event_id}</td>
                      <td style={{ fontWeight: 600 }}>{row.event_name}</td>
                      <td><span className="badge badge-neutral">{row.event_type}</span></td>
                      <td>{row.venue_name}</td>
                      <td>{row.capacity}</td>
                      <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{row.confirmed_registrations}</td>
                      <td>{row.pending_registrations}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{row.cancelled_registrations}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, backgroundColor: '#E0E0E0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(row.occupancy_pct || 0, 100)}%`,
                                backgroundColor: (row.occupancy_pct || 0) >= 90 ? '#E06666' : '#6AA84F',
                                height: '100%'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '45px' }}>{row.occupancy_pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {regData.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                        No registration records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REVENUE */}
      {activeTab === 'revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="card stat-card">
              <div className="stat-label">Total Realized Revenue</div>
              <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
                ₹{parseFloat(revenueData.summary?.total_collected_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Completed payments in system</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Total Pending Collection</div>
              <div className="stat-value" style={{ color: '#E69138' }}>
                ₹{parseFloat(revenueData.summary?.total_pending_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Unpaid invoices & pending transactions</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Monetized Events</div>
              <div className="stat-value">{revenueData.events?.filter(e => parseFloat(e.ticket_fee) > 0).length || 0}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Events with registration fee &gt; 0</div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Revenue Breakdown by Event</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Collected payments vs. pending receivables per event
                </p>
              </div>
              <button
                onClick={() => handleDownloadCsv('revenue', 'revenue_report.csv')}
                className="btn btn-outline btn-sm"
                id="btn-download-revenue-csv"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>

            <div style={{ height: '320px', width: '100%', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.events || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="event_name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={(val) => `₹${val}`} />
                  <Tooltip formatter={(value) => [`₹${parseFloat(value).toLocaleString()}`, 'Amount']} />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                  <Bar dataKey="total_collected_revenue" name="Collected Revenue" fill="#6AA84F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending_revenue" name="Pending Revenue" fill="#E69138" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Financial Ledger per Event</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Ticket Fee</th>
                    <th>Total Registrations</th>
                    <th>Paid Txns</th>
                    <th>Collected (₹)</th>
                    <th>Pending (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(revenueData.events || []).map(row => (
                    <tr key={row.event_id}>
                      <td>#{row.event_id}</td>
                      <td style={{ fontWeight: 600 }}>{row.event_name}</td>
                      <td><span className="badge badge-neutral">{row.event_type}</span></td>
                      <td>₹{parseFloat(row.ticket_fee).toFixed(2)}</td>
                      <td>{row.total_registrations}</td>
                      <td>{row.paid_transactions}</td>
                      <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        ₹{parseFloat(row.total_collected_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: parseFloat(row.pending_revenue) > 0 ? '#E69138' : 'var(--color-text-muted)' }}>
                        ₹{parseFloat(row.pending_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VENUE UTILIZATION */}
      {activeTab === 'venues' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Campus Venue Utilization</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Cumulative booked duration in hours across campus facilities
                </p>
              </div>
              <button
                onClick={() => handleDownloadCsv('venue-utilization', 'venue_utilization.csv')}
                className="btn btn-outline btn-sm"
                id="btn-download-venues-csv"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>

            <div style={{ height: '320px', width: '100%', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={venueData} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="venue_name" tick={{ fontSize: 13 }} />
                  <YAxis label={{ value: 'Booked Hours', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip formatter={(value) => [`${value} hrs`, 'Total Booked']} />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                  <Bar dataKey="total_booked_hours" name="Booked Hours" fill="#6AA84F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_events_hosted" name="Total Events Scheduled" fill="#45818E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Venue Operational Breakdown</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Venue ID</th>
                    <th>Venue Name</th>
                    <th>Campus Location</th>
                    <th>Seat Capacity</th>
                    <th>Total Events</th>
                    <th>Booked Duration</th>
                    <th>Upcoming Events</th>
                  </tr>
                </thead>
                <tbody>
                  {venueData.map(v => (
                    <tr key={v.venue_id}>
                      <td>#{v.venue_id}</td>
                      <td style={{ fontWeight: 600 }}>{v.venue_name}</td>
                      <td>{v.location}</td>
                      <td>{v.capacity} seats</td>
                      <td>{v.total_events_hosted}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{v.total_booked_hours} hrs</td>
                      <td>
                        <span className={`badge ${v.upcoming_events > 0 ? 'badge-success' : 'badge-neutral'}`}>
                          {v.upcoming_events} active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RATINGS & FEEDBACK */}
      {activeTab === 'ratings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Participant Feedback & Quality Scores</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Average feedback rating out of 5 across evaluated events
                </p>
              </div>
              <button
                onClick={() => handleDownloadCsv('ratings', 'event_ratings.csv')}
                className="btn btn-outline btn-sm"
                id="btn-download-ratings-csv"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>

            <div style={{ height: '320px', width: '100%', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingsData.filter(r => r.feedback_count > 0)} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="event_name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                  <Bar dataKey="average_rating" name="Average Rating (/5)" fill="#F1C232" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="feedback_count" name="Evaluations Received" fill="#6AA84F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Event Evaluation Table</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Coordinator</th>
                    <th>Feedbacks</th>
                    <th>Avg Rating</th>
                    <th>Min Rating</th>
                    <th>Max Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {ratingsData.map(r => (
                    <tr key={r.event_id}>
                      <td>#{r.event_id}</td>
                      <td style={{ fontWeight: 600 }}>{r.event_name}</td>
                      <td><span className="badge badge-neutral">{r.event_type}</span></td>
                      <td>{r.coordinator_name}</td>
                      <td>{r.feedback_count}</td>
                      <td>
                        {r.feedback_count > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={16} fill="#F1C232" color="#F1C232" />
                            <span style={{ fontWeight: 700 }}>{r.average_rating}</span> / 5
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No reviews yet</span>
                        )}
                      </td>
                      <td>{r.lowest_rating ? `${r.lowest_rating} ★` : '-'}</td>
                      <td>{r.highest_rating ? `${r.highest_rating} ★` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATE ELIGIBILITY */}
      {activeTab === 'certificates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card stat-card">
              <div className="stat-label">Eligible Participants (&ge;75% Attendance)</div>
              <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{eligibleCount}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Qualify for official university certificates</div>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Ineligible Participants (&lt;75% Attendance)</div>
              <div className="stat-value" style={{ color: '#E06666' }}>{ineligibleCount}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Failed institutional threshold requirement</div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', padding: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={certPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {certPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="middle" align="right" layout="vertical" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Certificate Eligibility Audit (Live View)</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Derived from MySQL <code>certificate_eligibility</code> view enforcing the 75% attendance rule
                </p>
              </div>
              <button
                onClick={() => handleDownloadCsv('certificate-eligible', 'certificate_eligibility_report.csv')}
                className="btn btn-outline btn-sm"
                id="btn-download-cert-csv"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reg ID</th>
                    <th>Participant</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Event</th>
                    <th>Attendance %</th>
                    <th>Accreditation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certData.map(c => (
                    <tr key={c.registration_id}>
                      <td>#{c.registration_id}</td>
                      <td style={{ fontWeight: 600 }}>{c.participant_name}</td>
                      <td>{c.participant_email}</td>
                      <td>{c.organization || 'Woxsen'}</td>
                      <td>{c.event_name}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: c.is_eligible === 'Yes' ? 'var(--color-primary)' : '#E06666' }}>
                          {c.attendance_pct}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${c.is_eligible === 'Yes' ? 'badge-success' : 'badge-danger'}`}>
                          {c.is_eligible === 'Yes' ? 'Eligible' : 'Ineligible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {certData.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                        No records calculated in view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: UNPAID REGISTRATIONS */}
      {activeTab === 'unpaid' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Unpaid Registrations & Outstanding Dues</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Participants registered for paid events without completed payment transactions
                </p>
              </div>
              <button
                onClick={() => handleDownloadCsv('unpaid-registrations', 'unpaid_registrations.csv')}
                className="btn btn-outline btn-sm"
                id="btn-download-unpaid-csv"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reg ID</th>
                    <th>Participant</th>
                    <th>Contact</th>
                    <th>Event</th>
                    <th>Amount Due</th>
                    <th>Registration Status</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidData.map(u => (
                    <tr key={u.registration_id}>
                      <td>#{u.registration_id}</td>
                      <td style={{ fontWeight: 600 }}>{u.participant_name}</td>
                      <td>
                        <div>{u.participant_email}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{u.participant_phone}</div>
                      </td>
                      <td>{u.event_name}</td>
                      <td style={{ fontWeight: 700, color: '#E06666' }}>
                        ₹{parseFloat(u.amount_due).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge badge-warning">{u.reg_status}</span>
                      </td>
                      <td>
                        <span className="badge badge-danger">{u.payment_status || 'Unpaid'}</span>
                      </td>
                    </tr>
                  ))}
                  {unpaidData.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                        No outstanding dues found! All registrations are paid or complimentary.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
