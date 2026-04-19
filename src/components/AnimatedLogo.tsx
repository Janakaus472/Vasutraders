'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface AnimatedLogoProps {
  size?: number
}

export default function AnimatedLogo({ size = 200 }: AnimatedLogoProps) {
  const [animate, setAnimate] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Mouse parallax
  useEffect(() => {
    const hasFine = window.matchMedia('(pointer: fine)').matches
    if (!hasFine) return

    const handler = (e: MouseEvent) => {
      if (!wrapRef.current) return
      const x = (e.clientX / innerWidth - 0.5)
      const y = (e.clientY / innerHeight - 0.5)
      wrapRef.current.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`
    }
    document.addEventListener('mousemove', handler)
    return () => document.removeEventListener('mousemove', handler)
  }, [])

  return (
    <>
      <style>{`
        @keyframes vtSpin { to { transform: rotate(360deg) } }
        @keyframes vtBob {
          0%, 100% { translate: 0 -1.2%; }
          50% { translate: 0 1.2%; }
        }
        @keyframes vtTilt {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(10deg) rotateX(4deg); }
          50% { transform: rotateY(0deg) rotateX(-3deg); }
          75% { transform: rotateY(-10deg) rotateX(4deg); }
        }
        @keyframes vtHalo {
          0%, 100% { transform: scale(0.96); opacity: 0.75; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes vtGlow {
          0%, 100% { box-shadow: 0 0 40px 4px rgba(228,58,42,0.55), 0 0 90px 10px rgba(42,75,160,0.45), inset 0 0 60px rgba(247,201,72,0.2); }
          50% { box-shadow: 0 0 70px 10px rgba(228,58,42,0.9), 0 0 140px 20px rgba(42,75,160,0.8), inset 0 0 90px rgba(247,201,72,0.35); }
        }
        @keyframes vtEntry {
          0% { transform: scale(0) rotate(-90deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .vt-stage {
          position: relative;
          display: inline-grid;
          place-items: center;
          opacity: 0;
          transform: scale(0);
        }
        .vt-stage.on {
          animation: vtEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Halo behind logo */
        .vt-halo {
          position: absolute;
          inset: -8%;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(228,58,42,0.55), rgba(42,75,160,0.25) 55%, transparent 70%);
          filter: blur(18px);
          animation: vtHalo 3.6s ease-in-out infinite;
          z-index: 0;
        }

        /* Glow ring */
        .vt-glow-ring {
          position: absolute;
          inset: -3%;
          border-radius: 50%;
          animation: vtGlow 2.4s ease-in-out infinite;
          z-index: 0;
        }

        /* Orbiting rings */
        .vt-orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px dashed rgba(255,255,255,0.25);
          animation: vtSpin 18s linear infinite;
        }
        .vt-orbit-ring.r2 {
          inset: -7%;
          border-style: dotted;
          border-color: rgba(247,201,72,0.35);
          animation-duration: 28s;
          animation-direction: reverse;
        }
        .vt-orbit-ring.r3 {
          inset: -15%;
          border: 1px solid rgba(228,58,42,0.25);
          animation-duration: 40s;
        }
        .vt-orbit-ring.r4 {
          inset: -23%;
          border: 1px dashed rgba(86,130,255,0.25);
          animation-duration: 55s;
          animation-direction: reverse;
        }

        /* Dots on orbits */
        .vt-dot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f7c948;
          box-shadow: 0 0 14px #f7c948, 0 0 30px #f7c948;
          top: -5px;
          left: 50%;
          translate: -50% 0;
        }
        .vt-dot.red {
          background: #e43a2a;
          box-shadow: 0 0 12px #e43a2a, 0 0 28px #e43a2a;
        }
        .vt-dot.blue {
          background: #6ea0ff;
          box-shadow: 0 0 12px #6ea0ff, 0 0 28px #6ea0ff;
        }
        .vt-dot.white {
          background: #fff;
          box-shadow: 0 0 12px #fff, 0 0 28px #fff;
        }

        /* The logo container */
        .vt-logo-box {
          position: relative;
          z-index: 5;
          width: 70%;
          aspect-ratio: 1/1;
          display: grid;
          place-items: center;
          animation: vtBob 4.2s ease-in-out infinite, vtTilt 9s ease-in-out infinite;
          transform-style: preserve-3d;
          will-change: transform;
          filter: drop-shadow(0 18px 30px rgba(0,0,0,0.6));
        }

        /* Ring layer — outer blue ring rotates */
        .vt-logo-ring {
          position: absolute;
          inset: 0;
          animation: vtSpin 18s linear infinite;
          transform-origin: 50% 50%;
          -webkit-mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
          mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
        }

        /* Core layer — red center + VT stays still */
        .vt-logo-core {
          position: absolute;
          inset: 0;
          -webkit-mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
          mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
        }

        /* Orbiting emblems */
        .vt-emblem-orbit {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: vtSpin 12s linear infinite;
          z-index: 3;
        }
        .vt-emblem-orbit.eo2 {
          inset: -10%;
          animation-duration: 18s;
          animation-direction: reverse;
        }
        .vt-emblem-orbit.eo3 {
          inset: -20%;
          animation-duration: 26s;
        }
        .vt-emblem {
          position: absolute;
          top: -14px;
          left: 50%;
          translate: -50% 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: radial-gradient(closest-side, #fff, #ffe9a0);
          color: #2a4ba0;
          font-weight: 900;
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 14px rgba(247,201,72,0.6);
          animation: vtSpin 12s linear infinite reverse;
        }
        .vt-emblem.red {
          background: radial-gradient(closest-side, #ff7a6d, #c62a1d);
          color: #fff;
        }
        .vt-emblem.blue {
          background: radial-gradient(closest-side, #6ea0ff, #1e3a85);
          color: #fff;
        }
      `}</style>

      <div
        className={`vt-stage ${animate ? 'on' : ''}`}
        style={{ width: size * 1.5, height: size * 1.5, overflow: 'visible', maxWidth: '90vw', maxHeight: '90vw' }}
      >
        {/* Halo & glow */}
        <div className="vt-halo" />
        <div className="vt-glow-ring" />

        {/* Orbiting rings with dots */}
        <div className="vt-orbit-ring r4"><div className="vt-dot white" /></div>
        <div className="vt-orbit-ring r3"><div className="vt-dot red" style={{ left: '100%', top: '50%' }} /></div>
        <div className="vt-orbit-ring r2">
          <div className="vt-dot blue" style={{ left: '0%', top: '50%' }} />
          <div className="vt-dot" style={{ left: '50%', top: '100%' }} />
        </div>
        <div className="vt-orbit-ring"><div className="vt-dot" /></div>

        {/* The logo — split into rotating ring + static core */}
        <div ref={wrapRef} className="vt-logo-box" style={{ transformStyle: 'preserve-3d' }}>
          <div className="vt-logo-ring">
            <Image src="/logo.png" alt="" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} priority />
          </div>
          <div className="vt-logo-core">
            <Image src="/logo.png" alt="Vasu Traders" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} priority />
          </div>
        </div>

        {/* Orbiting emblems */}
        <div className="vt-emblem-orbit eo3">
          <div className="vt-emblem red">★</div>
        </div>
        <div className="vt-emblem-orbit eo2">
          <div className="vt-emblem" style={{ left: '50%', top: 'auto', bottom: '-14px', translate: '-50% 0' }}>♦</div>
        </div>
        <div className="vt-emblem-orbit">
          <div className="vt-emblem blue" style={{ left: '-14px', top: '50%', translate: '0 -50%' }}>●</div>
        </div>
      </div>
    </>
  )
}
