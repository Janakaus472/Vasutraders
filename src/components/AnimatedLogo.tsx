'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface AnimatedLogoProps {
  size?: number
}

export default function AnimatedLogo({ size = 200 }: AnimatedLogoProps) {
  const [entered, setEntered] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Mouse parallax tilt
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current
      if (!el) return
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const S = size * 1.6 // stage size with room for orbits

  return (
    <>
      <style>{`
        @keyframes vtSpin    { to { transform: rotate(360deg) } }
        @keyframes vtSpinRev { to { transform: rotate(-360deg) } }

        @keyframes vtBob {
          0%,100% { translate: 0 -1.2% }
          50%      { translate: 0  1.2% }
        }
        @keyframes vtTilt {
          0%,100% { transform: rotateY(0deg)   rotateX(0deg) }
          25%     { transform: rotateY(10deg)  rotateX(4deg) }
          50%     { transform: rotateY(0deg)   rotateX(-3deg) }
          75%     { transform: rotateY(-10deg) rotateX(4deg) }
        }
        @keyframes vtHalo {
          0%,100% { transform: scale(.96); opacity: .75 }
          50%     { transform: scale(1.08); opacity: 1 }
        }
        @keyframes vtGlow {
          0%,100% { box-shadow:
            0 0 40px 4px rgba(228,58,42,.55),
            0 0 90px 10px rgba(42,75,160,.45),
            inset 0 0 60px rgba(247,201,72,.2); }
          50% { box-shadow:
            0 0 70px 10px rgba(228,58,42,.9),
            0 0 140px 20px rgba(42,75,160,.8),
            inset 0 0 90px rgba(247,201,72,.35); }
        }
        @keyframes vtEntry {
          0%   { transform: scale(0) rotate(-90deg); opacity: 0 }
          60%  { transform: scale(1.08) rotate(5deg); opacity: 1 }
          100% { transform: scale(1) rotate(0deg); opacity: 1 }
        }
        @keyframes vtShine {
          0%   { transform: translateX(-140%); opacity: 0 }
          15%  { opacity: 1 }
          60%  { opacity: 1 }
          100% { transform: translateX(140%); opacity: 0 }
        }

        .vt-stage {
          position: relative;
          display: inline-grid;
          place-items: center;
          opacity: 0;
          transform: scale(0);
          transform-style: preserve-3d;
        }
        .vt-stage.on {
          animation: vtEntry 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }

        /* Halo */
        .vt-halo {
          position: absolute; inset: -8%; border-radius: 50%;
          background: radial-gradient(closest-side, rgba(228,58,42,.55), rgba(42,75,160,.25) 55%, transparent 70%);
          filter: blur(18px);
          animation: vtHalo 3.6s ease-in-out infinite;
          z-index: 0;
        }

        /* Glow ring */
        .vt-glow {
          position: absolute; inset: -3%; border-radius: 50%;
          animation: vtGlow 2.4s ease-in-out infinite;
          z-index: 0;
        }

        /* Conic sweep — beam of light rotating around logo */
        .vt-sweep {
          position: absolute; inset: -12%; border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0 70%, rgba(255,255,255,.55) 78%, transparent 86%);
          filter: blur(2px);
          animation: vtSpin 5s linear infinite;
          mix-blend-mode: screen;
          opacity: .9;
          z-index: 0;
        }

        /* Light rays */
        .vt-rays {
          position: absolute; inset: -25%; border-radius: 50%; z-index: 0;
          background: conic-gradient(from 0deg,
            rgba(247,201,72,0) 0deg,   rgba(247,201,72,.18) 6deg,   rgba(247,201,72,0) 12deg,
            rgba(247,201,72,0) 60deg,  rgba(247,201,72,.18) 66deg,  rgba(247,201,72,0) 72deg,
            rgba(247,201,72,0) 120deg, rgba(247,201,72,.18) 126deg, rgba(247,201,72,0) 132deg,
            rgba(247,201,72,0) 180deg, rgba(247,201,72,.18) 186deg, rgba(247,201,72,0) 192deg,
            rgba(247,201,72,0) 240deg, rgba(247,201,72,.18) 246deg, rgba(247,201,72,0) 252deg,
            rgba(247,201,72,0) 300deg, rgba(247,201,72,.18) 306deg, rgba(247,201,72,0) 312deg,
            rgba(247,201,72,0) 360deg);
          animation: vtSpin 20s linear infinite;
          -webkit-mask: radial-gradient(closest-side, transparent 38%, #000 42%, #000 78%, transparent 82%);
                  mask: radial-gradient(closest-side, transparent 38%, #000 42%, #000 78%, transparent 82%);
          filter: blur(1px);
        }

        /* Orbiting rings */
        .vt-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px dashed rgba(255,255,255,.25);
          animation: vtSpin 18s linear infinite;
        }
        .vt-ring.r2 { inset: -7%;  border-style: dotted; border-color: rgba(247,201,72,.35); animation-duration: 28s; animation-direction: reverse; }
        .vt-ring.r3 { inset: -15%; border: 1px solid rgba(228,58,42,.25); animation-duration: 40s; }
        .vt-ring.r4 { inset: -23%; border: 1px dashed rgba(86,130,255,.25); animation-duration: 55s; animation-direction: reverse; }

        /* Dots on rings */
        .vt-dot {
          position: absolute; width: 10px; height: 10px; border-radius: 50%;
          background: #f7c948; box-shadow: 0 0 14px #f7c948, 0 0 30px #f7c948;
          top: -5px; left: 50%; translate: -50% 0;
        }
        .vt-dot.red   { background: #e43a2a; box-shadow: 0 0 12px #e43a2a, 0 0 28px #e43a2a; }
        .vt-dot.blue  { background: #6ea0ff; box-shadow: 0 0 12px #6ea0ff, 0 0 28px #6ea0ff; }
        .vt-dot.white { background: #fff;    box-shadow: 0 0 12px #fff, 0 0 28px #fff; }

        /* Logo box — bobs + mouse tilt applied via ref */
        .vt-logo-box {
          position: relative; z-index: 5;
          width: 70%; aspect-ratio: 1/1;
          display: grid; place-items: center;
          animation: vtBob 4.2s ease-in-out infinite;
          will-change: transform;
          filter: drop-shadow(0 18px 30px rgba(0,0,0,.6));
          transform-style: preserve-3d;
        }

        /* Ring layer: only outer blue band rotates */
        .vt-logo-ring {
          position: absolute; inset: 0; z-index: 1;
          animation: vtSpin 18s linear infinite;
          -webkit-mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
                  mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
        }

        /* Core layer: red center + VT — static */
        .vt-logo-core {
          position: absolute; inset: 0; z-index: 2;
          -webkit-mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
                  mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
        }

        /* Shimmer sweep across logo */
        .vt-shimmer {
          position: absolute; inset: 0; border-radius: 50%; z-index: 3;
          background: linear-gradient(110deg,
            transparent 35%,
            rgba(255,255,255,.45) 45%,
            rgba(255,255,255,.9) 50%,
            rgba(255,255,255,.45) 55%,
            transparent 65%);
          mix-blend-mode: overlay;
          animation: vtShine 3.2s ease-in-out infinite;
          pointer-events: none;
          -webkit-mask: radial-gradient(closest-side, #000 68%, transparent 71%);
                  mask: radial-gradient(closest-side, #000 68%, transparent 71%);
        }

        /* Orbiting emblems */
        .vt-orbit {
          position: absolute; inset: 0; border-radius: 50%;
          animation: vtSpin 12s linear infinite;
          z-index: 3;
        }
        .vt-orbit.o2 { inset: -10%; animation-duration: 18s; animation-direction: reverse; }
        .vt-orbit.o3 { inset: -20%; animation-duration: 26s; }
        .vt-emblem {
          position: absolute; top: -14px; left: 50%; translate: -50% 0;
          width: 28px; height: 28px; border-radius: 50%;
          display: grid; place-items: center;
          background: radial-gradient(closest-side, #fff, #ffe9a0);
          color: #2a4ba0; font-weight: 900; font-size: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,.4), 0 0 14px rgba(247,201,72,.6);
          animation: vtSpinRev 12s linear infinite;
        }
        .vt-emblem.red  { background: radial-gradient(closest-side, #ff7a6d, #c62a1d); color: #fff; }
        .vt-emblem.blue { background: radial-gradient(closest-side, #6ea0ff, #1e3a85); color: #fff; }
      `}</style>

      <div
        className={`vt-stage${entered ? ' on' : ''}`}
        style={{ width: S, height: S, overflow: 'visible', maxWidth: '90vw', maxHeight: '90vw' }}
      >
        <div className="vt-halo" />
        <div className="vt-glow" />
        <div className="vt-rays" />
        <div className="vt-sweep" />

        {/* Orbiting rings */}
        <div className="vt-ring r4"><div className="vt-dot white" /></div>
        <div className="vt-ring r3"><div className="vt-dot red"  style={{ left: '100%', top: '50%' }} /></div>
        <div className="vt-ring r2">
          <div className="vt-dot blue"  style={{ left: '0%',  top: '50%' }} />
          <div className="vt-dot"       style={{ left: '50%', top: '100%' }} />
        </div>
        <div className="vt-ring"><div className="vt-dot" /></div>

        {/* Logo — parallax tilt via ref, ring spins, core stays still */}
        <div className="vt-logo-box" ref={wrapRef} style={{ transformStyle: 'preserve-3d' }}>
          <div className="vt-logo-ring">
            <Image src="/logo.png" alt="" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden />
          </div>
          <div className="vt-logo-core">
            <Image src="/logo.png" alt="Vasu Traders" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} priority />
          </div>
          <div className="vt-shimmer" />
        </div>

        {/* Orbiting emblems */}
        <div className="vt-orbit o3">
          <div className="vt-emblem red">★</div>
        </div>
        <div className="vt-orbit o2">
          <div className="vt-emblem" style={{ left: '50%', top: 'auto', bottom: '-14px', translate: '-50% 0' }}>♦</div>
        </div>
        <div className="vt-orbit">
          <div className="vt-emblem blue" style={{ left: '-14px', top: '50%', translate: '0 -50%' }}>●</div>
        </div>
      </div>
    </>
  )
}
