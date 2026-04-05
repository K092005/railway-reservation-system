'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, isLoggedIn } from '@/lib/api';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    loadBookings();
  }, []);

  const loadBookings = () => {
    setLoading(true);
    apiGet('/bookings', true)
      .then(data => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking? 25% cancellation charges will apply.')) return;

    try {
      const data = await apiPost(`/bookings/${bookingId}/cancel`, { reason: 'User requested cancellation' }, true);
      alert(`Booking cancelled. Refund: ₹${data.refundAmount}`);
      loadBookings();
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    }
  };

  const statusBadge = (status) => {
    const map = {
      'Confirmed': 'badge-success',
      'Cancelled': 'badge-danger',
      'Pending': 'badge-warning',
      'WaitListed': 'badge-warning'
    };
    return map[status] || 'badge-info';
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="fade-in">
        <h1 className="section-title">🎫 My Bookings</h1>
        <p className="section-subtitle">View and manage all your train bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3>No bookings yet</h3>
          <p style={{ marginTop: '8px' }}>Search for trains and book your first ticket!</p>
          <button className="btn btn-primary" onClick={() => router.push('/search')} style={{ marginTop: '20px' }}>
            Search Trains
          </button>
        </div>
      ) : (
        bookings.map((b, idx) => (
          <div key={b.id} className="card train-card slide-up" style={{ animationDelay: `${idx * 0.06}s`, cursor: 'default' }}>
            <div className="train-card-header">
              <div>
                <div className="train-name">{b.train_name}</div>
                <div className="train-number">#{b.train_number} • PNR: <strong>{b.pnr}</strong></div>
              </div>
              <span className={`badge ${statusBadge(b.status)}`}>{b.status}</span>
            </div>

            <div className="train-route">
              <div className="train-time">
                <div className="train-time-value" style={{ fontSize: '1rem' }}>{b.source_station}</div>
                <div className="train-time-station">{b.source_code}</div>
              </div>
              <div className="train-duration">
                <div className="train-duration-text">{b.run_date}</div>
              </div>
              <div className="train-time">
                <div className="train-time-value" style={{ fontSize: '1rem' }}>{b.dest_station}</div>
                <div className="train-time-station">{b.dest_code}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className="badge badge-accent">{b.class_type}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.passenger_count} Passenger{b.passenger_count > 1 ? 's' : ''}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>₹{b.total_fare}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/confirmation?pnr=${b.pnr}`)}>
                  View Ticket
                </button>
                {b.status === 'Confirmed' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
