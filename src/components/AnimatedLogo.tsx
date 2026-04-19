'use client'

import { useEffect, useState } from 'react'

interface AnimatedLogoProps {
  size?: number
}

export default function AnimatedLogo({ size = 160 }: AnimatedLogoProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <style>{`
        @keyframes logoRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logoRingIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes logoCircleIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(0); opacity: 0; }
          80% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes logoVIn {
          0%, 40% { transform: translateX(-30px) rotate(-15deg); opacity: 0; }
          70% { transform: translateX(3px) rotate(2deg); opacity: 1; }
          100% { transform: translateX(0) rotate(0deg); opacity: 1; }
        }
        @keyframes logoTIn {
          0%, 50% { transform: translateX(30px) rotate(15deg); opacity: 0; }
          80% { transform: translateX(-3px) rotate(-2deg); opacity: 1; }
          100% { transform: translateX(0) rotate(0deg); opacity: 1; }
        }
        @keyframes logoTextSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(250,196,26,0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(250,196,26,0.6)); }
        }
        .logo-container {
          position: relative;
          display: inline-block;
        }
        .logo-container.animate .logo-glow {
          animation: logoGlow 3s ease-in-out infinite 1.5s;
        }
        .logo-container.animate .logo-ring {
          animation: logoRingIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .logo-container.animate .logo-circle {
          animation: logoCircleIn 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .logo-container.animate .logo-v {
          animation: logoVIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .logo-container.animate .logo-t {
          animation: logoTIn 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .logo-container.animate .logo-text-ring {
          animation: logoTextSpin 30s linear infinite 1.2s;
        }
      `}</style>

      <div className={`logo-container ${animate ? 'animate' : ''}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className="logo-glow"
        >
          {/* Blue outer ring */}
          <g className="logo-ring" style={{ transformOrigin: '100px 100px', opacity: 0 }}>
            <circle cx="100" cy="100" r="96" fill="#2B5EA7" />
            <circle cx="100" cy="100" r="72" fill="none" stroke="#2B5EA7" strokeWidth="0" />
          </g>

          {/* Red inner circle */}
          <g className="logo-circle" style={{ transformOrigin: '100px 100px', opacity: 0 }}>
            <circle cx="100" cy="100" r="70" fill="#C41E2A" />
          </g>

          {/* Rotating text around the ring */}
          <g className="logo-text-ring" style={{ transformOrigin: '100px 100px' }}>
            <defs>
              <path
                id="textCircle"
                d="M 100, 100 m -82, 0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0"
              />
            </defs>
            <text
              fill="#fff"
              fontSize="11"
              fontWeight="700"
              fontFamily="'Plus Jakarta Sans', sans-serif"
              letterSpacing="2.5"
            >
              <textPath href="#textCircle" startOffset="0%">
                Wholesalers and Distributors · Playing Cards · Rubber Band · Sports Goods · General ·
              </textPath>
            </text>
          </g>

          {/* V letter */}
          <g className="logo-v" style={{ transformOrigin: '85px 110px', opacity: 0 }}>
            <text
              x="58"
              y="132"
              fill="#fff"
              fontSize="80"
              fontWeight="900"
              fontFamily="'Bebas Neue', Impact, sans-serif"
              letterSpacing="-2"
            >
              V
            </text>
          </g>

          {/* T letter */}
          <g className="logo-t" style={{ transformOrigin: '115px 110px', opacity: 0 }}>
            <text
              x="97"
              y="132"
              fill="#fff"
              fontSize="80"
              fontWeight="900"
              fontFamily="'Bebas Neue', Impact, sans-serif"
              letterSpacing="-2"
            >
              T
            </text>
          </g>
        </svg>
      </div>
    </>
  )
}
