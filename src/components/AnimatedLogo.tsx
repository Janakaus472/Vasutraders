'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface AnimatedLogoProps {
  size?: number
}

export default function AnimatedLogo({ size = 160 }: AnimatedLogoProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // Stage 1: ring appears (spin in)
    const t1 = setTimeout(() => setStage(1), 100)
    // Stage 2: fully visible, start glow
    const t2 = setTimeout(() => setStage(2), 900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      <style>{`
        @keyframes logoSpinIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(10deg); opacity: 1; }
          80% { transform: scale(0.95) rotate(-3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes logoGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(250,196,26,0.2));
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(250,196,26,0.5)) drop-shadow(0 0 40px rgba(220,38,38,0.2));
          }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animated-logo {
          display: inline-block;
          opacity: 0;
          transform: scale(0) rotate(-180deg);
        }
        .animated-logo.stage-1 {
          animation: logoSpinIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animated-logo.stage-2 {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          animation: logoGlowPulse 3s ease-in-out infinite, logoFloat 4s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`animated-logo ${stage >= 2 ? 'stage-2' : stage >= 1 ? 'stage-1' : ''}`}
        style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden' }}
      >
        <Image
          src="/logo.png"
          alt="Vasu Traders"
          width={size}
          height={size}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
          priority
        />
      </div>
    </>
  )
}
