'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface AnimatedLogoProps {
  size?: number
}

export default function AnimatedLogo({ size = 200 }: AnimatedLogoProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100)
    const t2 = setTimeout(() => setStage(2), 900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      <style>{`
        @keyframes logoSpinIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(10deg); opacity: 1; }
          80% { transform: scale(0.96) rotate(-3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes logoInnerIn {
          0%, 30% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes logoRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logoVTShadow {
          0%, 100% {
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(0,0,0,0.2));
          }
          50% {
            filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(250,196,26,0.3));
          }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .logo-wrap {
          position: relative;
          display: inline-block;
          opacity: 0;
          transform: scale(0);
        }
        .logo-wrap.stage-1 {
          animation: logoSpinIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .logo-wrap.stage-2 {
          opacity: 1;
          transform: scale(1);
          animation: logoFloat 4s ease-in-out infinite;
        }

        .logo-ring-layer {
          position: absolute;
          inset: 0;
        }
        .logo-wrap.stage-2 .logo-ring-layer {
          animation: logoRingSpin 20s linear infinite;
        }

        .logo-inner-layer {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(0);
        }
        .logo-wrap.stage-1 .logo-inner-layer {
          animation: logoInnerIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.3s;
        }
        .logo-wrap.stage-2 .logo-inner-layer {
          opacity: 1;
          transform: scale(1);
          animation: logoVTShadow 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`logo-wrap ${stage >= 2 ? 'stage-2' : stage >= 1 ? 'stage-1' : ''}`}
        style={{ width: size, height: size }}
      >
        {/* Outer ring - rotates */}
        <div className="logo-ring-layer">
          <Image
            src="/logo-ring.png"
            alt=""
            width={size}
            height={size}
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Inner VT - stays still with shadow */}
        <div className="logo-inner-layer">
          <Image
            src="/logo-inner.png"
            alt="Vasu Traders"
            width={size}
            height={size}
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
            priority
          />
        </div>
      </div>
    </>
  )
}
