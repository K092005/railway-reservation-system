'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';

export default function SearchPage() {
  const router = useRouter();
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setDate(today.toISOString().split('T')[0]);
    apiGet('/trains/stations').then(d => setStations(d.stations)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (from && to && date) {
      router.push(`/results?from=${from}&to=${to}&date=${date}`);
    }
  };

  const swapStations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <div className="fade-in">
        <h1 className="section-title">🔍 Search Trains</h1>
        <p className="section-subtitle">Find trains between any two stations across India</p>
      </div>

      <form onSubmit={handleSearch} className="card card-glow slide-up" style={{ position: 'relative' }}>
        <div className="form-group">
          <label className="form-label">From Station</label>
          <select className="form-select" value={from} onChange={e => setFrom(e.target.value)} required id="search-from">
            <option value="">Select Source Station</option>
            {stations.map(s => (
              <option key={s.id} value={s.code}>{s.name} ({s.code}) — {s.city}</option>
            ))}
          </select>
        </div>

        <div style={{ textAlign: 'center', margin: '-8px 0' }}>
          <button type="button" className="swap-btn" onClick={swapStations} title="Swap" style={{
            position: 'relative', top: 'auto', left: 'auto', transform: 'none'
          }}>⇄</button>
        </div>

        <div className="form-group">
          <label className="form-label">To Station</label>
          <select className="form-select" value={to} onChange={e => setTo(e.target.value)} required id="search-to">
            <option value="">Select Destination Station</option>
            {stations.map(s => (
              <option key={s.id} value={s.code}>{s.name} ({s.code}) — {s.city}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Travel Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            id="search-date"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" id="search-submit">
          Search Trains 🚆
        </button>
      </form>
    </div>
  );
}
