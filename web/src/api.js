// src/api.js — All backend API calls live here
const BASE = '/api'; // proxied to http://localhost:8080 by CRA

// ── Auth ─────────────────────────────────────────────────────
export async function apiRegister({ name, email, password }) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data; // { userId, name, email, message }
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data; // { userId, name, email, message }
}

// ── Posts ─────────────────────────────────────────────────────
export async function apiGetPosts(userId) {
  const url = userId ? `${BASE}/posts?userId=${userId}` : `${BASE}/posts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json(); // PostDTO[]
}

export async function apiCreatePost({ userId, content, latitude, longitude }) {
  const res = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, content, latitude, longitude }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : 'Failed to post');
  return data; // PostDTO
}

export async function apiVote(postId, userId, voteType) {
  const res = await fetch(`${BASE}/posts/${postId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, voteType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : 'Vote failed');
  return data; // PostDTO
}

export async function apiFlag(postId, userId, reason = 'INAPPROPRIATE') {
  const res = await fetch(`${BASE}/posts/${postId}/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(typeof data === 'string' ? data : 'Flag failed');
  return data; // PostDTO
}
