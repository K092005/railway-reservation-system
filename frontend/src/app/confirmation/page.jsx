'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);

  const pnr = searchParams.get('pnr');

  useEffect(() => {
    if (!pnr) return;
    apiGet(`/bookings/${pnr}`)
      .then(data => {
        setBooking(data.booking);
        setPassengers(data.passengers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pnr]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!booking) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h3>Booking not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '650px' }}>
      <div className="fade-in" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '12px' }}>✅</div>
        <h1 className="section-title">Booking Confirmed!</h1>
        <p className="section-subtitle">Your ticket has been booked successfully</p>
      </div>

      <div className="ticket slide-up">
        <div className="ticket-header">
          <div>
            <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>PNR Number</div>
            <div className="ticket-pnr">{booking.pnr}</div>
          </div>
          <span className="badge badge-success" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            {booking.booking_status}
          </span>
        </div>

        <div className="ticket-body">
          <div className="ticket-row">
            <span className="ticket-label">Train</span>
            <span className="ticket-value">{booking.train_name} (#{booking.train_number})</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-label">From</span>
            <span className="ticket-value">{booking.source_station} ({booking.source_code})</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-label">To</span>
            <span className="ticket-value">{booking.dest_station} ({booking.dest_code})</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-label">Date</span>
            <span className="ticket-value">{booking.run_date}</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-label">Departure</span>
            <span className="ticket-value">{booking.departure_time?.substring(0, 5)}</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-label">Arrival</span>
            <span className="ticket-value">{booking.arrival_time?.substring(0, 5)}</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-label">Class</span>
            <span className="ticket-value">{booking.class_type}</span>
          </div>
          <div className="ticket-row">
            <span className="ticket-label">Total Fare</span>
            <span className="ticket-value" style={{ color: 'var(--accent-light)', fontWeight: 800, fontSize: '1.1rem' }}>₹{booking.total_fare}</span>
          </div>

          <div className="divider"></div>
          <div className="card-title" style={{ marginBottom: '12px' }}><span className="card-title-icon">👥</span> Passengers</div>

          {passengers.map((p, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', background: 'rgba(99,102,241,0.04)', borderRadius: '8px',
              border: '1px solid var(--border)', marginBottom: '8px'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {p.age} yrs • {p.gender}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Coach {p.coach_number || '-'}, Seat {p.seat_number || '-'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.seat_type || ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => router.push('/my-bookings')}>
          My Bookings
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push('/search')}>
          Book Another
        </button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
