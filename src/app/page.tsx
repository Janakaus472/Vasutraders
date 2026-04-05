'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BUSINESS_NAME, WHATSAPP_NUMBER } from '@/lib/constants'
import { useLanguage } from '@/context/LanguageContext'

const FLOATING_HEARTS = ['❤️', '💕', '💖', '💗', '💝', '💘', '✨', '⭐', '🌟', '💫', '🦋', '🌸', '🧡', '🍊']

function HeartAnimation() {
  const [hearts, setHearts] = useState<{id: number, x: number, y: number, size: number, emoji: string, speed: number, wobble: number, opacity: number}[]>([])
  
  useEffect(() => {
    let id = 0
    const initial = Array.from({ length: 12 }, () => ({
      id: id++,
      x: Math.random() * 100,
      y: 50 + Math.random() * 50,
      size: 16 + Math.random() * 24,
      emoji: FLOATING_HEARTS[Math.floor(Math.random() * FLOATING_HEARTS.length)],
      speed: 0.1 + Math.random() * 0.15,
      wobble: Math.random() * 100,
      opacity: 0.3 + Math.random() * 0.4,
    }))
    setHearts(initial)

    const interval = setInterval(() => {
      setHearts(prev => {
        const updated = prev
          .map(h => ({ ...h, y: h.y - h.speed, wobble: h.wobble + 0.5, x: h.x + Math.sin(h.wobble * 0.02) * 0.3 }))
          .filter(h => h.y > -10)
        
        if (updated.length < 15 && Math.random() > 0.6) {
          updated.push({
            id: id++,
            x: Math.random() * 100,
            y: 105,
            size: 16 + Math.random() * 24,
            emoji: FLOATING_HEARTS[Math.floor(Math.random() * FLOATING_HEARTS.length)],
            speed: 0.1 + Math.random() * 0.15,
            wobble: Math.random() * 100,
            opacity: 0.3 + Math.random() * 0.4,
          })
        }
        return updated
      })
    }, 80)

    return () => clearInterval(interval)
  }, [])

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {hearts.map(h => (
        <div key={h.id} style={{
          position: 'absolute',
          left: `${h.x}%`,
          top: `${h.y}%`,
          fontSize: `${h.size}px`,
          opacity: h.opacity,
          userSelect: 'none',
          filter: 'drop-shadow(0 0 10px rgba(255,107,0,0.4))',
          transform: `rotate(${Math.sin(h.wobble) * 15}deg)`,
          transition: 'opacity 0.5s ease',
        }}>
          {h.emoji}
        </div>
      ))}
    </div>
  )
}

function SparkleStars() {
  const [stars, setStars] = useState<{id: number, x: number, y: number, size: number, delay: number}[]>([])
  
  useEffect(() => {
    let id = 0
    const initial = Array.from({ length: 20 }, () => ({
      id: id++,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 8 + Math.random() * 16,
      delay: Math.random() * 3,
    }))
    setStars(initial)
  }, [])

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          fontSize: `${s.size}px`,
          animation: `sparkle 2s ease-in-out ${s.delay}s infinite`,
          userSelect: 'none',
          opacity: 0.6,
        }}>
          ✨
        </div>
      ))}
    </div>
  )
}

const CATEGORIES = [
  { name: 'Playing Cards', emoji: '🃏', count: 22, color: '#FF6B00', bg: '#FFF3E8' },
  { name: 'Party Balloons', emoji: '🎈', count: 8,  color: '#E91E8C', bg: '#FDE8F4' },
  { name: 'Kanche & Glass Balls', emoji: '🔮', count: 9,  color: '#7C3AED', bg: '#F0EBFF' },
  { name: 'Sports & Games', emoji: '🏏', count: 13, color: '#059669', bg: '#E8FAF3' },
  { name: 'Rubber Bands', emoji: '🔁', count: 4,  color: '#DC2626', bg: '#FEE8E8' },
  { name: 'Tapes', emoji: '📦', count: 3,  color: '#0284C7', bg: '#E8F4FD' },
  { name: 'Poker Chips', emoji: '🎰', count: 3,  color: '#B45309', bg: '#FDF3E3' },
  { name: 'Toothbrushes', emoji: '🪥', count: 4,  color: '#0891B2', bg: '#E8F7FA' },
  { name: 'Boric Acid', emoji: '⚗️', count: 2,  color: '#4F7942', bg: '#EEF5ED' },
]

const MARQUEE_ITEMS = [
  'Playing Cards', 'Party Balloons', 'Rubber Bands', 'Carrom Coins',
  'Kanche', 'Tennis Balls', 'Poker Chips', 'Shuttlecocks', 'Tapes',
  'Toothbrushes', 'Boric Acid', 'Glass Balls', 'Cricket Balls', 'Foil Balloons',
]

const STATS = [
  { value: '68+', labelEn: 'Products', labelHi: 'उत्पाद' },
  { value: '9', labelEn: 'Categories', labelHi: 'श्रेणियाँ' },
  { value: '20+', labelEn: 'Years in Business', labelHi: 'साल का अनुभव' },
  { value: '500+', labelEn: 'Happy Customers', labelHi: 'खुश ग्राहक' },
]

export default function HomePage() {
  const { t, catLabel, lang } = useLanguage()
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Vasu Traders! I would like to enquire about wholesale products.')}`

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: 'transparent' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .display-font { font-family: 'Bebas Neue', sans-serif; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 25s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(-4px) rotate(-1deg); }
          50% { transform: translateY(8px) rotate(3deg); }
        }
        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float2 7s ease-in-out infinite 1s; }
        .float-3 { animation: float3 5s ease-in-out infinite 0.5s; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up-1 { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s ease 0.15s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s ease 0.3s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.7s ease 0.45s forwards; opacity: 0; }

        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px -8px rgba(0,0,0,0.15);
        }

        .grain-overlay {
          position: relative;
        }
        .grain-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }

        /* Magical Animations */
        @keyframes glow {
          0% { text-shadow: 0 0 40px rgba(255,107,0,0.5), 0 0 80px rgba(255,107,0,0.3); }
          100% { text-shadow: 0 0 60px rgba(255,107,0,0.7), 0 0 120px rgba(255,107,0,0.5), 0 0 160px rgba(255,107,0,0.3); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }

        @keyframes pulse-heart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes float-heart {
          0% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(10deg); }
          66% { transform: translateY(-8px) rotate(-5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }

        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-pulse-heart {
          animation: pulse-heart 1.5s ease-in-out infinite;
        }

        .animate-float-heart {
          animation: float-heart 3s ease-in-out infinite;
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(150deg, #1a0800 0%, #7c2d12 30%, #c2410c 65%, #fb923c 100%)',
        minHeight: '92vh',
      }}>
        {/* Warm decorative glows */}
        <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(255,200,50,0.18)', filter:'blur(70px)' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-40px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(255,107,0,0.22)', filter:'blur(80px)' }} />
        <div style={{ position:'absolute', top:'35%', left:'25%', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(255,165,0,0.12)', filter:'blur(50px)' }} />

        {/* Floating Hearts Animation */}
        <HeartAnimation />

        {/* Sparkle Stars */}
        <SparkleStars />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <div className="fade-up-1 inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span style={{ color:'#FFA552', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13px', fontWeight:600 }}>
                  Wholesale Supplier · Indore, MP ❤️
                </span>
              </div>

              <h1 className="display-font fade-up-2" style={{
                fontSize: 'clamp(56px, 7vw, 96px)',
                lineHeight: 1.0,
                color: '#FFFFFF',
                letterSpacing: '0.01em',
                marginBottom: '8px',
                textShadow: '0 0 30px rgba(255,107,0,0.3)',
              }}>
                VASU
              </h1>
              <h1 className="display-font fade-up-2" style={{
                fontSize: 'clamp(56px, 7vw, 96px)',
                lineHeight: 1.0,
                color: '#FF6B00',
                letterSpacing: '0.01em',
                marginBottom: '24px',
                textShadow: '0 0 40px rgba(255,107,0,0.5), 0 0 80px rgba(255,107,0,0.3)',
                animation: 'glow 2s ease-in-out infinite alternate',
              }}>
                TRADERS
              </h1>

              <p className="fade-up-3" style={{
                color: '#FED7AA',
                fontSize: '18px',
                lineHeight: 1.7,
                maxWidth: '480px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                marginBottom: '40px',
              }}>
                Your trusted wholesale partner for playing cards, party supplies, sports goods, and more. 💝
                Serving retailers across India for over 20 years with love! 🧡
              </p>

              <div className="fade-up-4 flex flex-wrap gap-4">
                <Link href="/catalog" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: '#FF6B00', color: '#fff',
                  padding: '16px 32px', borderRadius: '12px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(255,107,0,0.4), 0 0 60px rgba(255,107,0,0.2)',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <span style={{ position:'absolute', top:'-50%', left:'-50%', width:'200%', height:'200%', background:'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)', animation:'shine 3s ease-in-out infinite' }} />
                  {t.homeCta} ❤️
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(255,255,255,0.1)', color: '#fff',
                  padding: '16px 28px', borderRadius: '12px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '16px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 0 30px rgba(37,211,102,0.2)',
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  {t.whatsappUs} 💬
                </a>
              </div>
            </div>

            {/* Right — floating category cards */}
            <div className="hidden lg:block relative" style={{ height: '480px' }}>
              {[
                { name:'Playing Cards', emoji:'🃏', color:'#FF6B00', top:'0%',   left:'10%',  rotation:'-4deg',  cls:'float-1' },
                { name:'Party Balloons',emoji:'🎈', color:'#E91E8C', top:'8%',   left:'52%',  rotation:'5deg',   cls:'float-2' },
                { name:'Sports & Games',emoji:'🏏', color:'#059669', top:'40%',  left:'0%',   rotation:'-2deg',  cls:'float-3' },
                { name:'Kanche & Balls',emoji:'🔮', color:'#7C3AED', top:'38%',  left:'50%',  rotation:'4deg',   cls:'float-1' },
                { name:'Rubber Bands',  emoji:'🔁', color:'#DC2626', top:'72%',  left:'18%',  rotation:'-3deg',  cls:'float-2' },
                { name:'Poker Chips',   emoji:'🎰', color:'#B45309', top:'70%',  left:'58%',  rotation:'6deg',   cls:'float-3' },
              ].map((card) => (
                <div key={card.name} className={card.cls} style={{
                  position: 'absolute',
                  top: card.top, left: card.left,
                  transform: `rotate(${card.rotation})`,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  border: `1.5px solid ${card.color}`,
                  borderRadius: '16px',
                  padding: '16px 20px',
                  minWidth: '150px',
                  boxShadow: `0 0 16px ${card.color}66, 0 0 40px ${card.color}33, 0 8px 32px rgba(0,0,0,0.3)`,
                }}>
                  <div style={{ fontSize:'28px', marginBottom:'6px' }}>{card.emoji}</div>
                  <div style={{ color:'#fff', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'13px', whiteSpace:'nowrap' }}>{catLabel(card.name)}</div>
                  <div style={{ width:'24px', height:'3px', borderRadius:'2px', background: card.color, marginTop:'6px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <svg style={{ position:'absolute', bottom:0, left:0, right:0, display:'block' }} viewBox="0 0 1440 60" preserveAspectRatio="none" height="60">
          <path d="M0,60 L0,30 Q360,0 720,30 Q1080,60 1440,20 L1440,60 Z" fill="rgba(255,251,245,0.95)" />
        </svg>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(90deg, #FF6B00, #FF9A3C, #FF6B00)', padding:'14px 0', overflow:'hidden', boxShadow: '0 4px 30px rgba(255,107,0,0.3)' }}>
        <div className="marquee-track" style={{ display:'flex', gap:'0', whiteSpace:'nowrap', width:'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '0 32px',
              color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '18px',
              letterSpacing: '0.1em',
            }}>
              {item}
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px' }}>❤️</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section style={{ background:'rgba(255,248,240,0.35)', borderBottom:'1px solid rgba(255,180,100,0.2)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={s.labelEn} className="text-center" style={{
                animation: `float${(i % 3) + 1} ${4 + i * 0.5}s ease-in-out infinite`,
              }}>
                <div className="display-font" style={{
                  fontSize:'52px', color:'#FF6B00', lineHeight:1,
                  textShadow: '0 0 20px rgba(255,107,0,0.4), 0 0 40px rgba(255,107,0,0.2)',
                }}>{s.value} <span style={{ fontSize:'32px' }}>{['❤️', '🧡', '✨', '💝'][i]}</span></div>
                <div style={{ color:'#6B7280', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:'14px', marginTop:'4px' }}>{lang === 'hi' ? s.labelHi : s.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-12">
          <p style={{ color:'#FF6B00', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'13px', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'12px' }}>
            What We Supply ❤️
          </p>
          <h2 className="display-font" style={{ fontSize:'clamp(40px, 5vw, 64px)', color:'#7c2d12', lineHeight:1.05 }}>
            {lang === 'hi' ? 'श्रेणी के अनुसार' : 'BROWSE BY CATEGORY'}
          </h2>
          <p style={{ color:'#6B7280', fontSize:'16px', marginTop:'8px', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
            Made with love for you 💝
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.name}
              href={`/catalog`}
              className={`animate-popIn`}
              style={{
                display: 'block',
                background: cat.bg,
                borderRadius: '20px',
                padding: '28px 24px',
                textDecoration: 'none',
                border: `2px solid transparent`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
                animationDelay: `${i * 0.1}s`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform     = 'translateY(-8px) scale(1.03)'
                el.style.boxShadow     = `0 0 0 2px ${cat.color}, 0 20px 50px ${cat.color}55, 0 0 30px ${cat.color}33`
                el.style.borderColor   = cat.color
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform     = ''
                el.style.boxShadow     = '0 4px 20px rgba(0,0,0,0.08)'
                el.style.borderColor   = 'transparent'
              }}
            >
              <div style={{ position:'absolute', bottom:'-20px', right:'-20px', fontSize:'80px', opacity:0.12, lineHeight:1 }}>
                {cat.emoji}
              </div>
              <div style={{ fontSize:'36px', marginBottom:'12px', animation: `pulse-heart ${2 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
                {cat.emoji}
              </div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '17px',
                color: '#1a1a1a',
                marginBottom: '6px',
              }}>
                {catLabel(cat.name)}
              </div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 500,
                fontSize: '13px',
                color: cat.color,
              }}>
                {cat.count} products ❤️
              </div>
              <div style={{ marginTop:'16px', width:'32px', height:'3px', borderRadius:'2px', background: cat.color }} />
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/catalog" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            color: '#fff',
            padding: '16px 40px', borderRadius: '12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: '16px',
            textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(255,107,0,0.4), 0 0 60px rgba(255,107,0,0.2)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-4px) scale(1.05)'
            el.style.boxShadow = '0 12px 40px rgba(255,107,0,0.5), 0 0 80px rgba(255,107,0,0.3)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = ''
            el.style.boxShadow = '0 8px 32px rgba(255,107,0,0.4), 0 0 60px rgba(255,107,0,0.2)'
          }}
          >
            View All 68 Products ❤️
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────────────────────────────── */}
      <section style={{ background:'linear-gradient(135deg, rgba(26,8,0,0.75), rgba(124,45,18,0.75))', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', padding:'80px 0', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-100px', right:'-100px', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(255,107,0,0.08)', filter:'blur(80px)' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p style={{ color:'#FF6B00', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'13px', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'16px' }}>
                {t.whyUs}
              </p>
              <h2 className="display-font" style={{ fontSize:'clamp(40px, 5vw, 60px)', color:'#fff', lineHeight:1.05, marginBottom:'24px' }}>
                INDORE'S TRUSTED<br/>WHOLESALE DEALER
              </h2>
              <p style={{ color:'#94BFDD', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'17px', lineHeight:1.8 }}>
                From small retailers to large distributors, we supply quality wholesale goods at competitive prices. Fast delivery, genuine products, and a relationship built on trust.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon:'✅', title:'Genuine Products', desc:'Only authentic brands and quality-tested goods' },
                { icon:'💰', title:'Wholesale Prices', desc:'Best rates for bulk orders, no hidden charges' },
                { icon:'🚚', title:'Pan India Delivery', desc:'We ship to retailers across India reliably' },
                { icon:'📞', title:'WhatsApp Ordering', desc:'Simple ordering directly on WhatsApp' },
              ].map((f) => (
                <div key={f.title} style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,200,100,0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                }}>
                  <div style={{ fontSize:'28px', marginBottom:'10px' }}>{f.icon}</div>
                  <div style={{ color:'#fff', fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:'14px', marginBottom:'6px' }}>{f.title}</div>
                  <div style={{ color:'#7ba8c9', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'13px', lineHeight:1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background:'rgba(255,107,0,0.85)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', padding:'72px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
        <div className="relative z-10">
          <h2 className="display-font" style={{ fontSize:'clamp(40px, 6vw, 72px)', color:'#fff', marginBottom:'16px', lineHeight:1 }}>
            READY TO ORDER?
          </h2>
          <p style={{ color:'rgba(255,255,255,0.85)', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'18px', marginBottom:'36px', fontWeight:500 }}>
            {t.readyDesc}
          </p>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/catalog" style={{
              display:'inline-flex', alignItems:'center', gap:'10px',
              background:'#fff', color:'#FF6B00',
              padding:'16px 36px', borderRadius:'12px',
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              fontWeight:800, fontSize:'16px', textDecoration:'none',
              boxShadow:'0 8px 24px rgba(0,0,0,0.2)',
            }}>
              Browse Catalog
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:'10px',
              background:'#25D366', color:'#fff',
              padding:'16px 36px', borderRadius:'12px',
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              fontWeight:800, fontSize:'16px', textDecoration:'none',
              boxShadow:'0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ background:'rgba(8,15,26,0.9)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', padding:'32px 24px', textAlign:'center' }}>
        <p style={{ color:'#4a6275', fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:'14px' }}>
          © 2025 {BUSINESS_NAME} · Indore, Madhya Pradesh · All rights reserved
        </p>
      </footer>
    </div>
  )
}
