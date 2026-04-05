'use client'

import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let dotX = 0, dotY = 0
    let ringX = 0, ringY = 0
    let rafId: number

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX
      dotY = e.clientY
    }

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotX}px, ${dotY}px)`
      }
      if (ringRef.current) {
        ringX += (dotX - ringX) * 0.85
        ringY += (dotY - ringY) * 0.85
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`
      }
      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    rafId = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        a, button, [role="button"], input, textarea, select { cursor: none !important; }
      `}</style>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          marginLeft: '2px',
          marginTop: '2px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
          <path d="M4 1L4 15L7.5 11.5L10.5 17L12.5 16L9.5 10L14 10L4 1Z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99998,
        }}
      >
        <svg width="28" height="34" viewBox="0 0 28 34" fill="none" style={{ display: 'block', filter: 'drop-shadow(0 0 6px rgba(255,153,51,0.6)) drop-shadow(0 0 12px rgba(19,136,8,0.4))' }}>
          <defs>
            <linearGradient id="flag" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9933" />
              <stop offset="50%" stopColor="#fff" />
              <stop offset="100%" stopColor="#138808" />
            </linearGradient>
          </defs>
          <path d="M6 1L6 25L11 19L15 29L18.5 27.5L14.5 18L21 18L6 1Z"
            fill="none"
            stroke="url(#flag)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  )
}
