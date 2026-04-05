'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bookingId = searchParams.get('bookingId');
  const pnr = searchParams.get('pnr');
  const amount = searchParams.get('amount');

  const methods = [
    { id: 'UPI', icon: '📱', label: 'UPI' },
    { id: 'Credit Card', icon: '💳', label: 'Credit Card' },
    { id: 'Debit Card', icon: '🏧', label: 'Debit Card' },
    { id: 'Net Banking', icon: '🏦', label: 'Net Banking' }
  ];

  const handlePay = async () => {
    if (!method) {
      setError('Please select a payment method.');
      return;
    }
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 1500));

    try {
      await apiPost('/payments/process', { bookingId: parseInt(bookingId), method }, true);
      router.push(`/confirmation?pnr=${pnr}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '550px' }}>
      <div className="fade-in">
        <h1 className="section-title">💳 Payment</h1>
        <p className="section-subtitle">Complete payment to confirm your booking</p>
      </div>

      <div className="card slide-up" style={{ marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount to Pay</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ₹{amount}
          </div>
          <div className="badge badge-accent" style={{ marginTop: '8px' }}>PNR: {pnr}</div>
        </div>

        <div className="divider"></div>

        <div className="card-title"><span className="card-title-icon">📋</span> Select Payment Method</div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <div className="payment-methods">
          {methods.map(m => (
            <button
              key={m.id}
              className={`payment-method ${method === m.id ? 'selected' : ''}`}
              onClick={() => setMethod(m.id)}
              type="button"
            >
              <span className="payment-method-icon">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={handlePay} disabled={loading || !method} id="pay-btn">
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              Processing Payment...
            </span>
          ) : (
            `Pay ₹${amount}`
          )}
        </button>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
      <PaymentContent />
    </Suspense>
  );
}
