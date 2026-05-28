// src/api.js — Backend API client (JWT Bearer + SDD §5.1 envelope handling)
//
// All backend responses follow the SDD §5.1 envelope:
//   { success, data, error: { code, message, details }, timestamp }
// We unwrap `data` on success and throw an Error tagged with `.code`/`.details`
// on failure so callers can branch on internal error codes (AUTH-001, etc.).
//
// Legacy endpoints that still return flat JSON (older /api/posts handlers) are
// detected by checking whether the body has the `success` property.

const BASE = '/api/v1';
const LEGACY = '/api';

let _token = null;

/** Call this after login/register to set the token for all future requests. */
export function setAuthToken(token) { _token = token; }

/** Clear the stored token (on logout). */
export function clearAuthToken() { _token = null; }

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  return headers;
}

/** Throws a tagged Error with `code` + `details` when the envelope says fail. */
function apiError(body, fallback) {
  const err = body?.error || {};
  const e = new Error(err.message || fallback || 'Request failed');
  e.code = err.code || null;
  e.details = err.details || null;
  return e;
}

/** Unwrap an SDD §5.1 envelope, or return the body if it's a legacy flat JSON. */
function unwrap(body, fallbackMsg) {
  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success) return body.data;
    throw apiError(body, fallbackMsg);
  }
  return body;
}

async function readJson(res) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function apiRegister({ firstname, lastname, email, password }) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstname, lastname, email, password }),
  });
  const body = await readJson(res);
  if (!res.ok) throw apiError(body, 'Registration failed');
  return unwrap(body, 'Registration failed');
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await readJson(res);
  if (!res.ok) throw apiError(body, 'Login failed');
  return unwrap(body, 'Login failed');
}

// ── Posts (still on legacy flat /api routes) ────────────────────────────────

export async function apiGetPosts(userId) {
  const url = userId ? `${LEGACY}/posts?userId=${userId}` : `${LEGACY}/posts`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch posts');
  const body = await readJson(res);
  return Array.isArray(body) ? body : unwrap(body, 'Failed to fetch posts');
}

export async function apiCreatePost({ userId, content, latitude, longitude }) {
  const res = await fetch(`${LEGACY}/posts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId, content, latitude, longitude }),
  });
  const body = await readJson(res);
  if (!res.ok) throw apiError(body, 'Failed to post');
  return unwrap(body, 'Failed to post');
}

export async function apiVote(postId, userId, voteType) {
  const res = await fetch(`${LEGACY}/posts/${postId}/vote`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId, voteType }),
  });
  const body = await readJson(res);
  if (!res.ok) throw apiError(body, 'Vote failed');
  return unwrap(body, 'Vote failed');
}

export async function apiFlag(postId, userId, reason = 'INAPPROPRIATE') {
  const res = await fetch(`${LEGACY}/posts/${postId}/flag`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ userId, reason }),
  });
  const body = await readJson(res);
  if (!res.ok) throw apiError(body, 'Flag failed');
  return unwrap(body, 'Flag failed');
}
