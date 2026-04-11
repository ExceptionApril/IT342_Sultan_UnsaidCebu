// src/pages/FeedPage.js — Map-first dashboard (Leaflet)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiGetPosts, apiCreatePost, apiVote, apiFlag } from '../api';

// Fix Leaflet's broken default icon paths in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Helpers ──────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#9b59b6','#6c3483'], ['#7c5cbf','#4a2d8a'], ['#8e44ad','#6c3483'],
  ['#a569bd','#7d3c98'], ['#b08ad4','#6a318d'], ['#6c3483','#4a2d8a'],
];
function avatarColors(userId) {
  if (!userId && userId !== 0) return AVATAR_COLORS[0];
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

// Generate anon name like "AMOU-Serene-Sunset-901"
const ADJ1 = ['Serene','Quiet','Gentle','Warm','Silent','Soft','Calm','Tender'];
const ADJ2 = ['Sunset','Breeze','Dream','Rain','Moon','Mist','Star','Wave'];
function buildAnonDisplay(userId) {
  if (!userId && userId !== 0) return 'Anonymous Wanderer';
  const prefix = 'ANON';
  const a1 = ADJ1[userId % ADJ1.length];
  const a2 = ADJ2[Math.floor(userId / ADJ1.length) % ADJ2.length];
  const num = (userId * 137 + 500) % 1000;
  return `${prefix}-${a1}-${a2}-${num}`;
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
}
function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
const TOXIC_WORDS = ['hate','kill','die','stupid','idiot','loser','ugly','worthless'];
function toxicityScore(text) {
  const lower = text.toLowerCase();
  return TOXIC_WORDS.filter(w => lower.includes(w)).length / TOXIC_WORDS.length;
}

// ── Map Controller (pan to user location) ────────────────
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) { map.setView(center, 13, { animate: true }); }
  }, [center, map]);
  return null;
}

// ── Post Markers rendered via Leaflet imperatively ────────
function PostMarkers({ posts, onOpenPost }) {
  const map = useMap();
  const markersRef = useRef([]);

  useEffect(() => {
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    posts.forEach(post => {
      if (!post.latitude || !post.longitude) return;
      const count = post.upvotes || 0;
      const hot = count > 5;
      const icon = L.divIcon({
        className: '',
        html: `<div class="post-marker-circle${hot ? ' hot' : ''}">${count}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -22],
      });
      const marker = L.marker([post.latitude, post.longitude], { icon });
      marker.on('click', () => onOpenPost(post));
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [posts, map, onOpenPost]);

  return null;
}

// ── Compose Modal (lavender bottom sheet) ────────────────
function ComposeModal({ userLocation, currentUserId, onClose, onPosted }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [warning, setWarning] = useState('');
  const MAX = 500;

  const handlePost = async () => {
    const text = content.trim();
    setError(''); setWarning('');
    if (!text) { setError('Please write something before posting.'); return; }
    if (text.length > MAX) { setError(`Post must be under ${MAX} characters.`); return; }
    if (!userLocation) { setError('Location required. Please enable location.'); return; }
    const score = toxicityScore(text);
    if (score >= 0.7) { setError('Your post was blocked due to inappropriate content.'); return; }
    if (score >= 0.3) setWarning('⚠️ This post may contain sensitive language. Consider revising.');
    setLoading(true);
    try {
      await apiCreatePost({ userId: currentUserId, content: text, latitude: userLocation.lat, longitude: userLocation.lng });
      onPosted();
      onClose();
    } catch(ex) {
      setError(ex.message || 'Failed to post. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet compose-sheet">
        <div className="modal-handle" />
        {/* Header */}
        <div className="compose-sheet-header">
          <div className="compose-sheet-avatar">✍️</div>
          <div>
            <div className="compose-sheet-title">Share an Unsaid Feeling</div>
            <div className="compose-sheet-sub">Your identity stays anonymous</div>
          </div>
        </div>

        {/* Textarea */}
        <div className="compose-body">
          <textarea
            id="compose-textarea"
            className="compose-textarea"
            placeholder="What's unsaid in your heart today? Share anonymously with those nearby in Cebu..."
            value={content}
            onChange={e => { setContent(e.target.value); setError(''); }}
            maxLength={MAX + 1}
            autoFocus
          />
          {error   && <div className="error-msg" style={{ marginTop: 10, marginBottom: 0 }}>⚠️ {error}</div>}
          {warning && <div className="toxicity-warning">{warning}</div>}
        </div>

        {/* Footer */}
        <div className="compose-footer">
          <div className="compose-meta">
            <div className={`loc-dot ${userLocation ? '' : 'off'}`} />
            <span>{userLocation ? `📍 ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Location off'}</span>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <span className={`char-count ${content.length > MAX ? 'over' : content.length > MAX*0.8 ? 'warn' : ''}`}>
              {content.length}/{MAX}
            </span>
            <button id="post-submit" className="btn-post" onClick={handlePost} disabled={loading || !content.trim() || !userLocation}>
              {loading ? 'Posting…' : 'Post Anonymously'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Card Popup (lavender card, matches reference) ───
function PostPopup({ post, currentUserId, onVote, onFlag, onClose }) {
  if (!post) return null;
  const anonDisplay = post.anonName || buildAnonDisplay(post.userId);

  const [saved, setSaved] = useState(false);

  return (
    <div className="post-card-overlay" onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="post-card-popup">
        {/* Close x */}
        <button className="post-card-close" onClick={onClose}>×</button>

        {/* Message content — most prominent */}
        <div className="post-card-message">{post.content}</div>

        {/* Bottom row: author info + actions */}
        <div className="post-card-bottom">
          <div className="post-card-author">
            <div className="post-card-anon-name">{anonDisplay}</div>
            <div className="post-card-date">{formatDate(post.createdAt)}</div>
          </div>

          <div className="post-card-actions">
            {/* Save / Bookmark */}
            <button
              className={`pca-btn ${saved ? 'pca-saved' : ''}`}
              onClick={() => setSaved(s => !s)}
              title="Save"
            >
              <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{0}</span>
            </button>

            {/* Flag */}
            <button
              className={`pca-btn ${post.userFlagged ? 'pca-flagged' : ''}`}
              onClick={() => onFlag(post.id)}
              disabled={post.userFlagged}
              title="Report"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              <span>{post.flagCount || 0}</span>
            </button>

            {/* Heart / Upvote */}
            <button
              className={`pca-btn ${post.userVote === 'UPVOTE' ? 'pca-loved' : ''}`}
              onClick={() => onVote(post.id, 'UPVOTE')}
              title="Love"
            >
              <svg viewBox="0 0 24 24" fill={post.userVote === 'UPVOTE' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{post.upvotes || 0}</span>
            </button>

            {/* More / Downvote */}
            <button
              className={`pca-btn ${post.userVote === 'DOWNVOTE' ? 'pca-down' : ''}`}
              onClick={() => onVote(post.id, 'DOWNVOTE')}
              title="Downvote"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              </svg>
              <span>{post.downvotes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── List Panel (Unspoken Words) ───────────────────────────
function ListPanel({ posts, onVote, onFlag, onClose, onPostClick }) {
  return (
    <div className="list-panel">
      <div className="list-handle" />
      <div className="list-panel-header">
        <span className="list-panel-title">Unspoken Words</span>
        <button className="list-panel-close" onClick={onClose}>✕</button>
      </div>
      {posts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-muted)', fontSize:13 }}>
          🤫 No unsaids yet. Be the first to share!
        </div>
      ) : posts.map(post => {
        const anonDisplay = post.anonName || buildAnonDisplay(post.userId);
        return (
          <div className="post-list-item" key={post.id} onClick={() => onPostClick(post)}>
            {/* Message content */}
            <div className="post-list-content">{post.content}</div>

            {/* Bottom row */}
            <div className="post-list-bottom">
              <div className="post-list-author">
                <div className="post-list-anon-name">{anonDisplay}</div>
                <div className="post-list-date">{formatDate(post.createdAt)}</div>
              </div>
              <div className="post-list-stats">
                <span className="post-list-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {post.upvotes||0}
                </span>
                <span className="post-list-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  {post.flagCount||0}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Profile Panel ─────────────────────────────────────────
function ProfilePanel({ user, onLogout, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="profile-avatar-big">👤</div>
        <div className="profile-name">{user.name || 'Anonymous'}</div>
        <div className="profile-email">{user.email}</div>
        <button className="btn-logout" id="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

// ── Main FeedPage ─────────────────────────────────────────
const CEBU_CENTER = [10.3157, 123.8854];

export default function FeedPage({ user, onLogout }) {
  const [posts, setPosts]               = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter]       = useState(CEBU_CENTER);
  const [activeTab, setActiveTab]       = useState('Public');
  const [activeNav, setActiveNav]       = useState('map');
  const [showCompose, setShowCompose]   = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [locMsg, setLocMsg]             = useState('');
  const [loading, setLoading]           = useState(true);
  const pollRef = useRef(null);

  const userId = user?.userId;

  // ── Location ────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: CEBU_CENTER[0], lng: CEBU_CENTER[1] });
      setLocMsg('GPS not supported. Using Cebu City.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter([loc.lat, loc.lng]);
      },
      () => {
        setUserLocation({ lat: CEBU_CENTER[0], lng: CEBU_CENTER[1] });
        setMapCenter(CEBU_CENTER);
        setLocMsg('Using Cebu City default location.');
        setTimeout(() => setLocMsg(''), 3500);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => { requestLocation(); }, [requestLocation]);

  // ── Fetch Posts ─────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const data = await apiGetPosts(userId);
      const RADIUS_KM = 10;
      const filtered = userLocation
        ? data.filter(p => !p.latitude || haversineKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude) <= RADIUS_KM)
        : data;
      setPosts(filtered);
    } catch(e) { /* ignore */ }
    finally { setLoading(false); }
  }, [userId, userLocation]);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
    pollRef.current = setInterval(fetchPosts, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchPosts]);

  // ── Vote ────────────────────────────────────────────────
  const handleVote = async (postId, voteType) => {
    if (!userId) return;
    try {
      const updated = await apiVote(postId, userId, voteType);
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, ...updated } : p));
      if (selectedPost?.id === postId) setSelectedPost(p => ({ ...p, ...updated }));
    } catch(ex) { alert(ex.message || 'Could not vote.'); }
  };

  // ── Flag ────────────────────────────────────────────────
  const handleFlag = async (postId) => {
    if (!userId) return;
    const post = posts.find(p => p.id === postId);
    if (post?.userFlagged) return;
    try {
      const updated = await apiFlag(postId, userId, 'INAPPROPRIATE');
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, ...updated } : p));
      if (selectedPost?.id === postId) setSelectedPost(p => ({ ...p, ...updated }));
    } catch(ex) { alert(ex.message || 'Could not flag.'); }
  };

  const visiblePosts = activeTab === 'My Map'
    ? posts.filter(p => p.userId === userId)
    : posts.filter(p => !p.isHidden);

  const openPost = useCallback((post) => {
    setSelectedPost(post);
    setActiveNav('map');
  }, []);

  return (
    <div className="feed-page">

      {/* ── Top Nav ── */}
      <nav className="feed-nav">
        <div className="nav-brand">
          <span className="nav-brand-pin">📍</span>
          Unsaid Cebu
        </div>
        <button className="nav-menu-btn" title="Menu">⋮</button>
      </nav>

      {/* ── Segment Tabs ── */}
      <div className="tab-bar">
        <div className="tab-segment">
          {['Public','Circles','My Map'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setActiveNav('map'); }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="map-container">
        {locMsg && <div className="loc-snack">📍 {locMsg}</div>}

        <MapContainer
          center={mapCenter}
          zoom={12}
          zoomControl={true}
          style={{ width: '100%', height: '100%' }}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController center={mapCenter} />
          {!loading && <PostMarkers posts={visiblePosts} onOpenPost={openPost} />}
        </MapContainer>

        {/* Floating center controls */}
        <div className="map-float-controls">
          <button className="map-float-btn" title="My Location" onClick={requestLocation}>📍</button>
          <button className="map-float-btn" title="Nearby" onClick={() => {
            if (userLocation) { setLocMsg(`📍 ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`); setTimeout(() => setLocMsg(''), 2500); }
          }}>🗺️</button>
        </div>

        {/* FAB */}
        <button id="fab-compose" className="fab-compose" title="New Post" onClick={() => setShowCompose(true)}>+</button>
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-item ${activeNav==='words'?'active':''}`} onClick={() => setActiveNav(activeNav==='words'?'map':'words')}>
          <span className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </span>
          Unspoken Words
        </button>
        <button className={`bottom-nav-item ${activeNav==='map'?'active':''}`} onClick={() => { setActiveNav('map'); setSelectedPost(null); }}>
          <span className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          </span>
          Map
        </button>
        <button className={`bottom-nav-item ${activeNav==='profile'?'active':''}`} onClick={() => setActiveNav(activeNav==='profile'?'map':'profile')}>
          <span className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          Profile
        </button>
      </nav>

      {/* ── Panels & Modals ── */}
      {activeNav === 'words' && (
        <ListPanel
          posts={visiblePosts}
          onVote={handleVote}
          onFlag={handleFlag}
          onClose={() => setActiveNav('map')}
          onPostClick={post => { setSelectedPost(post); setActiveNav('map'); }}
        />
      )}

      {activeNav === 'profile' && (
        <ProfilePanel user={user} onLogout={onLogout} onClose={() => setActiveNav('map')} />
      )}

      {showCompose && (
        <ComposeModal
          userLocation={userLocation}
          currentUserId={userId}
          onClose={() => setShowCompose(false)}
          onPosted={() => { setShowCompose(false); fetchPosts(); }}
        />
      )}

      {selectedPost && (
        <PostPopup
          post={selectedPost}
          currentUserId={userId}
          onVote={handleVote}
          onFlag={handleFlag}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
