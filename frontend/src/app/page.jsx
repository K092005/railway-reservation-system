'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';

export default function HomePage() {
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
    <>
      {/* ========== HERO SECTION ========== */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/hero-train.png" alt="Train at sunset" />
        </div>

        {/* Floating particles */}
        <div className="hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>

        <div className="hero-content slide-up">
          <div className="hero-badge">
            <span style={{ animation: 'iconPulse 2s ease-in-out infinite', display: 'inline-block' }}>🚆</span>
            India&apos;s Smart Railway Platform
          </div>
          <h1>
            Book Your Next<br />
            <span className="gradient-text">Railway Adventure</span>
          </h1>
          <p>
            Search 500+ trains across India, check real-time seat availability,
            and book tickets instantly with AI-powered fare predictions.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/search" className="btn btn-primary btn-lg" id="cta-search">
              🔍 Search Trains
            </Link>
            <Link href="/register" className="btn btn-lg" id="cta-register" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              Create Account →
            </Link>
          </div>

          <div className="hero-train-line"></div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">500+</div>
              <div className="hero-stat-label">Trains</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">1000+</div>
              <div className="hero-stat-label">Routes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">15</div>
              <div className="hero-stat-label">Major Cities</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">AI</div>
              <div className="hero-stat-label">Fare Prediction</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SEARCH CARD ========== */}
      <div className="page-container">
        <form onSubmit={handleSearch} className="card search-card card-glow fade-in" style={{ position: 'relative' }}>
          <div className="card-title">
            <span className="card-title-icon">🔍</span>
            Search Trains
          </div>
          <div className="search-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From Station</label>
              <select className="form-select" value={from} onChange={e => setFrom(e.target.value)} required id="from-station">
                <option value="">Select Source</option>
                {stations.map(s => (
                  <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To Station</label>
              <select className="form-select" value={to} onChange={e => setTo(e.target.value)} required id="to-station">
                <option value="">Select Destination</option>
                {stations.map(s => (
                  <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Travel Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                id="travel-date"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" id="search-btn" style={{ height: 'fit-content' }}>
              Search 🔍
            </button>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: 'calc(33.3% - 22px)', transform: 'translateY(-50%)', zIndex: 5 }}>
            <button type="button" className="swap-btn" onClick={swapStations} title="Swap stations">⇄</button>
          </div>
        </form>

        {/* ========== FEATURES ========== */}
        <div className="features-grid">
          {[
            {
              icon: '🔍',
              title: 'Smart Search',
              desc: 'Find trains between any two of 15+ major stations with real-time availability and seat data.',
              gradient: 'var(--gradient-fire)'
            },
            {
              icon: '🤖',
              title: 'AI Fare Prediction',
              desc: 'Our ML engine uses Gradient Boosting to predict dynamic fares based on demand, season & timing.',
              gradient: 'var(--gradient-ocean)'
            },
            {
              icon: '💳',
              title: 'Instant Booking',
              desc: 'Book tickets in seconds with seat selection. Pay via UPI, Credit Card, Net Banking & more.',
              gradient: 'var(--gradient-sunset)'
            },
            {
              icon: '📊',
              title: 'Demand Analysis',
              desc: 'Random Forest classifier predicts booking rush — know if seats will fill fast before you book.',
              gradient: 'var(--gradient-royal)'
            }
          ].map((f, i) => (
            <div
              key={i}
              className="card feature-card card-glow slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1.15rem',
                fontWeight: 700,
                marginBottom: '10px',
                background: f.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ========== POPULAR ROUTES SECTION ========== */}
        <div style={{ marginTop: '80px' }}>
          <h2 className="section-title fade-in" style={{ textAlign: 'center' }}>
            Popular <span style={{
              background: 'var(--gradient-fire)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Routes</span>
          </h2>
          <p className="section-subtitle fade-in" style={{ textAlign: 'center' }}>
            Most booked train routes across India
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginTop: '24px'
          }}>
            {[
              { from: 'New Delhi', to: 'Mumbai', code: 'NDLS → BCT', trains: '12', time: '16h 35m', img: '🌆' },
              { from: 'Bangalore', to: 'Chennai', code: 'SBC → MAS', trains: '8', time: '5h 30m', img: '🏙️' },
              { from: 'Kolkata', to: 'Delhi', code: 'HWH → NDLS', trains: '10', time: '17h 25m', img: '🌉' },
              { from: 'Delhi', to: 'Jaipur', code: 'NDLS → JP', trains: '6', time: '4h 30m', img: '🏰' },
              { from: 'Mumbai', to: 'Pune', code: 'BCT → PUNE', trains: '15', time: '3h 15m', img: '🌄' },
              { from: 'Chennai', to: 'Hyderabad', code: 'MAS → SC', trains: '7', time: '7h 45m', img: '🕌' },
            ].map((route, i) => (
              <div
                key={i}
                className="card card-glow slide-up"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px 22px'
                }}
                onClick={() => router.push(`/search`)}
              >
                <div style={{
                  width: '50px', height: '50px',
                  borderRadius: '14px',
                  background: 'rgba(255, 107, 43, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {route.img}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {route.from} → {route.to}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {route.code} • {route.trains} trains • {route.time}
                  </div>
                </div>
                <div style={{
                  fontSize: '1.2rem',
                  color: 'var(--accent-light)',
                  transition: 'transform 0.3s ease'
                }}>
                  →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== CTA BANNER ========== */}
        <div
          className="card slide-up"
          style={{
            marginTop: '80px',
            padding: '48px 40px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,107,43,0.06) 0%, rgba(255,61,113,0.04) 50%, rgba(99,102,241,0.04) 100%)',
            borderColor: 'rgba(255, 107, 43, 0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-50%', right: '-20%',
            width: '400px', height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,43,0.06), transparent 70%)',
            pointerEvents: 'none'
          }} />
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '12px',
            position: 'relative'
          }}>
            Ready to Start Your <span style={{
              background: 'var(--gradient-fire)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Journey</span>?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            maxWidth: '500px',
            margin: '0 auto 28px',
            lineHeight: 1.7,
            position: 'relative'
          }}>
            Join thousands of travelers who trust RailBooker for seamless train booking across India.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', position: 'relative' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started — Free
            </Link>
            <Link href="/search" className="btn btn-secondary btn-lg">
              Explore Trains
            </Link>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <footer style={{
          marginTop: '80px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(255, 107, 43, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700
          }}>
            <span style={{ fontSize: '1.5rem' }}>🚆</span>
            <span style={{
              background: 'var(--gradient-fire)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>RailBooker</span>
          </div>
          <div style={{
            color: 'var(--text-dim)',
            fontSize: '0.82rem'
          }}>
            Built with Node.js • Next.js • MySQL • FastAPI • scikit-learn
          </div>
        </footer>
      </div>
    </>
  );
}
