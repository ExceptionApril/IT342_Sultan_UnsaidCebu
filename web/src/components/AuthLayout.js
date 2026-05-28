// AuthLayout — Premium split-screen layout for login & register
import React from 'react';
import { Icon } from './Icons';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {/* ── Left: Brand Hero ─────────────────────────────── */}
      <aside className="auth-hero">
        <div className="auth-hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <svg className="hero-grid" viewBox="0 0 800 800" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="800" height="800" fill="url(#grid)" />
          </svg>
        </div>

        <div className="auth-hero-content">
          <div className="auth-hero-brand">
            <div className="auth-hero-logo">
              <Icon name="pin" size={26} stroke="white" />
            </div>
            <div className="auth-hero-brand-text">
              <h2>Unsaid Cebu</h2>
              <span>Anonymous feelings, mapped</span>
            </div>
          </div>

          <div className="auth-hero-tagline">
            <div className="tag-pill">
              <Icon name="sparkle" size={12} stroke="#fbbf24" />
              <span>For the words you couldn't say</span>
            </div>
            <h1>
              Every street<br />
              holds a <em>story</em>.
            </h1>
            <p>
              Drop your unsaid feelings on the map of Cebu.
              Read what strangers around you can't say out loud.
              All anonymous. All heard.
            </p>
          </div>

          <div className="auth-hero-features">
            <div className="hero-feature">
              <div className="hero-feature-icon"><Icon name="map" size={18} stroke="#c4b5fd" /></div>
              <div>
                <strong>Location-based</strong>
                <span>See whispers within 10km</span>
              </div>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon"><Icon name="user" size={18} stroke="#c4b5fd" /></div>
              <div>
                <strong>Fully anonymous</strong>
                <span>No names, no faces, no trace</span>
              </div>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon"><Icon name="heart" size={18} stroke="#c4b5fd" /></div>
              <div>
                <strong>Real connection</strong>
                <span>Vote, flag, and listen quietly</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span className="hero-dot" />
            <span>Cebu, Philippines</span>
          </div>
        </div>
      </aside>

      {/* ── Right: Form ──────────────────────────────────── */}
      <main className="auth-main">
        <div className="auth-main-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
