'use client'

import Link from 'next/link'
import { BUSINESS_NAME, WHATSAPP_NUMBER } from '@/lib/constants'
import { useLanguage } from '@/context/LanguageContext'
import { trackWaClick } from '@/lib/trackWaClick'
import AnimatedLogo from '@/components/AnimatedLogo'
import { StoreInfo } from '@/types/store-info'
import { FestivalThemeConfig } from '@/types/theme'
import { toSlug } from '@/lib/categorySlug'

interface HomeCategoryLayout {
  name: string
  emoji: string
  visible: boolean
  imageUrl?: string
}

interface Props {
  festivalConfig: FestivalThemeConfig
  categories: { name: string; count: number }[]
  totalProducts: number
  layout?: HomeCategoryLayout[]
  storeInfo?: StoreInfo
}

const DEFAULT_EMOJIS: Record<string, string> = {
  'Playing Cards': '🃏', 'Party Balloons': '🎈', 'Kanche & Glass Balls': '🔮',
  'Sports & Games': '🏏', 'Rubber Bands': '🔁', 'Tapes': '📦',
  'Poker Chips': '🎰', 'Toothbrushes': '🪥', 'Boric Acid': '⚗️', 'General Goods': '🛍️',
}

// Deterministic decoration positions — same on server & client
const DECO_POSITIONS = [
  { l: 3,  p: 20, d: 0,    s: 10 }, { l: 8,  p: 55, d: 0.3,  s: 8  },
  { l: 15, p: 35, d: 0.6,  s: 12 }, { l: 22, p: 75, d: 0.9,  s: 9  },
  { l: 30, p: 10, d: 1.2,  s: 11 }, { l: 37, p: 50, d: 0.4,  s: 8  },
  { l: 44, p: 25, d: 0.8,  s: 10 }, { l: 51, p: 65, d: 0.2,  s: 13 },
  { l: 58, p: 15, d: 0.6,  s: 9  }, { l: 65, p: 45, d: 1.0,  s: 11 },
  { l: 72, p: 30, d: 0.3,  s: 8  }, { l: 79, p: 70, d: 0.7,  s: 12 },
  { l: 86, p: 20, d: 1.1,  s: 10 }, { l: 92, p: 55, d: 0.5,  s: 9  },
  { l: 97, p: 40, d: 0.9,  s: 11 }, { l: 10, p: 80, d: 0.15, s: 8  },
  { l: 40, p: 85, d: 0.45, s: 12 }, { l: 68, p: 90, d: 0.75, s: 10 },
]
const CONFETTI_COLORS = ['#FF6B00','#FAC41A','#DC2626','#16a34a','#2563eb','#9333ea','#f97316','#0ea5e9']

export default function FestivalTheme({ festivalConfig, categories, totalProducts, layout, storeInfo }: Props) {
  const { t, catLabel, lang } = useLanguage()
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Vasu Traders! I would like to enquire about wholesale products.')}`

  const primary = festivalConfig.primaryColor || '#FF6B00'
  const secondary = festivalConfig.secondaryColor || '#FAC41A'

  const catsWithIcons = (() => {
    const countMap = new Map(categories.map(c => [c.name, c.count]))
    if (layout && layout.length > 0) {
      const layoutMap = new Map(layout.map(l => [l.name, l]))
      const fromLayout = layout
        .filter(l => l.visible && countMap.has(l.name))
        .map(l => ({ name: l.name, count: countMap.get(l.name) || 0, emoji: l.emoji, imageUrl: l.imageUrl }))
      const newCats = categories
        .filter(c => !layoutMap.has(c.name))
        .map(c => ({ name: c.name, count: c.count, emoji: DEFAULT_EMOJIS[c.name] || '📦', imageUrl: undefined }))
      return [...fromLayout, ...newCats]
    }
    return categories.map(c => ({ ...c, emoji: DEFAULT_EMOJIS[c.name] || '📦', imageUrl: undefined }))
  })()

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflowX: 'hidden', width: '100%' }}>
      <style>{`
        @keyframes festFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-18px) scale(1.2); opacity: 1; }
        }
        @keyframes festFall {
          0% { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes festTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes festStar {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg) scale(0.6); }
          20%  { opacity: 0.9; }
          80%  { opacity: 0.9; }
          100% { opacity: 0; transform: translateY(-30px) rotate(180deg) scale(1.2); }
        }
        .fest-cat-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .fest-cat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .fest-cat-card:active { transform: scale(0.97); }
        .fest-feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .fest-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
      `}</style>

      {/* ── FESTIVAL HERO ── */}
      <section style={{
        background: `linear-gradient(135deg, ${primary}ee 0%, ${primary}99 50%, ${secondary}88 100%)`,
        padding: '56px 20px 72px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Subtle pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)', pointerEvents: 'none' }} />

        {/* Decorations */}
        {festivalConfig.showDecorations && festivalConfig.decorationType !== 'none' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {DECO_POSITIONS.map((pos, i) => {
              const delay = `${pos.d}s`
              const dur = `${3 + (i % 3)}s`
              const dt = festivalConfig.decorationType

              // sparkles / diyas (backward-compat alias) — glowing floating orbs
              if (dt === 'sparkles' || dt === 'diyas') {
                const col = i % 2 === 0 ? primary : secondary
                return (
                  <div key={i} style={{
                    position: 'absolute', left: `${pos.l}%`, bottom: `${pos.p}%`,
                    width: pos.s, height: pos.s, borderRadius: '50%',
                    background: col, boxShadow: `0 0 ${pos.s}px ${pos.s / 2}px ${col}`,
                    animation: `festFloat ${dur} ${delay} infinite ease-in-out`, opacity: 0.7,
                  }} />
                )
              }
              if (dt === 'confetti') {
                return (
                  <div key={i} style={{
                    position: 'absolute', left: `${pos.l}%`, top: '-20px',
                    width: 6 + (i % 4) * 2, height: 10 + (i % 3) * 4,
                    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                    borderRadius: '2px', transform: `rotate(${i * 20}deg)`,
                    animation: `festFall ${dur} ${delay} infinite linear`, opacity: 0.85,
                  }} />
                )
              }
              if (dt === 'lights') {
                const col = i % 2 === 0 ? primary : secondary
                return (
                  <div key={i} style={{
                    position: 'absolute', left: `${pos.l}%`, top: `${pos.p}%`,
                    width: pos.s / 2, height: pos.s / 2, borderRadius: '50%',
                    background: col, boxShadow: `0 0 ${pos.s}px ${pos.s}px ${col}55`,
                    animation: `festTwinkle ${dur} ${delay} infinite ease-in-out`,
                  }} />
                )
              }
              if (dt === 'stars') {
                const col = i % 3 === 0 ? primary : i % 3 === 1 ? secondary : '#ffffff'
                return (
                  <div key={i} style={{
                    position: 'absolute', left: `${pos.l}%`, top: `${pos.p}%`,
                    fontSize: `${pos.s + 4}px`, lineHeight: 1, color: col,
                    textShadow: `0 0 ${pos.s}px ${col}`,
                    animation: `festStar ${dur} ${delay} infinite ease-in-out`,
                    userSelect: 'none',
                  }}>★</div>
                )
              }
              return null
            })}
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          {/* Banner or Logo */}
          {festivalConfig.bannerUrl ? (
            <div style={{ marginBottom: '28px' }}>
              <img
                src={festivalConfig.bannerUrl}
                alt="Festival"
                style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '20px', objectFit: 'contain', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
              />
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <AnimatedLogo size={160} />
            </div>
          )}

          {/* Greeting */}
          <h1 style={{
            fontSize: 'clamp(28px, 7vw, 58px)', fontWeight: 800, color: '#fff',
            lineHeight: 1.1, marginBottom: '14px', letterSpacing: '0.01em',
            fontFamily: "'Mandali', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            {festivalConfig.greetingText || BUSINESS_NAME}
          </h1>

          {festivalConfig.subText && (
            <p style={{
              color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(15px, 3.5vw, 20px)',
              fontWeight: 500, lineHeight: 1.55, marginBottom: '32px',
            }}>
              {festivalConfig.subText}
            </p>
          )}

          {!festivalConfig.subText && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 500, lineHeight: 1.6, marginBottom: '32px' }}>
              {lang === 'hi' ? 'ताश, गुब्बारे, खेल सामग्री और बहुत कुछ — थोक दाम पर' : 'Playing cards, balloons, sports goods & more — at wholesale prices'}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: primary, padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              {t.homeCta}
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWaClick('Festival Theme')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '14px 32px', borderRadius: '6px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.5)' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
              {t.whatsappUs}
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#fff', borderBottom: `3px solid ${primary}`, padding: '18px 20px', display: 'flex', justifyContent: 'center', gap: 'clamp(32px, 8vw, 80px)', flexWrap: 'wrap' }}>
        {[
          { value: `${totalProducts}+`, label: lang === 'hi' ? 'उत्पाद' : 'Products' },
          { value: `${catsWithIcons.length}`, label: lang === 'hi' ? 'श्रेणियाँ' : 'Categories' },
          { value: '20+', label: lang === 'hi' ? 'साल का अनुभव' : 'Years' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: primary, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      <section style={{ background: '#f9f9f9', padding: 'clamp(40px, 6vw, 64px) 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
              {lang === 'hi' ? 'श्रेणी के अनुसार खरीदें' : 'Shop by Category'}
            </h2>
            <div style={{ width: '60px', height: '4px', background: primary, margin: '0 auto 12px', borderRadius: '2px' }} />
            <p style={{ fontSize: '15px', color: '#6b7280' }}>
              {lang === 'hi' ? 'जो चाहिए वो चुनें, सीधे ब्राउज़ करें' : 'Tap a category to browse products'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 45%), 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            {catsWithIcons.map(cat => (
              <Link key={cat.name} href={`/catalog/c/${toSlug(cat.name)}`} className="fest-cat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '12px', padding: 'clamp(24px, 4vw, 36px) 16px', textDecoration: 'none', border: '2px solid #f0f0f0', textAlign: 'center', minHeight: '200px' }}>
                {cat.imageUrl
                  ? <img src={cat.imageUrl} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', marginBottom: '14px' }} />
                  : <div style={{ fontSize: '60px', lineHeight: 1, marginBottom: '14px' }}>{cat.emoji}</div>
                }
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', lineHeight: 1.3, marginBottom: '6px' }}>{catLabel(cat.name)}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {cat.count} {lang === 'hi' ? 'उत्पाद' : 'products'}
                </div>
              </Link>
            ))}
            <Link href="/catalog" className="fest-cat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: primary, borderRadius: '12px', padding: 'clamp(24px, 4vw, 36px) 16px', textDecoration: 'none', textAlign: 'center', minHeight: '200px', border: `2px solid ${primary}` }}>
              <div style={{ marginBottom: '14px', color: secondary }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', lineHeight: 1.3 }}>
                {lang === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: secondary, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {totalProducts} {lang === 'hi' ? 'उत्पाद' : 'total'}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ background: '#fff', padding: 'clamp(40px, 6vw, 64px) 20px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
              {lang === 'hi' ? 'हमें क्यों चुनें' : 'Why Vasu Traders?'}
            </h2>
            <div style={{ width: '60px', height: '4px', background: primary, margin: '0 auto', borderRadius: '2px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: '✅', title: lang === 'hi' ? 'असली उत्पाद' : 'Genuine Products', desc: lang === 'hi' ? 'सिर्फ ब्रांडेड और गुणवत्ता वाले सामान' : 'Only authentic, quality-tested goods' },
              { icon: '💰', title: lang === 'hi' ? 'थोक दाम' : 'Wholesale Prices', desc: lang === 'hi' ? 'बड़े ऑर्डर पर सबसे अच्छे दाम' : 'Best rates for bulk orders' },
              { icon: '🚚', title: lang === 'hi' ? 'पूरे भारत में डिलीवरी' : 'Pan India Delivery', desc: lang === 'hi' ? 'पूरे भारत में भरोसेमंद शिपिंग' : 'Reliable shipping across India' },
            ].map(f => (
              <div key={f.title} className="fest-feature-card" style={{ padding: '28px 24px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      {(storeInfo?.email || storeInfo?.phone || storeInfo?.address || storeInfo?.hours) && (
        <section id="contact" style={{ background: '#fff', padding: 'clamp(40px, 6vw, 64px) 20px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
                {lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}
              </h2>
              <div style={{ width: '60px', height: '4px', background: primary, margin: '0 auto 12px', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {storeInfo?.email && <FestContactCard icon="✉️" label={lang === 'hi' ? 'ईमेल' : 'Email'} value={storeInfo.email} href={`mailto:${storeInfo.email}`} />}
              {storeInfo?.phone && <FestContactCard icon="📞" label={lang === 'hi' ? 'फोन' : 'Phone'} value={storeInfo.phone} href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} />}
              {storeInfo?.address && <FestContactCard icon="📍" label={lang === 'hi' ? 'पता' : 'Address'} value={lang === 'hi' ? (storeInfo.address_hi || storeInfo.address) : storeInfo.address} href={storeInfo.maps_url || undefined} />}
              {storeInfo?.hours && <FestContactCard icon="🕐" label={lang === 'hi' ? 'समय' : 'Business Hours'} value={lang === 'hi' ? (storeInfo.hours_hi || storeInfo.hours) : storeInfo.hours} />}
            </div>
            {storeInfo?.maps_url && (
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <a href={storeInfo.maps_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: primary, color: '#fff', padding: '13px 28px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {lang === 'hi' ? 'Google Maps पर देखें' : 'Get Directions'}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section style={{ background: `linear-gradient(135deg, ${primary}ee, ${primary}bb)`, padding: '56px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: '12px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
            {lang === 'hi' ? 'ऑर्डर देने के लिए तैयार?' : 'Ready to Order?'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '32px', fontWeight: 500 }}>
            {t.readyDesc}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: primary, padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {lang === 'hi' ? 'कैटलॉग देखें' : 'Browse Catalog'}
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWaClick('Festival Theme')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>
              {t.whatsappUs}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a1a1a', padding: '40px 20px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h4 style={{ color: secondary, fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'hi' ? 'श्रेणियाँ' : 'Categories'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {catsWithIcons.map(cat => (
                <Link key={cat.name} href={`/catalog/c/${toSlug(cat.name)}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
                  {catLabel(cat.name)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: secondary, fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'hi' ? 'जानकारी' : 'Information'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/catalog" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>{lang === 'hi' ? 'सभी उत्पाद' : 'All Products'}</Link>
              <Link href="/about" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>{lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</Link>
              <a href="/#contact" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>{lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: secondary, fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'hi' ? 'संपर्क' : 'Get in Touch'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWaClick('Festival Theme')} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                WhatsApp
              </a>
              {storeInfo?.email && <a href={`mailto:${storeInfo.email}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>✉️ {storeInfo.email}</a>}
              {storeInfo?.phone && <a href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>📞 {storeInfo.phone}</a>}
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{storeInfo?.address || 'Indore, Madhya Pradesh'}</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>© {new Date().getFullYear()} {BUSINESS_NAME} · All Rights Reserved</p>
        </div>
      </footer>
    </div>
  )
}

function FestContactCard({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const inner = (
    <div style={{ padding: '22px 20px', background: '#FEF2F2', borderRadius: '14px', border: '1px solid #FECACA', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '28px', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</span>
      {href && <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>↗</span>}
    </div>
  )
  if (href) return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>{inner}</a>
  return <div>{inner}</div>
}
