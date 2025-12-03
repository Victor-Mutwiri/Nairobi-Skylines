import React from 'react';

const NairobiSkyline: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 md:opacity-100">
      <svg
        className="absolute bottom-0 w-full h-auto min-h-[40vh]"
        viewBox="0 0 1440 500"
        preserveAspectRatio="xMidYBottom"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="kiccGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Background silhouette (Distant Hills/Ngong Hills) */}
        <path
          d="M0,400 Q200,300 400,380 T800,350 T1200,380 T1440,420 V500 H0 Z"
          fill="#1e293b"
          opacity="0.5"
        />

        {/* Generic City Block Layer 3 */}
        <path
          d="M100,500 V350 H200 V400 H250 V300 H350 V500 Z"
          fill="url(#buildingGradient)"
          opacity="0.3"
        />
        <path
          d="M1100,500 V320 H1200 V380 H1250 V500 Z"
          fill="url(#buildingGradient)"
          opacity="0.3"
        />

        {/* Times Tower Representation */}
        <rect x="850" y="150" width="80" height="350" fill="url(#buildingGradient)" />
        <rect x="860" y="160" width="60" height="330" fill="#334155" opacity="0.8" />
        {/* Windows */}
        {[...Array(10)].map((_, i) => (
            <rect key={`tt-${i}`} x="865" y={170 + i * 30} width="50" height="15" fill="#fcd116" opacity="0.2" />
        ))}

        {/* UAP Tower Representation (Simple) */}
        <path d="M1000,500 L1000,200 L1040,150 L1080,200 L1080,500 Z" fill="url(#buildingGradient)" />

        {/* KICC Representation (Iconic Cylinder) */}
        <g transform="translate(600, 100)">
          {/* Main Cylinder */}
          <rect x="0" y="40" width="100" height="360" fill="url(#kiccGradient)" />
          {/* Vertical Lines */}
          <rect x="20" y="40" width="5" height="360" fill="#64748b" opacity="0.3" />
          <rect x="40" y="40" width="5" height="360" fill="#64748b" opacity="0.3" />
          <rect x="60" y="40" width="5" height="360" fill="#64748b" opacity="0.3" />
          <rect x="80" y="40" width="5" height="360" fill="#64748b" opacity="0.3" />
          
          {/* Top Saucer (Helipad) */}
          <ellipse cx="50" cy="40" rx="65" ry="15" fill="#475569" />
          <ellipse cx="50" cy="35" rx="65" ry="15" fill="#cbd5e1" />
          
          {/* Podium */}
          <rect x="-40" y="380" width="180" height="50" fill="#475569" />
        </g>

        {/* Foreground Expressway */}
        <path
          d="M-50,480 Q720,400 1490,480"
          stroke="#334155"
          strokeWidth="40"
          fill="none"
        />
        <path
          d="M-50,480 Q720,400 1490,480"
          stroke="#475569"
          strokeWidth="36"
          fill="none"
          strokeDasharray="20, 20"
        />
        {/* Moving Cars (Animated Dots) */}
        <circle r="4" fill="#ef4444">
           <animateMotion 
             dur="8s" 
             repeatCount="indefinite"
             path="M-50,480 Q720,400 1490,480"
           />
        </circle>
        <circle r="4" fill="#fcd116">
           <animateMotion 
             dur="6s" 
             repeatCount="indefinite"
             begin="2s"
             path="M-50,480 Q720,400 1490,480"
           />
        </circle>
      </svg>
    </div>
  );
};

export default NairobiSkyline;