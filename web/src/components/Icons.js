// Centralized SVG icon library — clean line icons, no emojis
import React from 'react';

const baseProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Icon = ({ name, size = 20, ...rest }) => {
  const props = { ...baseProps, width: size, height: size, ...rest };
  switch (name) {
    case 'pin':
      return (
        <svg {...props}>
          <path d="M12 22s-7-7.58-7-13a7 7 0 0 1 14 0c0 5.42-7 13-7 13z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      );
    case 'mail':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2.5"/>
          <path d="M3.5 7l8.5 6 8.5-6"/>
        </svg>
      );
    case 'lock':
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="10" rx="2.5"/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    case 'eye':
      return (
        <svg {...props}>
          <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );
    case 'eye-off':
      return (
        <svg {...props}>
          <path d="M17.94 17.94A10.5 10.5 0 0 1 12 19c-6.5 0-10.5-7-10.5-7a18.7 18.7 0 0 1 5.06-5.94M9.9 4.24A10.5 10.5 0 0 1 12 4c6.5 0 10.5 7 10.5 7a18.7 18.7 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...props}>
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="13 6 19 12 13 18"/>
        </svg>
      );
    case 'alert':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9"/>
          <line x1="12" y1="8" x2="12" y2="13"/>
          <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <polyline points="5 12 10 17 19 7"/>
        </svg>
      );
    case 'check-circle':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9"/>
          <polyline points="8 12 11 15 16 9"/>
        </svg>
      );
    case 'send':
      return (
        <svg {...props}>
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      );
    case 'flag':
      return (
        <svg {...props}>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      );
    case 'thumbs-down':
      return (
        <svg {...props}>
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
        </svg>
      );
    case 'close':
      return (
        <svg {...props}>
          <line x1="6" y1="6" x2="18" y2="18"/>
          <line x1="18" y1="6" x2="6" y2="18"/>
        </svg>
      );
    case 'map':
      return (
        <svg {...props}>
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      );
    case 'compass':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9"/>
          <polygon points="16 8 14 14 8 16 10 10 16 8"/>
        </svg>
      );
    case 'message':
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      );
    case 'menu':
      return (
        <svg {...props}>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      );
    case 'log-out':
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      );
    case 'bookmark':
      return (
        <svg {...props}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z"/>
        </svg>
      );
    case 'crosshair':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
        </svg>
      );
    case 'lavender':
      return (
        <svg {...props} viewBox="0 0 32 80" fill="none" stroke="none">
          {/* Stem */}
          <path d="M16 78 Q15 60 16 42 Q17 30 16 20" stroke={rest.stemColor || '#8BA88E'} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          {/* Small leaves */}
          <path d="M16 55 Q10 50 8 46" stroke={rest.stemColor || '#8BA88E'} strokeWidth="0.9" fill="none" strokeLinecap="round"/>
          <path d="M8 46 Q12 48 16 55" fill={rest.leafColor || '#B8D4BA'} fillOpacity="0.5"/>
          <path d="M16 48 Q22 44 24 40" stroke={rest.stemColor || '#8BA88E'} strokeWidth="0.9" fill="none" strokeLinecap="round"/>
          <path d="M24 40 Q20 43 16 48" fill={rest.leafColor || '#B8D4BA'} fillOpacity="0.5"/>
          {/* Lavender petals — bottom cluster */}
          <ellipse cx="14" cy="38" rx="3.5" ry="2.8" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.7"/>
          <ellipse cx="18" cy="37" rx="3.2" ry="2.6" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.6"/>
          <ellipse cx="15" cy="34" rx="3" ry="2.5" fill={rest.petalColor || '#A78BFA'} fillOpacity="0.65"/>
          <ellipse cx="17" cy="31" rx="3.2" ry="2.8" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.7"/>
          {/* Middle cluster */}
          <ellipse cx="14.5" cy="28" rx="3" ry="2.5" fill={rest.petalColor || '#A78BFA'} fillOpacity="0.6"/>
          <ellipse cx="17.5" cy="26" rx="3.2" ry="2.6" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.7"/>
          <ellipse cx="15" cy="23" rx="2.8" ry="2.4" fill={rest.petalColor || '#8B5CF6'} fillOpacity="0.55"/>
          <ellipse cx="17" cy="20" rx="2.6" ry="2.2" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.65"/>
          {/* Top cluster */}
          <ellipse cx="15.5" cy="17" rx="2.4" ry="2" fill={rest.petalColor || '#A78BFA'} fillOpacity="0.6"/>
          <ellipse cx="16.5" cy="14" rx="2" ry="1.8" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.55"/>
          <ellipse cx="16" cy="11" rx="1.6" ry="1.5" fill={rest.petalColor || '#8B5CF6'} fillOpacity="0.5"/>
          <ellipse cx="16" cy="8" rx="1.2" ry="1.2" fill={rest.petalColor || '#A78BFA'} fillOpacity="0.45"/>
        </svg>
      );
    case 'lavender-mini':
      return (
        <svg {...props} viewBox="0 0 20 40" fill="none" stroke="none">
          <path d="M10 38 Q9.5 30 10 20" stroke={rest.stemColor || '#8BA88E'} strokeWidth="0.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="9" cy="18" rx="2.5" ry="2" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.6"/>
          <ellipse cx="11" cy="15.5" rx="2.2" ry="1.8" fill={rest.petalColor || '#A78BFA'} fillOpacity="0.55"/>
          <ellipse cx="9.5" cy="13" rx="2" ry="1.6" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.6"/>
          <ellipse cx="10.5" cy="10.5" rx="1.8" ry="1.5" fill={rest.petalColor || '#A78BFA'} fillOpacity="0.5"/>
          <ellipse cx="10" cy="8" rx="1.4" ry="1.2" fill={rest.petalColor || '#8B5CF6'} fillOpacity="0.45"/>
          <ellipse cx="10" cy="5.5" rx="1" ry="1" fill={rest.petalColor || '#C4B5FD'} fillOpacity="0.4"/>
        </svg>
      );
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      );
    case 'edit':
      return (
        <svg {...props}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      );
    case 'calendar':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
