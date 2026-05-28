// src/pages/LoginPage.js — Split-screen login (SDD §7.1 wireframe)
import React, { useState } from 'react';
import { apiLogin } from '../api';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/Icons';

const REMEMBER_KEY = 'unsaidcebu_remember_email';

export default function LoginPage({ onGoRegister, onLoggedIn }) {
  const [email, setEmail]       = useState(() => localStorage.getItem(REMEMBER_KEY) || '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem(REMEMBER_KEY));
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
      // SDD envelope returns the AuthResponse shape:
      // { userId, name, firstname, lastname, email, role, accessToken, refreshToken, token, ... }
      const token = data.accessToken || data.token;
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      onLoggedIn({
        userId: data.userId,
        name: data.name || `${data.firstname || ''} ${data.lastname || ''}`.trim() || 'Anonymous',
        email: data.email,
        role: data.role,
        token,
        refreshToken: data.refreshToken,
      });
    } catch (ex) {
      if (ex.code === 'AUTH-001') {
        setError('Incorrect email or password. Please try again.');
      } else if (ex.message?.includes('Failed to fetch')) {
        setError('Cannot reach the server. Is the backend running on port 8080?');
      } else {
        setError(ex.message || 'Sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-wrap">
        <div className="auth-eyebrow">Welcome back</div>
        <h1 className="auth-title">Sign in to listen</h1>
        <p className="auth-subtitle">A map of whispered memories awaits you.</p>

        {error && (
          <div className="error-msg" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="auth-form">
          <div className="field-group">
            <label className="field-label" htmlFor="login-email">Email address</label>
            <div className="field-wrap">
              <span className="field-icon"><Icon name="mail" size={18} /></span>
              <input
                id="login-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="field-wrap">
              <span className="field-icon"><Icon name="lock" size={18} /></span>
              <input
                id="login-password"
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPw ? 'eye-off' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          {/* Remember-me + Forgot password row — SDD §7.1 wireframe */}
          <div className="login-options-row">
            <label className="remember-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="link-btn forgot-link"
              onClick={() => alert('Password reset is coming in a future release. Contact admin@unsaidcebu.local for now.')}
            >
              Forgot password?
            </button>
          </div>

          <button
            id="login-submit"
            className="btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading"><span className="btn-spinner" />Signing in…</span>
            ) : (
              <span className="btn-content">Sign in <Icon name="arrow-right" size={17} stroke="white" /></span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          New to Unsaid Cebu?
          <button id="go-register" className="link-btn" onClick={onGoRegister}>
            Create an account
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
