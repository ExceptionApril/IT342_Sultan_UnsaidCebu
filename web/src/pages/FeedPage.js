// src/pages/FeedPage.js — Map-first dashboard (Leaflet)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiGetPosts, apiCreatePost, apiVote, apiFlag } from '../api';
import { Icon } from '../components/Icons';

// Fix Leaflet's broken default icon paths in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Helpers ──────────────────────────────────────────────
const ADJ1 = ['Serene','Quiet','Gentle','Warm','Silent','Soft','Calm','Tender'];
const ADJ2 = ['Sunset','Breeze','Dream','Rain','Moon','Mist','Star','Wave'];
function buildAnonDisplay(userId) {
  if (!userId && userId !== 0) return 'Anonymous Wanderer';
  const a1 = ADJ1[userId % ADJ1.length];
  const a2 = ADJ2[Math.floor(userId / ADJ1.length) % ADJ2.length];
  const num = (userId * 137 + 500) % 1000;
  return `ANON-${a1}-${a2}-${num}`;
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TOXIC_WORDS = ['hate','kill','die','stupid','idiot','loser','ugly','worthless'];
function toxicityScore(text) {
  const lower = text.toLowerCase();
  return TOXIC_WORDS.filter(w => lower.includes(w)).length / TOXIC_WORDS.length;
}

// ── Map Controller ────────────────────────────────────
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) { map.setView(center, 13, { animate: true }); }
  }, [center, map]);
  return null;
}

// ── Post Markers ──────────────────────────────────────
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
        iconSize: [40, 40],
        iconAnchor: [20, 20],
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

// ── "You are here" marker ─────────────────────────────
function UserLocationMarker({ location }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!location) return;
    const icon = L.divIcon({
      className: '',
      html: `
        <div class="me-marker">
          <span class="me-pulse"></span>
          <span class="me-pulse me-pulse-2"></span>
          <span class="me-dot"></span>
        </div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
      markerRef.current.setIcon(icon);
    } else {
      markerRef.current = L.marker([location.lat, location.lng], {
        icon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
      }).addTo(map);
    }
    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [location, map]);

  return null;
}

// ── Compose Modal ─────────────────────────────────────
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
    if (score >= 0.3) setWarning('This post may contain sensitive language. Consider revising.');
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
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet compose-sheet">
        <div className="modal-handle" />
        <div className="compose-sheet-header">
          <div className="compose-sheet-avatar"><Icon name="send" size={20} stroke="white" /></div>
          <div>
            <div className="compose-sheet-title">Share an unsaid feeling</div>
            <div className="compose-sheet-sub">Your identity stays anonymous</div>
          </div>
        </div>

        <textarea
          id="compose-textarea"
          className="compose-textarea"
          placeholder="What's unsaid in your heart today? Share anonymously with those nearby in Cebu…"
          value={content}
          onChange={e => { setContent(e.target.value); setError(''); }}
          maxLength={MAX + 1}
          autoFocus
        />
        {error && (
          <div className="error-msg" style={{ marginTop: 10, marginBottom: 0 }}>
            <Icon name="alert" size={16} /><span>{error}</span>
          </div>
        )}
        {warning && <div className="toxicity-warning">{warning}</div>}

        <div className="compose-footer">
          <div className="compose-meta">
            <div className={`loc-dot ${userLocation ? '' : 'off'}`} />
            <span>{userLocation
              ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
              : 'Location off'}</span>
          </div>
          <div className="compose-actions">
            <span className={`char-count ${content.length > MAX ? 'over' : content.length > MAX*0.8 ? 'warn' : ''}`}>
              {content.length}/{MAX}
            </span>
            <button id="post-submit" className="btn-post" onClick={handlePost} disabled={loading || !content.trim() || !userLocation}>
              {loading ? 'Posting…' : 'Post anonymously'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Popup ────────────────────────────────────────
function PostPopup({ post, onVote, onFlag, onClose }) {
  if (!post) return null;
  const anonDisplay = post.anonName || buildAnonDisplay(post.userId);

  return (
    <div className="post-card-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="post-card-popup">
        <button className="post-card-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={16} />
        </button>

        <div className="post-card-message">{post.content}</div>
        <div className="post-card-divider" />

        <div className="post-card-bottom">
          <div className="post-card-author">
            <div className="post-card-anon-name">{anonDisplay}</div>
            <div className="post-card-date">{formatDate(post.createdAt)}</div>
          </div>

          <div className="post-card-actions">
            <button
              className={`pca-btn ${post.userVote === 'UPVOTE' ? 'pca-loved' : ''}`}
              onClick={() => onVote(post.id, 'UPVOTE')}
              title="Love"
            >
              <Icon name="heart" size={19} />
              <span>{post.upvotes || 0}</span>
            </button>
            <button
              className={`pca-btn ${post.userVote === 'DOWNVOTE' ? 'pca-down' : ''}`}
              onClick={() => onVote(post.id, 'DOWNVOTE')}
              title="Downvote"
            >
              <Icon name="thumbs-down" size={19} />
              <span>{post.downvotes || 0}</span>
            </button>
            <button
              className={`pca-btn ${post.userFlagged ? 'pca-flagged' : ''}`}
              onClick={() => onFlag(post.id)}
              disabled={post.userFlagged}
              title="Report"
            >
              <Icon name="flag" size={19} />
              <span>{post.flagCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── List Panel ────────────────────────────────────────
function ListPanel({ posts, onClose, onPostClick }) {
  return (
    <div className="list-panel">
      <div className="list-handle" />
      <div className="list-panel-header">
        <div className="list-panel-titles">
          <span className="list-panel-title">Unspoken Words</span>
          <span className="list-panel-count">{posts.length} {posts.length === 1 ? 'whisper' : 'whispers'} nearby</span>
        </div>
        <button className="list-panel-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={16} />
        </button>
      </div>

      <div className="list-panel-body">
        {posts.length === 0 ? (
          <div className="list-empty">
            <div className="list-empty-icon"><Icon name="message" size={28} stroke="var(--indigo-400)" /></div>
            <div className="list-empty-title">No whispers yet</div>
            <div className="list-empty-sub">Be the first to drop an unsaid feeling on the map.</div>
          </div>
        ) : posts.map(post => {
          const anonDisplay = post.anonName || buildAnonDisplay(post.userId);
          return (
            <div className="post-list-item" key={post.id} onClick={() => onPostClick(post)}>
              <div className="post-list-content">{post.content}</div>
              <div className="post-list-bottom">
                <div className="post-list-author-row">
                  <span className="post-list-anon-name">{anonDisplay}</span>
                  <span className="post-list-date">· {formatDate(post.createdAt)}</span>
                </div>
                <div className="post-list-stats">
                  <span className="post-list-stat">
                    <Icon name="heart" size={14} /> {post.upvotes||0}
                  </span>
                  <span className="post-list-stat">
                    <Icon name="flag" size={14} /> {post.flagCount||0}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Profile Panel — Modern card with cover + stats ───
function ProfilePanel({ user, posts = [], onLogout, onClose }) {
  const safePosts = Array.isArray(posts) ? posts : [];
  const anonDisplay = buildAnonDisplay(user?.userId);
  const userPosts = safePosts.filter(p => p.userId === user?.userId);
  const totalLoves = userPosts.reduce((acc, p) => acc + (p.upvotes || 0), 0);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div className="profile-panel-card">
          {/* Lavender field cover */}
          <div className="profile-cover">
            <button className="profile-close-btn" onClick={onClose} aria-label="Close">
              <Icon name="close" size={16} />
            </button>
          </div>

          {/* Avatar + info */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-big">
              {(user.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-name">{user.name || 'Anonymous'}</div>
            <div className="profile-email">{user.email}</div>
            <div className="profile-anon">{anonDisplay}</div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{userPosts.length}</span>
              <span className="profile-stat-label">Whispers</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{totalLoves}</span>
              <span className="profile-stat-label">Loves</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{safePosts.length}</span>
              <span className="profile-stat-label">Nearby</span>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button className="profile-action-item" onClick={() => {}}>
              <div className="profile-action-icon">
                <Icon name="shield" size={18} stroke="var(--indigo-600)" />
              </div>
              <div>
                <strong>Privacy & Safety</strong>
                <span>Your identity is always protected</span>
              </div>
            </button>

            <button className="profile-action-item" onClick={() => {}}>
              <div className="profile-action-icon">
                <Icon name="map" size={18} stroke="var(--indigo-600)" />
              </div>
              <div>
                <strong>My Whisper Map</strong>
                <span>See all your posted locations</span>
              </div>
            </button>

            <div className="profile-divider" />

            <button className="btn-logout" id="logout-btn" onClick={onLogout}>
              <Icon name="log-out" size={18} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main FeedPage ─────────────────────────────────────
const CEBU_CENTER = [10.3157, 123.8854];

export default function FeedPage({ user, onLogout }) {
  const [posts, setPosts]               = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter]       = useState(CEBU_CENTER);
  const [activeNav, setActiveNav]       = useState('map');
  const [showCompose, setShowCompose]   = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [locMsg, setLocMsg]             = useState('');
  const [loading, setLoading]           = useState(true);
  const pollRef = useRef(null);
  const pageRef = useRef(null);

  const userId = user?.userId;

  // Cursor → CSS vars so the lavender field sways toward the pointer (like wind).
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    let raf = 0;
    let lastX = 0.5, lastY = 0.5;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      lastX = (e.clientX - rect.left) / rect.width;
      lastY = (e.clientY - rect.top) / rect.height;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', lastX.toFixed(3));
        el.style.setProperty('--my', lastY.toFixed(3));
        raf = 0;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const watchIdRef = useRef(null);
  const hasFixRef  = useRef(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: CEBU_CENTER[0], lng: CEBU_CENTER[1] });
      setLocMsg('GPS not supported. Using Cebu City.');
      setTimeout(() => setLocMsg(''), 3500);
      return;
    }
    setLocMsg('Locating you…');
    const onSuccess = (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(loc);
      // Only re-center on the first fix so we don't fight the user panning.
      if (!hasFixRef.current) {
        setMapCenter([loc.lat, loc.lng]);
        setLocMsg(`Located you (±${Math.round(pos.coords.accuracy || 0)} m)`);
        setTimeout(() => setLocMsg(''), 2500);
        hasFixRef.current = true;
      }
    };
    const onError = () => {
      if (hasFixRef.current) return; // keep last good fix
      setUserLocation({ lat: CEBU_CENTER[0], lng: CEBU_CENTER[1] });
      setMapCenter(CEBU_CENTER);
      setLocMsg('Could not get your location. Showing Cebu City.');
      setTimeout(() => setLocMsg(''), 3500);
    };
    // Clear any prior watch before starting a new one.
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess, onError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
    return () => {
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [requestLocation]);

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

  const handleVote = async (postId, voteType) => {
    if (!userId) return;
    try {
      const updated = await apiVote(postId, userId, voteType);
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, ...updated } : p));
      if (selectedPost?.id === postId) setSelectedPost(p => ({ ...p, ...updated }));
    } catch(ex) { alert(ex.message || 'Could not vote.'); }
  };

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

  const visiblePosts = posts.filter(p => !p.isHidden);

  const openPost = useCallback((post) => {
    setSelectedPost(post);
    setActiveNav('map');
  }, []);

  return (
    <div className="feed-page" ref={pageRef}>
      {/* ── Top Nav ── */}
      <nav className="feed-nav">
        <div className="nav-brand">
          <div className="nav-brand-icon">
            <Icon name="pin" size={16} stroke="white" />
          </div>
          <div className="nav-brand-text">
            Unsaid Cebu
            <small>Whisper & Listen</small>
          </div>
        </div>
        <div className="nav-actions">
          <button className="nav-icon-btn" title="Center on me" onClick={requestLocation}>
            <Icon name="crosshair" size={20} />
          </button>
        </div>
      </nav>

      {/* ── Animated lavender field (drifts on its own, sways toward cursor) ── */}
      <div className="lavender-field" aria-hidden="true">
        <span className="sprig sprig-1" />
        <span className="sprig sprig-2" />
        <span className="sprig sprig-3" />
        <span className="sprig sprig-4" />
        <span className="sprig sprig-5" />
      </div>

      {/* ── Map ── */}
      <div className="map-container">
        {locMsg && (
          <div className="loc-snack">
            <Icon name="pin" size={14} stroke="white" />
            <span>{locMsg}</span>
          </div>
        )}

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
          {userLocation && <UserLocationMarker location={userLocation} />}
          {!loading && <PostMarkers posts={visiblePosts} onOpenPost={openPost} />}
        </MapContainer>

        <div className="map-float-controls">
          <button className="map-float-btn" title="My Location" onClick={requestLocation}>
            <Icon name="crosshair" size={20} stroke="white" />
          </button>
          <button className="map-float-btn" title="Cebu" onClick={() => setMapCenter(CEBU_CENTER)}>
            <Icon name="compass" size={20} stroke="white" />
          </button>
        </div>

        <button id="fab-compose" className="fab-compose" title="New whisper" onClick={() => setShowCompose(true)}>
          <Icon name="plus" size={26} stroke="white" strokeWidth={2.2} />
        </button>
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-item ${activeNav==='words'?'active':''}`} onClick={() => setActiveNav(activeNav==='words'?'map':'words')}>
          <Icon name="message" size={22} />
          Unspoken
        </button>
        <button className={`bottom-nav-item ${activeNav==='map'?'active':''}`} onClick={() => { setActiveNav('map'); setSelectedPost(null); }}>
          <Icon name="map" size={22} />
          Map
        </button>
        <button className={`bottom-nav-item ${activeNav==='profile'?'active':''}`} onClick={() => setActiveNav(activeNav==='profile'?'map':'profile')}>
          <Icon name="user" size={22} />
          Profile
        </button>
      </nav>

      {/* ── Panels & Modals ── */}
      {activeNav === 'words' && (
        <ListPanel
          posts={visiblePosts}
          onClose={() => setActiveNav('map')}
          onPostClick={post => { setSelectedPost(post); setActiveNav('map'); }}
        />
      )}

      {activeNav === 'profile' && (
        <ProfilePanel user={user} posts={posts} onLogout={onLogout} onClose={() => setActiveNav('map')} />
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
          onVote={handleVote}
          onFlag={handleFlag}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
