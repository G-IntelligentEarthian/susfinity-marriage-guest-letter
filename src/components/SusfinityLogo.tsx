import React from 'react';

interface SusfinityLogoProps {
  className?: string;
  variant?: 'color' | 'monochrome';
  size?: number | string;
}

export const SusfinityLogo: React.FC<SusfinityLogoProps> = ({
  className = '',
  variant = 'color',
  size = '100%',
}) => {
  const isColor = variant === 'color';

  return (
    <svg
      className={`select-none ${className}`}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {isColor ? (
          <>
            {/* Soft watercolor gradients for earth, background, and vines */}
            <radialGradient id="bgGrad" cx="100" cy="100" r="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f3f8f4" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#e3ede4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#cddec0" stopOpacity="0.75" />
            </radialGradient>
            
            <radialGradient id="globeGrad" cx="100" cy="100" r="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e6f1ec" />
              <stop offset="70%" stopColor="#a3ccbe" />
              <stop offset="100%" stopColor="#75a697" />
            </radialGradient>

            <linearGradient id="vineGrad" x1="50" y1="100" x2="150" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5d7259" />
              <stop offset="50%" stopColor="#759470" />
              <stop offset="100%" stopColor="#485c44" />
            </linearGradient>

            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3f4f3e" floodOpacity="0.12" />
            </filter>
            
            <filter id="watercolorBleed" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </>
        ) : (
          <>
            {/* Highlight gradients for high-fidelity monochrome seal impression */}
            <linearGradient id="monochromeGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
            </linearGradient>
            
            <linearGradient id="sealGoldGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f3e8d2" />
              <stop offset="100%" stopColor="#bfa175" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Watercolor background round plaque (Color mode only) */}
      {isColor && (
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="url(#bgGrad)"
          filter="url(#watercolorBleed) url(#softShadow)"
          stroke="#cad7c2"
          strokeWidth="0.5"
        />
      )}

      {/* 1. OUTER FLORAL WREATH (Sage/Olive leaves and flowers) */}
      <g stroke={isColor ? "#6e846a" : "url(#monochromeGrad)"} strokeWidth={isColor ? "1.5" : "2"} strokeLinecap="round" fill="none">
        {/* Circle path for wreath */}
        <circle cx="100" cy="100" r="82" strokeOpacity={isColor ? 0.3 : 0.4} strokeDasharray="5,3" />

        {/* Wreath Vines - Left half and Right half */}
        <path d="M100 182 C44 182, 18 152, 18 100 C18 48, 44 18, 100 18" strokeWidth={isColor ? "1.2" : "1.8"} />
        <path d="M100 182 C156 182, 182 152, 182 100 C182 48, 156 18, 100 18" strokeWidth={isColor ? "1.2" : "1.8"} />

        {/* Leaf details cascading along the wreath */}
        {/* Left Hand Wreath Leaves */}
        <path d="M100 18 C92 22, 88 18, 92 14 C96 10, 100 18, 100 18 Z" fill={isColor ? "#7a9575" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M82 23 C74 29, 71 25, 76 20 C81 15, 82 23, 82 23 Z" fill={isColor ? "#829c7d" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M63 32 C55 39, 52 34, 58 29 C64 24, 63 32, 63 32 Z" fill={isColor ? "#768f71" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M48 45 C40 54, 38 49, 44 43 C50 37, 48 45, 48 45 Z" fill={isColor ? "#7d9778" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M35 63 C28 72, 27 67, 33 60 C39 53, 35 63, 35 63 Z" fill={isColor ? "#6d8669" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M25 82 C20 92, 19 87, 24 79 C29 71, 25 82, 25 82 Z" fill={isColor ? "#7ea078" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M21 102 C18 113, 17 108, 21 99 C25 90, 21 102, 21 102 Z" fill={isColor ? "#6d8669" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M22 122 C21 133, 21 128, 25 119 C29 110, 22 122, 22 122 Z" fill={isColor ? "#7a9874" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M29 142 C29 152, 31 147, 34 139 C37 131, 29 142, 29 142 Z" fill={isColor ? "#7ea078" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M42 160 C42 170, 45 165, 47 156 C49 147, 42 160, 42 160 Z" fill={isColor ? "#6e876a" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M57 172 C58 181, 62 176, 62 167 C62 158, 57 172, 57 172 Z" fill={isColor ? "#829f7d" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M78 180 C81 188, 85 183, 83 174 C81 165, 78 180, 78 180 Z" fill={isColor ? "#759070" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M98 181 C102 188, 106 183, 103 175 C100 167, 98 181, 98 181 Z" fill={isColor ? "#7fa279" : "url(#monochromeGrad)"} stroke="none" />

        {/* Right Hand Wreath Leaves */}
        <path d="M100 18 C108 22, 112 18, 108 14 C104 10, 100 18, 100 18 Z" fill={isColor ? "#7a9575" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M118 23 C126 29, 129 25, 124 20 C119 15, 118 23, 118 23 Z" fill={isColor ? "#829c7d" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M137 32 C145 39, 148 34, 142 29 C136 24, 137 32, 137 32 Z" fill={isColor ? "#768f71" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M152 45 C160 54, 162 49, 156 43 C150 37, 152 45, 152 45 Z" fill={isColor ? "#7d9778" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M165 63 C172 72, 173 67, 167 60 C161 53, 165 63, 165 63 Z" fill={isColor ? "#6d8669" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M175 82 C180 92, 181 87, 176 79 C171 71, 175 82, 175 82 Z" fill={isColor ? "#7ea078" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M179 102 C182 113, 183 108, 179 99 C175 90, 179 102, 179 102 Z" fill={isColor ? "#6d8669" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M178 122 C179 133, 179 128, 175 119 C171 110, 178 122, 178 122 Z" fill={isColor ? "#7a9874" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M171 142 C171 152, 169 147, 166 139 C163 131, 171 142, 171 142 Z" fill={isColor ? "#7ea078" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M158 160 C158 170, 155 165, 153 156 C151 147, 158 160, 158 160 Z" fill={isColor ? "#6e876a" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M143 172 C142 181, 138 176, 138 167 C138 158, 143 172, 143 172 Z" fill={isColor ? "#829f7d" : "url(#monochromeGrad)"} stroke="none" />
        <path d="M122 180 C119 188, 115 183, 117 174 C119 165, 122 180, 122 180 Z" fill={isColor ? "#759070" : "url(#monochromeGrad)"} stroke="none" />
      </g>

      {/* Wreath Small Five-Petaled Flowers */}
      {/* Function to render beautiful flowers at distinct points on the perimeter */}
      {/* Flower 1: Top (100, 18) */}
      <g transform="translate(100, 18)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" /> {/* Yellow center */}
          </>
        )}
      </g>
      
      {/* Flower 2: Upper Left (48, 45) */}
      <g transform="translate(48, 45)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower 3: Left (21, 100) */}
      <g transform="translate(21, 100)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower 4: Lower Left (42, 156) */}
      <g transform="translate(42, 156)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower 5: Bottom (100, 182) */}
      <g transform="translate(100, 182)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower 6: Lower Right (158, 156) */}
      <g transform="translate(158, 156)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower 7: Right (179, 100) */}
      <g transform="translate(179, 100)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower 8: Upper Right (152, 45) */}
      <g transform="translate(152, 45)">
        <circle cx="0" cy="0" r={isColor ? "4" : "5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} filter={isColor ? "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))" : undefined} />
        {isColor && (
          <>
            <circle cx="0" cy="-3.5" r="2.2" fill="#ffffff" />
            <circle cx="-3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="-2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="2" cy="2.8" r="2.2" fill="#ffffff" />
            <circle cx="3.3" cy="-1.1" r="2.2" fill="#ffffff" />
            <circle cx="0" cy="0" r="1.5" fill="#f4ce5a" />
          </>
        )}
      </g>


      {/* 2. THE EARTH GLOBE (Centered behind infinity symbol) */}
      <g transform="translate(100, 100)">
        {/* Globe Base Sphere */}
        <circle
          cx="0"
          cy="0"
          r="36"
          fill={isColor ? "url(#globeGrad)" : "none"}
          stroke={isColor ? "#52756a" : "url(#monochromeGrad)"}
          strokeWidth={isColor ? "1" : "2"}
          strokeDasharray={isColor ? undefined : "3,2"}
        />

        {/* Handdrawn Continent Continents Shape */}
        {/* Stylized continent outlines for an organic, sustainable earth theme */}
        <path
          d="M-28 -8 C-25 -10, -18 -8, -15 -14 C-12 -20, -5 -18, -4 -25 C-3 -32, -15 -32, -22 -28 C-29 -24, -32 -18, -32 -12 C-32 -6, -30 -6, -28 -8 M12 -31 C10 -28, 2 -26, 0 -18 C-2 -10, 8 -7, 10 -3 C12 1, 6 6, 4 12 C2 18, 12 18, 16 22 C18 20, 24 20, 26 14 C28 8, 30 1, 32 -7 C34 -15, 28 -22, 28 -28 C28 -34, 18 -34, 12 -31 M-25 15 C-23 12, -16 10, -14 15 C-12 20, -18 25, -21 28 C-24 31, -28 25, -25 15 Z"
          fill={isColor ? "#85ad9d" : "none"}
          stroke={isColor ? "#4f6e62" : "url(#monochromeGrad)"}
          strokeWidth={isColor ? "0.8" : "1.5"}
          fillOpacity={isColor ? 0.75 : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Delicate Latitude/Longitude rings for tech-earth harmony */}
        <ellipse cx="0" cy="0" rx="36" ry="10" stroke={isColor ? "#4a6e60" : "url(#monochromeGrad)"} strokeWidth={isColor ? "0.6" : "1"} strokeOpacity={isColor ? 0.25 : 0.3} fill="none" />
        <path d="M-36 0 C-15 15, 15 15, 36 0" stroke={isColor ? "#4a6e60" : "url(#monochromeGrad)"} strokeWidth={isColor ? "0.6" : "1"} strokeOpacity={isColor ? 0.25 : 0.4} fill="none" />
        <path d="M0 -36 C10 -15, 10 15, 0 36" stroke={isColor ? "#4a6e60" : "url(#monochromeGrad)"} strokeWidth={isColor ? "0.6" : "1"} strokeOpacity={isColor ? 0.25 : 0.4} fill="none" />
        <path d="M0 -36 C-10 -15, -10 15, 0 36" stroke={isColor ? "#4a6e60" : "url(#monochromeGrad)"} strokeWidth={isColor ? "0.6" : "1"} strokeOpacity={isColor ? 0.25 : 0.4} fill="none" />
      </g>


      {/* 3. BOTANICAL VINE INFINITY SYMBOL (Wrapping the globe) */}
      <g>
        {/* Infinity Shadow underneath for 3D depth (Color mode only) */}
        {isColor && (
          <path
            d="M58 100 C58 80, 85 70, 100 100 C115 130, 142 120, 142 100 C142 80, 115 70, 100 100 C85 130, 58 120, 58 100 Z"
            stroke="#1b251a"
            strokeWidth="5"
            strokeOpacity="0.12"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#watercolorBleed)"
          />
        )}

        {/* Main Infinity vine loops */}
        {/* Generates mathematical infinity shape intertwining left/right loops */}
        <path
          id="infinity-path"
          d="M58 100 C58 76, 88 68, 100 100 C112 132, 142 124, 142 100 C142 76, 112 68, 100 100 C88 132, 58 124, 58 100 Z"
          stroke={isColor ? "url(#vineGrad)" : "url(#monochromeGrad)"}
          strokeWidth={isColor ? "4.5" : "5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Outer overlay vine to add natural "nested twist" texture */}
        <path
          d="M61 98 C62 78, 86 73, 100 100 C114 127, 138 122, 139 98 C140 78, 114 73, 100 100 C86 127, 62 122, 61 98 Z"
          stroke={isColor ? "#90b08a" : "url(#monochromeGrad)"}
          strokeWidth={isColor ? "1" : "1.2"}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeOpacity={0.8}
        />

        {/* Vine leaves branching off the infinity loop */}
        {/* Left Loop Leaves */}
        <path d="M72 82 C65 77, 63 80, 68 83 C73 86, 72 82, 72 82 Z" fill={isColor ? "#769371" : "url(#monochromeGrad)"} />
        <path d="M62 105 C55 112, 58 114, 62 110 C66 106, 62 105, 62 105 Z" fill={isColor ? "#546e50" : "url(#monochromeGrad)"} />
        <path d="M80 118 C78 126, 82 126, 82 120 C82 114, 80 118, 80 118 Z" fill={isColor ? "#799673" : "url(#monochromeGrad)"} />
        <path d="M92 90 C96 82, 92 82, 90 87 C88 92, 92 90, 92 90 Z" fill={isColor ? "#688463" : "url(#monochromeGrad)"} />

        {/* Right Loop Leaves */}
        <path d="M128 118 C135 123, 137 120, 132 117 C127 114, 128 118, 128 118 Z" fill={isColor ? "#769371" : "url(#monochromeGrad)"} />
        <path d="M138 95 C145 88, 142 86, 138 90 C134 94, 138 95, 138 95 Z" fill={isColor ? "#546e50" : "url(#monochromeGrad)"} />
        <path d="M120 82 C122 74, 118 74, 118 80 C118 86, 120 82, 120 82 Z" fill={isColor ? "#799673" : "url(#monochromeGrad)"} />
        <path d="M108 110 C104 118, 108 118, 110 113 C112 108, 108 110, 108 110 Z" fill={isColor ? "#688463" : "url(#monochromeGrad)"} />
      </g>

      {/* 4. SEED & BLOSSOM DETAIL IN THE INFINITY CRADLE */}
      {/* Little flower right in the middle crossover (100, 100) */}
      <g transform="translate(100, 100)">
        <circle cx="0" cy="0" r={isColor ? "3" : "4"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} />
        {isColor && (
          <>
            <circle cx="0" cy="-2.5" r="1.6" fill="#ffffff" />
            <circle cx="-2.3" cy="-0.8" r="1.6" fill="#ffffff" />
            <circle cx="-1.4" cy="2" r="1.6" fill="#ffffff" />
            <circle cx="1.4" cy="2" r="1.6" fill="#ffffff" />
            <circle cx="2.3" cy="-0.8" r="1.6" fill="#ffffff" />
            <circle cx="0" cy="0" r="1" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower in left loop peak (70, 80) */}
      <g transform="translate(70, 80)">
        <circle cx="0" cy="0" r={isColor ? "2.5" : "3.5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} />
        {isColor && (
          <>
            <circle cx="0" cy="-2" r="1.3" fill="#ffffff" />
            <circle cx="-1.8" cy="-0.6" r="1.3" fill="#ffffff" />
            <circle cx="-1.1" cy="1.6" r="1.3" fill="#ffffff" />
            <circle cx="1.1" cy="1.6" r="1.3" fill="#ffffff" />
            <circle cx="1.8" cy="-0.6" r="1.3" fill="#ffffff" />
            <circle cx="0" cy="0" r="0.8" fill="#f4ce5a" />
          </>
        )}
      </g>

      {/* Flower in right loop peak (130, 120) */}
      <g transform="translate(130, 120)">
        <circle cx="0" cy="0" r={isColor ? "2.5" : "3.5"} fill={isColor ? "#ffffff" : "url(#monochromeGrad)"} />
        {isColor && (
          <>
            <circle cx="0" cy="-2" r="1.3" fill="#ffffff" />
            <circle cx="-1.8" cy="-0.6" r="1.3" fill="#ffffff" />
            <circle cx="-1.1" cy="1.6" r="1.3" fill="#ffffff" />
            <circle cx="1.1" cy="1.6" r="1.3" fill="#ffffff" />
            <circle cx="1.8" cy="-0.6" r="1.3" fill="#ffffff" />
            <circle cx="0" cy="0" r="0.8" fill="#f4ce5a" />
          </>
        )}
      </g>
    </svg>
  );
};
