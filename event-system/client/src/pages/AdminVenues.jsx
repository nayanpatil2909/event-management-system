// client/src/pages/AdminVenues.jsx - Venues Management Page
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Plus, Edit2, Trash2, Users, CheckCircle2 } from 'lucide-react';

export default function AdminVenues() {
  const { authFetch, user } = useAuth();
  const { showToast } = useToast();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({ venue_name: '', location: '', capacity: 100 });
  const [submitting, setSubmitting] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/venues');
      const data = await res.json();
      setVenues(data);
    } catch (err) {
      showToast('Failed to load venues', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const openCreateModal = () => {
    setEditingVenue(null);
    setFormData({ venue_name: '', location: '', capacity: 100 });
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVenue(v);
    setFormData({ venue_name: v.venue_name, location: v.location || '', capacity: v.capacity });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingVenue ? `/api/venues/${editingVenue.venue_id}` : '/api/venues';
      const method = editingVenue ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_name: formData.venue_name.trim(),
          location: formData.location.trim(),
          capacity: parseInt(formData.capacity, 10)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save venue');

      showToast(editingVenue ? 'Venue updated!' : 'Venue created!', 'success');
      setModalOpen(false);
      fetchVenues();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      const res = await authFetch(`/api/venues/${venueId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete venue');
      showToast('Venue deleted', 'success');
      fetchVenues();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <Header
        title="University Venues & Facilities"
        subtitle="Manage auditoriums, seminar halls, and laboratory bench capacities"
        action={
          <button className="btn btn-primary btn-sm" onClick={openCreateModal} id="create-venue-btn">
            <Plus size={16} /> Add Venue
          </button>
        }
      />

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Configured Venues ({venues.length})</h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Fixed seating allocations enforced by capacity triggers</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Venue Name</th>
                    <th>Location / Campus Block</th>
                    <th>Seating Capacity</th>
                    <th>Total Events</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((v) => (
                    <tr key={v.venue_id}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin size={16} color="#6AA84F" />
                          <span>{v.venue_name}</span>
                        </div>
                      </td>
                      <td>{v.location || 'Main Campus'}</td>
                      <td>
                        <span className="badge badge-green" style={{ fontSize: '0.82rem' }}>
                          <Users size={12} /> {v.capacity} seats
                        </span>
                      </td>
                      <td>{v.total_events || 0} events scheduled</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditModal(v)}
                            title="Edit Venue"
                            id={`edit-venue-btn-${v.venue_id}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: '#c0392b' }}
                              onClick={() => handleDelete(v.venue_id)}
                              title="Delete Venue"
                              id={`delete-venue-btn-${v.venue_id}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
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
        title={editingVenue ? `Edit ${editingVenue.venue_name}` : 'Add New Venue'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="venue-name">Venue Name *</label>
            <input
              id="venue-name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Innovation Hall C"
              value={formData.venue_name}
              onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="venue-location">Location / Building Details</label>
            <input
              id="venue-location"
              type="text"
              className="form-input"
              placeholder="e.g. Science Block, Level 3"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="venue-capacity">Seating Capacity (seats &gt; 0) *</label>
            <input
              id="venue-capacity"
              type="number"
              min="1"
              required
              className="form-input"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : <><CheckCircle2 size={16} /> Save Venue</>}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
