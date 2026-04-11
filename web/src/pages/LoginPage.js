// src/pages/LoginPage.js — Uses backend /api/auth/login
import React, { useState } from 'react';
import { apiLogin } from '../api';

export default function LoginPage({ onGoRegister, onLoggedIn }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    if (!email.trim())  return 'Please enter your email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';
    if (!password)      return 'Please enter your password.';
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');

    try {
      const data = await apiLogin({ email, password });
      // data = { userId, name, email, message }
      onLoggedIn({ userId: data.userId, name: data.name, email: data.email });
    } catch (ex) {
      setError(ex.message === 'Invalid email or password'
        ? 'Incorrect email or password. Please try again.'
        : ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">📍</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">A map of memories awaits</p>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleLogin} noValidate>
          <label className="field-label">Email</label>
          <div className="field-wrap">
            <span className="field-icon">✉️</span>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <label className="field-label">Password</label>
          <div className="field-wrap">
            <span className="field-icon">🔒</span>
            <input
              id="login-password"
              className="auth-input"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>

          <button id="login-submit" className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <button id="go-register" className="link-btn" onClick={onGoRegister} style={{ fontWeight: 600 }}>
            Create one
          </button>
        </div>
        <div className="cebu-tag">Cebu, Philippines · Where feelings are heard</div>
      </div>
    </div>
  );
}
