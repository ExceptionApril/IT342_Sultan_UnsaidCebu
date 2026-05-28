// src/App.js — Session with JWT stored in localStorage
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import { setAuthToken, clearAuthToken } from './api';
import './App.css';

const SESSION_KEY = 'unsaidcebu_user';

export default function App() {
  const [user, setUser]     = useState(null);   // { userId, name, email }
  const [page, setPage]     = useState('login'); // 'login' | 'register' | 'feed'
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.token) setAuthToken(parsed.token);
        setPage('feed');
      }
    } catch (_) { /* ignore malformed data */ }
    setLoading(false);
  }, []);

  const handleLoggedIn = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    if (userData.token) setAuthToken(userData.token);
    setUser(userData);
    setPage('feed');
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    clearAuthToken();
    setUser(null);
    setPage('login');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-pin">📍</div>
        <p>Loading Unsaid Cebu...</p>
      </div>
    );
  }

  if (user && page === 'feed') {
    return <FeedPage user={user} onLogout={handleLogout} />;
  }

  if (page === 'register') {
    return <RegisterPage onGoLogin={() => setPage('login')} onRegistered={() => setPage('login')} />;
  }

  return <LoginPage onGoRegister={() => setPage('register')} onLoggedIn={handleLoggedIn} />;
}
