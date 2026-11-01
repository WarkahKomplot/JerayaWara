import React from 'react';

export interface JerayaWaraLogoProps {
  size?: number; // Size in pixels (default: 36)
  className?: string;
}

export const JerayaWaraLogo: React.FC<JerayaWaraLogoProps> = ({
  size = 36,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex-shrink-0 select-none overflow-hidden rounded-xl shadow-lg shadow-blue-500/20 ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="jw-app-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1329" />
            <stop offset="50%" stopColor="#070c18" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="jw-app-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#1e293b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
          </linearGradient>

          <radialGradient id="jw-app-horizon" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="jw-app-road" x1="50%" y1="100%" x2="50%" y2="35%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="60%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="jw-app-rail-l" x1="0%" y1="100%" x2="50%" y2="40%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="jw-app-rail-r" x1="100%" y1="100%" x2="50%" y2="40%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>

          <linearGradient id="jw-app-arrow-l" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="jw-app-arrow-r" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="jw-app-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Base Squircle Badge */}
        <rect
          x="12"
          y="12"
          width="488"
          height="488"
          rx="110"
          fill="url(#jw-app-bg)"
          stroke="url(#jw-app-border)"
          strokeWidth="10"
        />

        {/* Horizon Glow */}
        <circle cx="256" cy="200" r="170" fill="url(#jw-app-horizon)" />

        {/* Highway Curve */}
        <path d="M 60 270 Q 256 220 452 270" stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.6" />

        {/* Highway Surface */}
        <path d="M 120 456 L 244 206 L 268 206 L 392 456 Z" fill="url(#jw-app-road)" />

        {/* Glowing Edge Rails */}
        <path d="M 120 456 L 244 206" stroke="url(#jw-app-rail-l)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 392 456 L 268 206" stroke="url(#jw-app-rail-r)" strokeWidth="14" strokeLinecap="round" />

        {/* Outer Lane Guides */}
        <path d="M 172 456 L 249 208" stroke="#38bdf8" strokeWidth="4" opacity="0.5" />
        <path d="M 340 456 L 263 208" stroke="#60a5fa" strokeWidth="4" opacity="0.5" />

        {/* Highway Center Golden Lane Dashes */}
        <line x1="256" y1="450" x2="256" y2="400" stroke="url(#jw-app-gold)" strokeWidth="11" strokeLinecap="round" />
        <line x1="256" y1="375" x2="256" y2="335" stroke="url(#jw-app-gold)" strokeWidth="9" strokeLinecap="round" />
        <line x1="256" y1="315" x2="256" y2="285" stroke="url(#jw-app-gold)" strokeWidth="7" strokeLinecap="round" />
        <line x1="256" y1="270" x2="256" y2="248" stroke="url(#jw-app-gold)" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="256" y1="237" x2="256" y2="222" stroke="url(#jw-app-gold)" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="256" y1="214" x2="256" y2="206" stroke="url(#jw-app-gold)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Speed Arcs */}
        <path d="M 100 340 C 130 250 190 190 240 180" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
        <path d="M 412 340 C 382 250 322 190 272 180" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />

        {/* Navigational Delta Apex ("Wara") */}
        <polygon points="256,92 190,208 256,182" fill="url(#jw-app-arrow-l)" />
        <polygon points="256,92 256,182 322,208" fill="url(#jw-app-arrow-r)" />

        {/* Arrow Center Spine */}
        <line x1="256" y1="92" x2="256" y2="182" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.9" />

        {/* Beacon Gold Star Apex */}
        <circle cx="256" cy="88" r="14" fill="url(#jw-app-gold)" />
        <circle cx="256" cy="88" r="7" fill="#ffffff" />
        <path d="M 256 60 Q 256 88 284 88 Q 256 88 256 116 Q 256 88 228 88 Q 256 88 256 60 Z" fill="#ffffff" opacity="0.95" />
      </svg>
    </div>
  );
};
