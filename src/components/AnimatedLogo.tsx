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
        @keyframes aSpin { to { transform: rotate(360deg); } }
        @keyframes aBob {
          0%, 100% { translate: 0 -1.2%; }
          50% { translate: 0 1.2%; }
        }
        @keyframes aTilt {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(8deg) rotateX(3deg); }
          75% { transform: rotateY(-8deg) rotateX(3deg); }
        }
        @keyframes aHalo {
          0%, 100% { transform: scale(0.96); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes aGlow {
          0%, 100% { box-shadow: 0 0 30px 3px rgba(220,38,38,0.4), 0 0 60px 8px rgba(42,75,160,0.3); }
          50% { box-shadow: 0 0 50px 8px rgba(220,38,38,0.7), 0 0 100px 16px rgba(42,75,160,0.6); }
        }
        @keyframes aShine {
          0% { transform: translateX(-140%); opacity: 0; }
          15% { opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateX(140%); opacity: 0; }
        }
        @keyframes aEntry {
          0% { transform: scale(0) rotate(-90deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .al-wrap {
          position: relative;
          display: inline-block;
          transform-style: preserve-3d;
          opacity: 0;
          transform: scale(0);
        }
        .al-wrap.on {
          animation: aEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .al-logo {
          position: relative;
          display: grid;
          place-items: center;
          animation: aBob 4.2s ease-in-out infinite, aTilt 9s ease-in-out infinite;
          transform-style: preserve-3d;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,0.4));
        }
        .al-halo {
          position: absolute;
          inset: -8%;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(220,38,38,0.4), rgba(42,75,160,0.2) 55%, transparent 70%);
          filter: blur(14px);
          animation: aHalo 3.6s ease-in-out infinite;
        }
        .al-glow {
          position: absolute;
          inset: -2%;
          border-radius: 50%;
          animation: aGlow 2.4s ease-in-out infinite;
        }
        .al-sweep {
          position: absolute;
          inset: -10%;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0 70%, rgba(255,255,255,0.4) 78%, transparent 86%);
          filter: blur(2px);
          animation: aSpin 5s linear infinite;
          mix-blend-mode: screen;
          opacity: 0.7;
        }
        .al-ring {
          position: absolute;
          inset: 0;
          -webkit-mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
          mask: radial-gradient(circle at 50% 50%, transparent 0 36%, #000 37.5% 100%);
          animation: aSpin 18s linear infinite;
          transform-origin: 50% 50%;
        }
        .al-core {
          position: absolute;
          inset: 0;
          -webkit-mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
          mask: radial-gradient(circle at 50% 50%, #000 0 36%, transparent 37.5% 100%);
        }
        .al-logo::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.35) 55%, transparent 65%);
          mix-blend-mode: overlay;
          animation: aShine 3.2s ease-in-out infinite;
          pointer-events: none;
          -webkit-mask: radial-gradient(closest-side, #000 68%, transparent 71%);
          mask: radial-gradient(closest-side, #000 68%, transparent 71%);
        }
      `}</style>

      <div className={`al-wrap ${animate ? 'on' : ''}`} style={{ width: size, height: size }}>
        <div className="al-halo" />
        <div className="al-glow" />
        <div className="al-sweep" />
        <div className="al-logo" style={{ width: size, height: size, position: 'relative' }}>
          <div className="al-ring">
            <Image src="/logo.png" alt="" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} priority />
          </div>
          <div className="al-core">
            <Image src="/logo.png" alt="Vasu Traders" width={size} height={size} style={{ width: '100%', height: '100%', display: 'block' }} priority />
          </div>
        </div>
      </div>
    </>
  )
}
