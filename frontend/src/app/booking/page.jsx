'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiPost, apiGet, isLoggedIn } from '@/lib/api';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'Male' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stationIds, setStationIds] = useState({ source: null, dest: null });

  const scheduleId = searchParams.get('scheduleId');
  const trainName = searchParams.get('trainName');
  const trainNumber = searchParams.get('trainNumber');
  const fromStation = searchParams.get('from');
  const fromCode = searchParams.get('fromCode');
  const toStation = searchParams.get('to');
  const toCode = searchParams.get('toCode');
  const date = searchParams.get('date');
  const classType = searchParams.get('classType');
  const departure = searchParams.get('departure');
  const arrival = searchParams.get('arrival');
  const distance = parseInt(searchParams.get('distance') || '0');

  const fareRates = { '1A': 4.0, '2A': 2.5, '3A': 1.8, 'SL': 1.0, 'CC': 2.0, '2S': 0.6, 'GN': 0.4 };
  const farePerPerson = Math.round(distance * (fareRates[classType] || 1.0));
  const totalFare = farePerPerson * passengers.length;

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    apiGet('/trains/stations').then(d => {
      const src = d.stations.find(s => s.code === fromCode);
      const dest = d.stations.find(s => s.code === toCode);
      setStationIds({ source: src?.id, dest: dest?.id });
    }).catch(() => {});
  }, []);

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([...passengers, { name: '', age: '', gender: 'Male' }]);
    }
  };

  const removePassenger = (idx) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== idx));
    }
  };

  const updatePassenger = (idx, field, value) => {
    const updated = [...passengers];
    updated[idx][field] = value;
    setPassengers(updated);
  };

  const handleBook = async () => {
    setError('');
    for (const p of passengers) {
      if (!p.name || !p.age || !p.gender) {
        setError('Please fill all passenger details.');
        return;
      }
      if (parseInt(p.age) < 1 || parseInt(p.age) > 120) {
        setError('Please enter a valid age (1-120).');
        return;
      }
    }

    if (!stationIds.source || !stationIds.dest) {
      setError('Station data not loaded. Please refresh.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost('/bookings', {
        scheduleId: parseInt(scheduleId),
        sourceStationId: stationIds.source,
        destStationId: stationIds.dest,
        classType,
        passengers: passengers.map(p => ({ name: p.name, age: parseInt(p.age), gender: p.gender }))
      }, true);

      router.push(`/payment?bookingId=${data.bookingId}&pnr=${data.pnr}&amount=${totalFare}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="fade-in">
        <h1 className="section-title">Book Ticket</h1>
        <p className="section-subtitle">Complete passenger details to proceed</p>
      </div>

      <div className="card slide-up" style={{ marginBottom: '20px' }}>
        <div className="card-title"><span className="card-title-icon">🚆</span> Journey Details</div>
        <div className="train-route">
          <div className="train-time">
            <div className="train-time-value">{departure?.substring(0, 5) || '--:--'}</div>
            <div className="train-time-station">{fromCode}</div>
          </div>
          <div className="train-duration">
            <div className="train-duration-text">{distance} km</div>
          </div>
          <div className="train-time">
            <div className="train-time-value">{arrival?.substring(0, 5) || '--:--'}</div>
            <div className="train-time-station">{toCode}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
          <span className="badge badge-accent">{trainName}</span>
          <span className="badge badge-info">#{trainNumber}</span>
          <span className="badge badge-success">{classType}</span>
          <span className="badge badge-warning">{date}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="card-title"><span className="card-title-icon">👥</span> Passenger Details</div>

        {passengers.map((p, idx) => (
          <div key={idx} className="passenger-row">
            <div>
              <div className="passenger-num">Passenger {idx + 1}</div>
              <input
                type="text"
                className="form-input"
                placeholder="Full Name"
                value={p.name}
                onChange={e => updatePassenger(idx, 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Age</label>
              <input
                type="number"
                className="form-input"
                placeholder="Age"
                value={p.age}
                onChange={e => updatePassenger(idx, 'age', e.target.value)}
                min="1" max="120"
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Gender</label>
              <select className="form-select" value={p.gender} onChange={e => updatePassenger(idx, 'gender', e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button type="button" className="remove-passenger" onClick={() => removePassenger(idx)} title="Remove">✕</button>
          </div>
        ))}

        {passengers.length < 6 && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={addPassenger} style={{ marginTop: '8px' }}>
            + Add Passenger
          </button>
        )}

        <div className="fare-summary">
          <div className="fare-row">
            <span>Base Fare ({classType})</span>
            <span>₹{farePerPerson} × {passengers.length}</span>
          </div>
          <div className="fare-row fare-total">
            <span>Total Fare</span>
            <span style={{ color: 'var(--accent-light)' }}>₹{totalFare}</span>
          </div>
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={handleBook} disabled={loading} style={{ marginTop: '24px' }} id="proceed-payment">
          {loading ? 'Booking...' : `Proceed to Payment — ₹${totalFare}`}
        </button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
      <BookingContent />
    </Suspense>
  );
}
