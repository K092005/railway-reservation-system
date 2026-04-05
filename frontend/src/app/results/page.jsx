'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiGet, isLoggedIn } from '@/lib/api';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  useEffect(() => {
    if (!from || !to || !date) return;
    setLoading(true);
    apiGet(`/trains/search?from=${from}&to=${to}&date=${date}`)
      .then(data => {
        setTrains(data.trains || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [from, to, date]);

  const handleBook = (train, classType) => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    const params = new URLSearchParams({
      scheduleId: train.schedule_id,
      trainId: train.train_id,
      trainName: train.train_name,
      trainNumber: train.train_number,
      from: train.source_station,
      fromCode: train.source_code,
      to: train.dest_station,
      toCode: train.dest_code,
      date: date,
      classType: classType,
      departure: train.departure_time,
      arrival: train.arrival_time,
      distance: train.distance_km,
      sourceStationId: '',
      destStationId: ''
    });
    router.push(`/booking?${params.toString()}`);
  };

  const formatTime = (t) => {
    if (!t) return '--:--';
    return t.substring(0, 5);
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="fade-in">
        <h1 className="section-title">Search Results</h1>
        <p className="section-subtitle">
          {from} → {to} &nbsp;•&nbsp; {date} &nbsp;•&nbsp; {trains.length} train{trains.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {trains.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚆</div>
          <h3>No trains found</h3>
          <p style={{ marginTop: '8px' }}>Try different stations or change the travel date.</p>
          <button className="btn btn-secondary" onClick={() => router.push('/search')} style={{ marginTop: '20px' }}>
            New Search
          </button>
        </div>
      ) : (
        trains.map((train, idx) => (
          <div key={idx} className="card train-card card-glow slide-up" style={{ animationDelay: `${idx * 0.08}s` }}>
            <div className="train-card-header">
              <div>
                <div className="train-name">{train.train_name}</div>
                <div className="train-number">#{train.train_number} • {train.train_type}</div>
              </div>
              <span className="badge badge-accent">{train.train_type}</span>
            </div>

            <div className="train-route">
              <div className="train-time">
                <div className="train-time-value">{formatTime(train.departure_time)}</div>
                <div className="train-time-station">{train.source_code}</div>
              </div>
              <div className="train-duration">
                <div className="train-duration-text">
                  {train.duration ? train.duration.substring(0, 5) : '--'} hrs &nbsp;•&nbsp; {train.distance_km} km
                </div>
              </div>
              <div className="train-time">
                <div className="train-time-value">{formatTime(train.arrival_time)}</div>
                <div className="train-time-station">{train.dest_code}</div>
              </div>
            </div>

            <div className="train-availability">
              {train.availability && train.availability.map((a, i) => (
                <div
                  key={i}
                  className="avail-chip"
                  onClick={() => handleBook(train, a.class_type)}
                  title={`Book ${a.class_type}`}
                >
                  <span className="avail-class">{a.class_type}</span>
                  <span className={`avail-count ${a.available_seats < 10 ? 'low' : ''} ${a.available_seats === 0 ? 'none' : ''}`}>
                    {a.available_seats > 0 ? `${a.available_seats} Available` : 'Not Available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
