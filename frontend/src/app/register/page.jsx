'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost, saveAuth } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      });
      saveAuth(data.token, data.user);
      router.push('/search');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card scale-in">
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '2.5rem' }}>✨</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join RailBooker to start booking trains</p>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="eg. Ritu Sharma" value={form.name} onChange={e => update('name', e.target.value)} required id="reg-name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required id="reg-email" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="9876543210" value={form.phone} onChange={e => update('phone', e.target.value)} id="reg-phone" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min 6 chars" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} id="reg-password" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Re-enter" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required id="reg-confirm" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="reg-btn">
            {loading ? '⏳ Creating...' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
