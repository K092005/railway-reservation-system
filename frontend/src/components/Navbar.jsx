'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isLoggedIn, getUser, logout } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">
        <div className="nav-brand-icon">🚆</div>
        <span>RailBooker</span>
      </Link>

      <div className="nav-links">
        <Link href="/search" className={`nav-link ${pathname === '/search' ? 'active' : ''}`}>
          Search Trains
        </Link>

        {loggedIn ? (
          <>
            <Link href="/my-bookings" className={`nav-link ${pathname === '/my-bookings' ? 'active' : ''}`}>
              My Bookings
            </Link>
            <span className="nav-link" style={{ color: 'var(--accent-light)', cursor: 'default' }}>
              {user?.name || 'User'}
            </span>
            <button onClick={handleLogout} className="nav-btn nav-btn-outline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-btn nav-btn-outline">
              Login
            </Link>
            <Link href="/register" className="nav-btn nav-btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
