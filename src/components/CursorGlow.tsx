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
        ringX += (dotX - ringX) * 0.15
        ringY += (dotY - ringY) * 0.15
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
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2.5px solid transparent',
          background: 'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #FF9933 0%, #fff 33%, #138808 66%, #FF9933 100%) border-box',
          boxShadow: '0 0 12px rgba(255,153,51,0.5), 0 0 24px rgba(19,136,8,0.3)',
          pointerEvents: 'none',
          zIndex: 99998,
          marginLeft: '-18px',
          marginTop: '-18px',
        }}
      />
    </>
  )
}
