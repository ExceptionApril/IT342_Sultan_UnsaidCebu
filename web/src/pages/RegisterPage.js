// src/pages/RegisterPage.js — Uses backend /api/auth/register
import React, { useState } from 'react';
import { apiRegister } from '../api';

export default function RegisterPage({ onGoLogin, onRegistered }) {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [terms, setTerms]         = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  const validate = () => {
    if (!fullName.trim())  return 'Please enter your full name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email.';
    if (password.length < 6)  return 'Password must be at least 6 characters.';
    if (password !== confirm) return 'Passwords do not match.';
    if (!terms)               return 'Please agree to the Terms of Service.';
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiRegister({ name: fullName, email, password });
      setSuccess('✅ Account created! You can now sign in.');
      setTimeout(() => onRegistered(), 2000);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">📍</div>
        <h1 className="auth-title">Begin Your Journey</h1>
        <p className="auth-subtitle">Create memories that last forever</p>

        {error   && <div className="error-msg">⚠️ {error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleRegister} noValidate>
          <label className="field-label">Full Name</label>
          <div className="field-wrap">
            <span className="field-icon">👤</span>
            <input id="reg-name" className="auth-input" type="text" placeholder="Your name"
              value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
          </div>

          <label className="field-label">Email</label>
          <div className="field-wrap">
            <span className="field-icon">✉️</span>
            <input id="reg-email" className="auth-input" type="email" placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <label className="field-label">Password</label>
          <div className="field-wrap">
            <span className="field-icon">🔒</span>
            <input id="reg-password" className="auth-input" type={showPw ? 'text' : 'password'} placeholder="Create a password"
              value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>

          <label className="field-label">Confirm Password</label>
          <div className="field-wrap" style={{ marginBottom: 16 }}>
            <span className="field-icon">🔒</span>
            <input id="reg-confirm" className="auth-input" type={showCf ? 'text' : 'password'} placeholder="Confirm your password"
              value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
            <button type="button" className="eye-btn" onClick={() => setShowCf(v => !v)} tabIndex={-1}>
              {showCf ? '🙈' : '👁️'}
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, cursor: 'pointer' }}>
            <input id="reg-terms" type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
            I agree to the <span style={{ color: 'var(--purple)', textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: 'var(--purple)', textDecoration: 'underline' }}>Privacy Policy</span>
          </label>

          <button id="reg-submit" className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <button id="go-login" className="link-btn" onClick={onGoLogin} style={{ fontWeight: 600 }}>Sign in</button>
        </div>
        <div className="cebu-tag">Cebu, Philippines · Where feelings are heard</div>
      </div>
    </div>
  );
}
