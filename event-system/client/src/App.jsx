// client/src/App.jsx - Application Router & Shell
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PublicEvents from './pages/PublicEvents';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminVenues from './pages/AdminVenues';
import AdminSessions from './pages/AdminSessions';
import AdminRegistrations from './pages/AdminRegistrations';
import AdminPayments from './pages/AdminPayments';
import AdminAttendance from './pages/AdminAttendance';
import AdminCertificates from './pages/AdminCertificates';
import SpeakerSessions from './pages/SpeakerSessions';
import ParticipantRegistrations from './pages/ParticipantRegistrations';
import ManagementReports from './pages/ManagementReports';

// Layout wrapper with Sidebar
function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

// Role-based route guard
function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this route, redirect based on user role
    if (user.role === 'speaker') return <Navigate to="/speaker/sessions" replace />;
    if (user.role === 'participant') return <Navigate to="/participant/registrations" replace />;
    if (user.role === 'management') return <Navigate to="/management/reports" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<PublicEvents />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin & Coordinator Shared Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'coordinator']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/venues" element={<AdminVenues />} />
          <Route path="/admin/sessions" element={<AdminSessions />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
        </Route>

        {/* Speaker Portal */}
        <Route element={<ProtectedRoute allowedRoles={['speaker']} />}>
          <Route path="/speaker/sessions" element={<SpeakerSessions />} />
        </Route>

        {/* Participant Portal */}
        <Route element={<ProtectedRoute allowedRoles={['participant']} />}>
          <Route path="/participant/registrations" element={<ParticipantRegistrations />} />
        </Route>

        {/* Management & Admin Reports */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'management']} />}>
          <Route path="/management/reports" element={<ManagementReports />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Route>
    </Routes>
  );
}
