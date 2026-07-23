// A lightweight, self-contained SVG crest inspired by the SCC shield.
// Uses brand green + gold. No external image assets required.
export default function Crest({ className = "h-10 w-10" }) {
  return (
    <svg
      viewBox="0 0 100 110"
      className={className}
      role="img"
      aria-label="FEU Alabang SCC crest"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="crestGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="crestGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F5257" />
          <stop offset="100%" stopColor="#004B23" />
        </linearGradient>
      </defs>

      {/* Wings */}
      <path
        d="M28 20 L4 10 L26 26 L8 22 L28 34 Z"
        fill="#3A7D44"
        opacity="0.9"
      />
      <path
        d="M72 20 L96 10 L74 26 L92 22 L72 34 Z"
        fill="#3A7D44"
        opacity="0.9"
      />

      {/* Shield outline */}
      <path
        d="M50 12 L84 24 L84 60 C84 82 68 94 50 100 C32 94 16 82 16 60 L16 24 Z"
        fill="url(#crestGold)"
        stroke="#004B23"
        strokeWidth="3"
      />

      {/* Quadrants */}
      <clipPath id="shieldClip">
        <path d="M50 15 L81 26 L81 60 C81 80 66 91 50 97 C34 91 19 80 19 60 L19 26 Z" />
      </clipPath>
      <g clipPath="url(#shieldClip)">
        <rect x="19" y="15" width="31" height="41" fill="url(#crestGold)" />
        <rect x="50" y="15" width="31" height="41" fill="url(#crestGreen)" />
        <rect x="19" y="56" width="31" height="45" fill="url(#crestGreen)" />
        <rect x="50" y="56" width="31" height="45" fill="url(#crestGold)" />
        <line x1="50" y1="15" x2="50" y2="100" stroke="#FFB703" strokeWidth="1.5" />
        <line x1="19" y1="56" x2="81" y2="56" stroke="#FFB703" strokeWidth="1.5" />
      </g>

      {/* Ribbon */}
      <path
        d="M22 88 Q50 102 78 88 L74 96 Q50 106 26 96 Z"
        fill="url(#crestGold)"
        stroke="#004B23"
        strokeWidth="1.5"
      />
    </svg>
  );
}
