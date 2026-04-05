const API_BASE = 'http://localhost:5000/api';
const ML_BASE = 'http://localhost:8000/api/ml';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

function getHeaders(auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet(path, auth = false) {
  const res = await fetch(`${API_BASE}${path}`, { headers: getHeaders(auth) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function apiPost(path, body, auth = false) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getHeaders(auth),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function mlGet(path) {
  const res = await fetch(`${ML_BASE}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'ML request failed');
  return data;
}

export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
  return null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isLoggedIn() {
  return !!getToken();
}
