'use client'

// Floating playing card suits + product emojis as a subtle crazy background layer
const FLOATERS = [
  // Card suits — big & bold at low opacity
  { symbol: '♠', x: 5,  y: 8,  size: 80,  rot: -15, dur: 9,  delay: 0,   opacity: 0.06, color: '#0f2744' },
  { symbol: '♥', x: 88, y: 5,  size: 100, rot: 12,  dur: 11, delay: 1.5, opacity: 0.07, color: '#FF6B00' },
  { symbol: '♦', x: 50, y: 3,  size: 70,  rot: 20,  dur: 13, delay: 0.8, opacity: 0.05, color: '#dc2626' },
  { symbol: '♣', x: 20, y: 70, size: 90,  rot: -8,  dur: 10, delay: 2,   opacity: 0.06, color: '#0f2744' },
  { symbol: '♠', x: 75, y: 55, size: 60,  rot: 30,  dur: 14, delay: 3,   opacity: 0.05, color: '#1a1a2e' },
  { symbol: '♥', x: 35, y: 85, size: 85,  rot: -20, dur: 12, delay: 1,   opacity: 0.06, color: '#FF6B00' },
  { symbol: '♦', x: 92, y: 75, size: 55,  rot: 10,  dur: 8,  delay: 4,   opacity: 0.05, color: '#dc2626' },
  { symbol: '♣', x: 60, y: 90, size: 75,  rot: -25, dur: 15, delay: 2.5, opacity: 0.06, color: '#0f2744' },
  // Product emojis — sprinkled around
  { symbol: '🎈', x: 10, y: 40, size: 36, rot: 10,  dur: 7,  delay: 0.5, opacity: 0.18, color: '' },
  { symbol: '🎰', x: 80, y: 30, size: 34, rot: -5,  dur: 9,  delay: 1.2, opacity: 0.15, color: '' },
  { symbol: '⚽', x: 45, y: 60, size: 30, rot: 0,   dur: 11, delay: 2.8, opacity: 0.14, color: '' },
  { symbol: '🃏', x: 65, y: 15, size: 38, rot: 15,  dur: 8,  delay: 0.3, opacity: 0.16, color: '' },
  { symbol: '🎈', x: 28, y: 22, size: 28, rot: -10, dur: 10, delay: 3.5, opacity: 0.13, color: '' },
  { symbol: '🧪', x: 95, y: 45, size: 28, rot: 8,   dur: 13, delay: 1.8, opacity: 0.13, color: '' },
  // Extra suits scattered
  { symbol: '♠', x: 55, y: 35, size: 40,  rot: 5,   dur: 16, delay: 5,   opacity: 0.04, color: '#0f2744' },
  { symbol: '♥', x: 15, y: 90, size: 50,  rot: -30, dur: 12, delay: 6,   opacity: 0.05, color: '#FF6B00' },
  { symbol: '♦', x: 72, y: 82, size: 45,  rot: 18,  dur: 10, delay: 4.5, opacity: 0.04, color: '#dc2626' },
]

export default function BackgroundEffect() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Aurora blobs */}
      <div style={{
        position: 'absolute',
        top: '-20%', left: '-10%',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,0,0.07) 0%, transparent 70%)',
        animation: 'blob1 18s ease-in-out infinite',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%', right: '-15%',
        width: '700px', height: '700px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(15,39,68,0.06) 0%, transparent 70%)',
        animation: 'blob2 22s ease-in-out infinite',
        filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%', left: '30%',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,165,0,0.06) 0%, transparent 70%)',
        animation: 'blob3 20s ease-in-out infinite',
        filter: 'blur(45px)',
      }} />

      {/* Floating symbols */}
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${f.x}%`,
            top: `${f.y}%`,
            fontSize: `${f.size}px`,
            opacity: f.opacity,
            color: f.color || undefined,
            transform: `rotate(${f.rot}deg)`,
            animation: `float ${f.dur}s ease-in-out ${f.delay}s infinite`,
            '--rot': `${f.rot}deg`,
            userSelect: 'none',
            lineHeight: 1,
          } as React.CSSProperties}
        >
          {f.symbol}
        </div>
      ))}
    </div>
  )
}
