'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface AnimatedLogoProps {
  size?: number
}

export default function AnimatedLogo({ size = 200 }: AnimatedLogoProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @keyframes logoSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes logoBob {
          0%, 100% { translate: 0 -1.2%; }
          50% { translate: 0 1.2%; }
        }
        @keyframes logoTilt {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(8deg) rotateX(3deg); }
          50% { transform: rotateY(0deg) rotateX(-2deg); }
          75% { transform: rotateY(-8deg) rotateX(3deg); }
        }
        @keyframes logoHalo {
          0%, 100% { transform: scale(0.96); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes logoGlowPulse {
          0%, 100% {
            box-shadow: 0 0 30px 3px rgba(220,38,38,0.4), 0 0 60px 8px rgba(42,75,160,0.3), inset 0 0 40px rgba(250,196,26,0.15);
          }
          50% {
            box-shadow: 0 0 50px 8px rgba(220,38,38,0.7), 0 0 100px 16px rgba(42,75,160,0.6), inset 0 0 60px rgba(250,196,26,0.25);
          }
        }
        @keyframes logoSweep {
          to { transform: rotate(360deg); }
        }
        @keyframes logoShine {
          0% { transform: translateX(-140%); opacity: 0; }
          15% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateX(140%); opacity: 0; }
        }
        @keyframes logoEntrance {
          0% { transform: scale(0) rotate(-90deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .alogo-wrap {
          position: relative;
          display: inline-block;
          transform-style: preserve-3d;
          opacity: 0;
          transform: scale(0);
        }
        .alogo-wrap.on {
          animation: logoEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .alogo-inner {
          position: relative;
          display: grid;
          place-items: center;
          animation: logoBob 4.2s ease-in-out infinite, logoTilt 9s ease-in-out infinite;
          transform-style: preserve-3d;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));
        }

        /* Halo glow behind */
        .alogo-halo {
          position: absolute;
          inset: -8%;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(220,38,38,0.4), rgba(42,75,160,0.2) 55%, transparent 70%);
          filter: blur(14px);
          animation: logoHalo 3.6s ease-in-out infinite;
        }

        /* Glow ring */
        .alogo-glow-ring {
          position: absolute;
          inset: -2%;
          border-radius: 50%;
          animation: logoGlowPulse 2.4s ease-in-out infinite;
        }

        /* Conic sweep */
        .alogo-sweep {
          position: absolute;
          inset: -10%;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0 70%, rgba(255,255,255,0.4) 78%, transparent 86%);
          filter: blur(2px);
          animation: logoSweep 5s linear infinite;
          mix-blend-mode: screen;
          opacity: 0.7;
        }

        /* Blue ring layer — red center masked out, rotates */
        .alogo-ring-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          -webkit-mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
          mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
          animation: logoSpin 18s linear infinite;
          transform-origin: 50% 50%;
        }

        /* Red center + VT — stays still, blue ring masked out */
        .alogo-core-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          -webkit-mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
          mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
        }

        /* Shimmer overlay */
        .alogo-inner::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.35) 55%, transparent 65%);
          mix-blend-mode: overlay;
          animation: logoShine 3.2s ease-in-out infinite;
          pointer-events: none;
          -webkit-mask: radial-gradient(closest-side, #000 68%, transparent 71%);
          mask: radial-gradient(closest-side, #000 68%, transparent 71%);
        }
      `}</style>

      <div
        className={`alogo-wrap ${animate ? 'on' : ''}`}
        style={{ width: size, height: size }}
      >
        <div className="alogo-halo" />
        <div className="alogo-glow-ring" />
        <div className="alogo-sweep" />

        <div className="alogo-inner" style={{ width: size, height: size, position: 'relative' }}>
          {/* Layer 1: Blue ring only — rotates */}
          <div className="alogo-ring-img">
            <Image src="/logo.png" alt="" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} priority />
          </div>

          {/* Layer 2: Red center + VT — static */}
          <div className="alogo-core-img">
            <Image src="/logo.png" alt="Vasu Traders" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} priority />
          </div>
        </div>
      </div>
    </>
  )
}
