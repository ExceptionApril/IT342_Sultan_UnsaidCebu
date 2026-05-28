// src/pages/RegisterPage.js — Split-screen register (SDD §7.1 wireframe)
import React, { useState } from 'react';
import { apiRegister } from '../api';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/Icons';

export default function RegisterPage({ onGoLogin, onRegistered }) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [terms, setTerms]         = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  // Strength meter
  const pwStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = pwStrength(password);
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthClass = ['', 'weak', 'fair', 'good', 'strong'][strength];

  const validate = () => {
    if (!firstname.trim()) return 'Please enter your first name.';
    if (!lastname.trim())  return 'Please enter your last name.';
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
      await apiRegister({ firstname, lastname, email, password });
      setSuccess('Account created! Redirecting to sign-in…');
      setTimeout(() => onRegistered(), 1500);
    } catch (ex) {
      // Map SDD error codes to friendly text
      if (ex.code === 'AUTH-007') {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (ex.message?.includes('Failed to fetch')) {
        setError('Cannot reach the server. Is the backend running on port 8080?');
      } else {
        setError(ex.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-wrap">
        <div className="auth-eyebrow">Join the map</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Pin your first whisper. It only takes a moment.</p>

        {error && (
          <div className="error-msg" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="success-msg" role="status">
            <Icon name="check-circle" size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} noValidate className="auth-form">
          {/* First + Last name — 2-column grid per SDD §7.1 */}
          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="reg-firstname">First name</label>
              <div className="field-wrap">
                <span className="field-icon"><Icon name="user" size={18} /></span>
                <input
                  id="reg-firstname" className="auth-input" type="text"
                  placeholder="Juan"
                  value={firstname}
                  onChange={e => { setFirstname(e.target.value); if (error) setError(''); }}
                  autoComplete="given-name"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="reg-lastname">Last name</label>
              <div className="field-wrap">
                <span className="field-icon"><Icon name="user" size={18} /></span>
                <input
                  id="reg-lastname" className="auth-input" type="text"
                  placeholder="Dela Cruz"
                  value={lastname}
                  onChange={e => { setLastname(e.target.value); if (error) setError(''); }}
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="reg-email">Email address</label>
            <div className="field-wrap">
              <span className="field-icon"><Icon name="mail" size={18} /></span>
              <input
                id="reg-email" className="auth-input" type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="reg-password">Password</label>
              <div className="field-wrap">
                <span className="field-icon"><Icon name="lock" size={18} /></span>
                <input
                  id="reg-password" className="auth-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                  autoComplete="new-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  <Icon name={showPw ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="reg-confirm">Confirm</label>
              <div className="field-wrap">
                <span className="field-icon"><Icon name="lock" size={18} /></span>
                <input
                  id="reg-confirm" className="auth-input"
                  type={showCf ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); if (error) setError(''); }}
                  autoComplete="new-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowCf(v => !v)} tabIndex={-1} aria-label={showCf ? 'Hide password' : 'Show password'}>
                  <Icon name={showCf ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Password strength */}
          {password && (
            <div className={`pw-strength ${strengthClass}`}>
              <div className="pw-bars">
                {[1,2,3,4].map(i => <span key={i} className={i <= strength ? 'on' : ''} />)}
              </div>
              <span className="pw-label">{strengthLabel}</span>
            </div>
          )}

          <label className="terms-row">
            <input
              id="reg-terms" type="checkbox"
              checked={terms} onChange={e => { setTerms(e.target.checked); if (error) setError(''); }}
            />
            <span>
              I agree to the <a className="terms-link" href="#tos">Terms of Service</a>
              {' '}and <a className="terms-link" href="#privacy">Privacy Policy</a>
            </span>
          </label>

          <button id="reg-submit" className="btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading"><span className="btn-spinner" />Creating account…</span>
            ) : (
              <span className="btn-content">Create account <Icon name="arrow-right" size={17} stroke="white" /></span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already a whisperer?
          <button id="go-login" className="link-btn" onClick={onGoLogin}>
            Sign in instead
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
