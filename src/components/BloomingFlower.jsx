import React, { useState } from 'react';
import { Sparkles, Flower2 } from 'lucide-react';

export const BloomingFlower = () => {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="blooming-flower-container" key={replayKey}>
      <div className="blooming-flower-card">
        {/* Animated Blooming Flower Visual */}
        <div 
          className="blooming-flower-stage"
          onClick={() => setReplayKey(prev => prev + 1)}
          title="Click to replay bloom animation"
        >
          <svg 
            viewBox="0 0 160 160" 
            className="blooming-flower-svg"
            aria-label="Blooming Flower"
          >
            <defs>
              <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2D6A4F" />
                <stop offset="100%" stopColor="#1B4332" />
              </linearGradient>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#52B788" />
                <stop offset="100%" stopColor="#2D6A4F" />
              </linearGradient>
              <linearGradient id="outerPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F4849E" />
                <stop offset="50%" stopColor="#E05780" />
                <stop offset="100%" stopColor="#BD2E58" />
              </linearGradient>
              <linearGradient id="innerPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFCCD5" />
                <stop offset="50%" stopColor="#F4849E" />
                <stop offset="100%" stopColor="#E05780" />
              </linearGradient>
              <linearGradient id="centerPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF0F3" />
                <stop offset="70%" stopColor="#FFB3C1" />
                <stop offset="100%" stopColor="#FF758F" />
              </linearGradient>
              <radialGradient id="goldCoreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF3BF" />
                <stop offset="60%" stopColor="#F59F00" />
                <stop offset="100%" stopColor="#D9480F" />
              </radialGradient>
              <filter id="bloomGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Stem */}
            <path 
              d="M 80 148 Q 78 120 80 96" 
              stroke="url(#stemGrad)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              fill="none" 
              className="bloom-stem"
            />

            {/* Leaves */}
            <path 
              d="M 79 122 Q 52 118 48 132 Q 62 136 79 126" 
              fill="url(#leafGrad)" 
              className="bloom-leaf-left"
            />
            <path 
              d="M 81 114 Q 108 108 112 122 Q 98 128 81 118" 
              fill="url(#leafGrad)" 
              className="bloom-leaf-right"
            />

            {/* Outer Petals Layer (Unfurls First) */}
            <g className="bloom-layer-outer">
              <path d="M 80 80 C 60 50 48 24 80 16 C 112 24 100 50 80 80 Z" fill="url(#outerPetalGrad)" transform="rotate(0 80 80)" />
              <path d="M 80 80 C 60 50 48 24 80 16 C 112 24 100 50 80 80 Z" fill="url(#outerPetalGrad)" transform="rotate(60 80 80)" />
              <path d="M 80 80 C 60 50 48 24 80 16 C 112 24 100 50 80 80 Z" fill="url(#outerPetalGrad)" transform="rotate(120 80 80)" />
              <path d="M 80 80 C 60 50 48 24 80 16 C 112 24 100 50 80 80 Z" fill="url(#outerPetalGrad)" transform="rotate(180 80 80)" />
              <path d="M 80 80 C 60 50 48 24 80 16 C 112 24 100 50 80 80 Z" fill="url(#outerPetalGrad)" transform="rotate(240 80 80)" />
              <path d="M 80 80 C 60 50 48 24 80 16 C 112 24 100 50 80 80 Z" fill="url(#outerPetalGrad)" transform="rotate(300 80 80)" />
            </g>

            {/* Middle Petals Layer */}
            <g className="bloom-layer-mid">
              <path d="M 80 80 C 65 56 56 36 80 30 C 104 36 95 56 80 80 Z" fill="url(#innerPetalGrad)" transform="rotate(30 80 80)" />
              <path d="M 80 80 C 65 56 56 36 80 30 C 104 36 95 56 80 80 Z" fill="url(#innerPetalGrad)" transform="rotate(90 80 80)" />
              <path d="M 80 80 C 65 56 56 36 80 30 C 104 36 95 56 80 80 Z" fill="url(#innerPetalGrad)" transform="rotate(150 80 80)" />
              <path d="M 80 80 C 65 56 56 36 80 30 C 104 36 95 56 80 80 Z" fill="url(#innerPetalGrad)" transform="rotate(210 80 80)" />
              <path d="M 80 80 C 65 56 56 36 80 30 C 104 36 95 56 80 80 Z" fill="url(#innerPetalGrad)" transform="rotate(270 80 80)" />
              <path d="M 80 80 C 65 56 56 36 80 30 C 104 36 95 56 80 80 Z" fill="url(#innerPetalGrad)" transform="rotate(330 80 80)" />
            </g>

            {/* Center Rose Petals Layer */}
            <g className="bloom-layer-inner">
              <circle cx="80" cy="80" r="16" fill="url(#centerPetalGrad)" opacity="0.9" />
              <path d="M 80 80 C 70 65 65 52 80 48 C 95 52 90 65 80 80 Z" fill="url(#centerPetalGrad)" transform="rotate(15 80 80)" />
              <path d="M 80 80 C 70 65 65 52 80 48 C 95 52 90 65 80 80 Z" fill="url(#centerPetalGrad)" transform="rotate(135 80 80)" />
              <path d="M 80 80 C 70 65 65 52 80 48 C 95 52 90 65 80 80 Z" fill="url(#centerPetalGrad)" transform="rotate(255 80 80)" />
            </g>

            {/* Glowing Golden Core */}
            <circle 
              cx="80" 
              cy="80" 
              r="10" 
              fill="url(#goldCoreGrad)" 
              filter="url(#bloomGlow)"
              className="bloom-core"
            />

            {/* Pollen Grains */}
            <g className="bloom-pollen">
              <circle cx="76" cy="76" r="1.5" fill="#FFE066" />
              <circle cx="84" cy="76" r="1.5" fill="#FFE066" />
              <circle cx="76" cy="84" r="1.5" fill="#FFE066" />
              <circle cx="84" cy="84" r="1.5" fill="#FFE066" />
              <circle cx="80" cy="74" r="1.3" fill="#FFF3BF" />
              <circle cx="80" cy="86" r="1.3" fill="#FFF3BF" />
            </g>
          </svg>
        </div>

        {/* Text Details with Golden Accents */}
        <div className="blooming-flower-text-wrap">
          <div className="blooming-flower-badge">
            <Sparkles size={13} style={{ color: '#D4AF37' }} />
            <span>Floora Floral Sanctuary</span>
          </div>
          <h2 className="blooming-flower-title font-serif">
            Fresh Blooms Unfolding Daily
          </h2>
          <p className="blooming-flower-desc">
            Dawn-plucked blossoms opening naturally with organic morning hydration for your loved ones.
          </p>
        </div>
      </div>

      <style>{`
        .blooming-flower-container {
          width: 100%;
          max-width: 1140px;
          margin: 1.5rem auto 2.5rem;
          padding: 0 1.25rem;
        }

        .blooming-flower-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(254, 249, 240, 0.82) 100%);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 24px;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          box-shadow: 0 12px 32px rgba(45, 37, 32, 0.06), 0 2px 8px rgba(212, 175, 55, 0.12);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .blooming-flower-card:hover {
          border-color: #D4AF37;
          box-shadow: 0 16px 36px rgba(212, 175, 55, 0.22);
        }

        .blooming-flower-stage {
          width: 120px;
          height: 120px;
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, rgba(255, 243, 191, 0.35) 0%, rgba(255, 255, 255, 0) 70%);
          border-radius: 50%;
        }

        .blooming-flower-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 6px 14px rgba(224, 87, 128, 0.25));
        }

        /* ================= KEYFRAME ANIMATIONS FOR BLOOMING FLOWER ================= */
        .bloom-stem {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: growStem 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes growStem {
          to { stroke-dashoffset: 0; }
        }

        .bloom-leaf-left {
          transform-origin: 79px 122px;
          animation: unfoldLeaf 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.3s both;
        }

        .bloom-leaf-right {
          transform-origin: 81px 114px;
          animation: unfoldLeaf 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.45s both;
        }

        @keyframes unfoldLeaf {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        /* Outer Layer: Unfurls wide */
        .bloom-layer-outer {
          transform-origin: 80px 80px;
          animation: bloomOuterPetals 2.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        @keyframes bloomOuterPetals {
          0% {
            transform: scale(0.15) rotate(-45deg);
            opacity: 0;
          }
          40% {
            transform: scale(0.6) rotate(-15deg);
            opacity: 0.85;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        /* Middle Layer */
        .bloom-layer-mid {
          transform-origin: 80px 80px;
          animation: bloomMidPetals 2.2s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
        }

        @keyframes bloomMidPetals {
          0% {
            transform: scale(0.2) rotate(35deg);
            opacity: 0;
          }
          50% {
            transform: scale(0.7) rotate(10deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        /* Inner Layer */
        .bloom-layer-inner {
          transform-origin: 80px 80px;
          animation: bloomInnerPetals 2.0s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both;
        }

        @keyframes bloomInnerPetals {
          0% {
            transform: scale(0.25) rotate(-20deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        /* Golden Glowing Core */
        .bloom-core {
          transform-origin: 80px 80px;
          animation: bloomCorePulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both;
        }

        @keyframes bloomCorePulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .bloom-pollen {
          animation: pollenAppear 1s ease-out 1.4s both;
        }

        @keyframes pollenAppear {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Text Wrap */
        .blooming-flower-text-wrap {
          flex: 1;
        }

        .blooming-flower-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.22rem 0.75rem;
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.76rem;
          font-weight: 700;
          color: #8C6208;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 0.5rem;
        }

        .blooming-flower-title {
          font-size: 1.65rem;
          color: var(--text);
          margin-bottom: 0.35rem;
          line-height: 1.25;
        }

        .blooming-flower-desc {
          color: var(--text-muted);
          font-size: 0.92rem;
          line-height: 1.5;
          margin: 0;
          max-width: 620px;
        }

        @media (max-width: 768px) {
          .blooming-flower-card {
            flex-direction: column;
            text-align: center;
            padding: 1.35rem 1.25rem;
            gap: 1rem;
          }
          .blooming-flower-stage {
            width: 100px;
            height: 100px;
          }
          .blooming-flower-title {
            font-size: 1.35rem;
          }
          .blooming-flower-desc {
            font-size: 0.86rem;
          }
        }
      `}</style>
    </div>
  );
};
