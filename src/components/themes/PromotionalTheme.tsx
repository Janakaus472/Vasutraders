'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { BUSINESS_NAME, WHATSAPP_NUMBER } from '@/lib/constants'
import { useLanguage } from '@/context/LanguageContext'
import { trackWaClick } from '@/lib/trackWaClick'
import { StoreInfo } from '@/types/store-info'
import { PromoThemeConfig } from '@/types/theme'
import { toSlug } from '@/lib/categorySlug'

interface HomeCategoryLayout {
  name: string
  emoji: string
  visible: boolean
  imageUrl?: string
}

interface Props {
  promoConfig: PromoThemeConfig
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

export default function PromotionalTheme({ promoConfig, categories, totalProducts, layout, storeInfo }: Props) {
  const { t, catLabel, lang } = useLanguage()
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Vasu Traders! I would like to enquire about wholesale products.')}`

  const slides = promoConfig.slides || []
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length)
  }, [slides.length])

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  // Reset auto-slide whenever current changes
  useEffect(() => {
    if (!slides.length || !promoConfig.autoSlideInterval) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(goNext, promoConfig.autoSlideInterval * 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [current, slides.length, promoConfig.autoSlideInterval, goNext])

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const delta = touchStart - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) delta > 0 ? goNext() : goPrev()
    setTouchStart(null)
  }

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
        .promo-cat-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .promo-cat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(127,29,29,0.15); border-color: #DC2626 !important; }
        .promo-cat-card:active { transform: scale(0.97); }
        .promo-feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .promo-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .promo-arrow-btn { transition: background 0.15s, transform 0.15s; }
        .promo-arrow-btn:hover { background: rgba(255,255,255,0.35) !important; transform: scale(1.1); }
      `}</style>

      {/* ── PROMOTIONAL SLIDER ── */}
      {slides.length > 0 ? (
        <section style={{ position: 'relative', width: '100%', backgroundColor: '#1a1a1a' }}>
          {/* Slide track */}
          <div
            style={{ overflow: 'hidden', position: 'relative', cursor: slides.length > 1 ? 'grab' : 'default' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{
              display: 'flex',
              transform: `translateX(-${current * 100}%)`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              {slides.map((slide, i) => (
                <div key={slide.id} style={{ flex: '0 0 100%', minWidth: '100%', position: 'relative', minHeight: 'clamp(280px, 50vw, 520px)' }}>
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || `Slide ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 'clamp(280px, 50vw, 520px)' }}
                    />
                  ) : (
                    <div style={{ width: '100%', minHeight: 'clamp(280px, 50vw, 520px)', background: 'linear-gradient(135deg, #7f1d1d, #B91C1C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '64px' }}>🎯</span>
                    </div>
                  )}
                  {/* Overlay for text */}
                  {(slide.title || slide.subtitle || slide.ctaText) && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      padding: 'clamp(20px, 5vw, 48px)',
                    }}>
                      {slide.title && (
                        <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 8px', textShadow: '0 2px 12px rgba(0,0,0,0.5)', fontFamily: "'Mandali', sans-serif" }}>
                          {slide.title}
                        </h2>
                      )}
                      {slide.subtitle && (
                        <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(14px, 3vw, 20px)', fontWeight: 500, margin: '0 0 20px', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.ctaText && (
                        slide.ctaUrl
                          ? <a href={slide.ctaUrl} target={slide.ctaUrl.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FAC41A', color: '#7f1d1d', padding: '12px 28px', borderRadius: '6px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', alignSelf: 'flex-start' }}>
                            {slide.ctaText}
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          </a>
                          : <span style={{ display: 'inline-block', background: '#FAC41A', color: '#7f1d1d', padding: '12px 28px', borderRadius: '6px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>{slide.ctaText}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          {promoConfig.showArrows && slides.length > 1 && (
            <>
              <button onClick={goPrev} className="promo-arrow-btn" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={goNext} className="promo-arrow-btn" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          {/* Dots */}
          {promoConfig.showDots && slides.length > 1 && (
            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === current ? '24px' : '8px', height: '8px',
                    borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: i === current ? '#FAC41A' : 'rgba(255,255,255,0.55)',
                    transition: 'all 0.3s ease', padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Fallback hero when no slides configured */
        <section style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #B91C1C 100%)', padding: '56px 20px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 800, color: '#FAC41A', marginBottom: '12px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '3px' }}>
              {BUSINESS_NAME}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', marginBottom: '28px' }}>
              {lang === 'hi' ? 'थोक दाम पर उत्पाद खरीदें' : 'Wholesale products at the best prices'}
            </p>
            <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FAC41A', color: '#7f1d1d', padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t.homeCta}
            </Link>
          </div>
        </section>
      )}

      {/* ── STATS BAR ── */}
      <div style={{ background: '#fff', borderBottom: '3px solid #DC2626', padding: '18px 20px', display: 'flex', justifyContent: 'center', gap: 'clamp(32px, 8vw, 80px)', flexWrap: 'wrap' }}>
        {[
          { value: `${totalProducts}+`, label: lang === 'hi' ? 'उत्पाद' : 'Products' },
          { value: `${catsWithIcons.length}`, label: lang === 'hi' ? 'श्रेणियाँ' : 'Categories' },
          { value: '20+', label: lang === 'hi' ? 'साल का अनुभव' : 'Years' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#B91C1C', lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>{s.value}</div>
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
            <div style={{ width: '60px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
            <p style={{ fontSize: '15px', color: '#6b7280' }}>
              {lang === 'hi' ? 'जो चाहिए वो चुनें, सीधे ब्राउज़ करें' : 'Tap a category to browse products'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 45%), 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            {catsWithIcons.map(cat => (
              <Link key={cat.name} href={`/catalog/c/${toSlug(cat.name)}`} className="promo-cat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '12px', padding: 'clamp(24px, 4vw, 36px) 16px', textDecoration: 'none', border: '2px solid #f0f0f0', textAlign: 'center', minHeight: '200px' }}>
                {cat.imageUrl
                  ? <img src={cat.imageUrl} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', marginBottom: '14px' }} />
                  : <div style={{ fontSize: '60px', lineHeight: 1, marginBottom: '14px' }}>{cat.emoji}</div>
                }
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', lineHeight: 1.3, marginBottom: '6px' }}>{catLabel(cat.name)}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {cat.count} {lang === 'hi' ? 'उत्पाद' : 'products'}
                </div>
              </Link>
            ))}
            <Link href="/catalog" className="promo-cat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#B91C1C', borderRadius: '12px', padding: 'clamp(24px, 4vw, 36px) 16px', textDecoration: 'none', textAlign: 'center', minHeight: '200px', border: '2px solid #B91C1C' }}>
              <div style={{ marginBottom: '14px', color: '#FAC41A' }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', lineHeight: 1.3 }}>{lang === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FAC41A', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
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
            <div style={{ width: '60px', height: '4px', background: '#DC2626', margin: '0 auto', borderRadius: '2px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: '✅', title: lang === 'hi' ? 'असली उत्पाद' : 'Genuine Products', desc: lang === 'hi' ? 'सिर्फ ब्रांडेड और गुणवत्ता वाले सामान' : 'Only authentic, quality-tested goods' },
              { icon: '💰', title: lang === 'hi' ? 'थोक दाम' : 'Wholesale Prices', desc: lang === 'hi' ? 'बड़े ऑर्डर पर सबसे अच्छे दाम' : 'Best rates for bulk orders' },
              { icon: '🚚', title: lang === 'hi' ? 'पूरे भारत में डिलीवरी' : 'Pan India Delivery', desc: lang === 'hi' ? 'पूरे भारत में भरोसेमंद शिपिंग' : 'Reliable shipping across India' },
            ].map(f => (
              <div key={f.title} className="promo-feature-card" style={{ padding: '28px 24px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA', textAlign: 'center' }}>
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
              <div style={{ width: '60px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {storeInfo?.email && <PromoContactCard icon="✉️" label="Email" value={storeInfo.email} href={`mailto:${storeInfo.email}`} />}
              {storeInfo?.phone && <PromoContactCard icon="📞" label="Phone" value={storeInfo.phone} href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} />}
              {storeInfo?.address && <PromoContactCard icon="📍" label="Address" value={storeInfo.address} href={storeInfo.maps_url || undefined} />}
              {storeInfo?.hours && <PromoContactCard icon="🕐" label="Hours" value={storeInfo.hours} />}
            </div>
            {storeInfo?.maps_url && (
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <a href={storeInfo.maps_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#DC2626', color: '#fff', padding: '13px 28px', borderRadius: '8px', fontWeight: 800, fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Get Directions
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', padding: '56px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: '12px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
            {lang === 'hi' ? 'ऑर्डर देने के लिए तैयार?' : 'Ready to Order?'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '32px', fontWeight: 500 }}>
            {t.readyDesc}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FAC41A', color: '#7f1d1d', padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {lang === 'hi' ? 'कैटलॉग देखें' : 'Browse Catalog'}
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWaClick('Promo Theme')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>
              {t.whatsappUs}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#7f1d1d', padding: '40px 20px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h4 style={{ color: '#FAC41A', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
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
            <h4 style={{ color: '#FAC41A', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'hi' ? 'जानकारी' : 'Information'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/catalog" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>{lang === 'hi' ? 'सभी उत्पाद' : 'All Products'}</Link>
              <Link href="/about" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>{lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</Link>
              <a href="/#contact" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>{lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#FAC41A', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'hi' ? 'संपर्क' : 'Get in Touch'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackWaClick('Promo Theme')} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>WhatsApp</a>
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

function PromoContactCard({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
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
