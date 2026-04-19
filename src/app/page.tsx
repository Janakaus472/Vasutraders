'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BUSINESS_NAME, WHATSAPP_NUMBER } from '@/lib/constants'
import { useLanguage } from '@/context/LanguageContext'
import { getProducts } from '@/lib/supabase/products'
import AnimatedLogo from '@/components/AnimatedLogo'

const CAT_ICONS: Record<string, { emoji: string; color: string; bg: string }> = {
  'Playing Cards':        { emoji: '🃏', color: '#DC2626', bg: '#FEF2F2' },
  'Party Balloons':       { emoji: '🎈', color: '#DC2626', bg: '#FEF2F2' },
  'Kanche & Glass Balls': { emoji: '🔮', color: '#DC2626', bg: '#FEF2F2' },
  'Sports & Games':       { emoji: '🏏', color: '#DC2626', bg: '#FEF2F2' },
  'Rubber Bands':         { emoji: '🔁', color: '#DC2626', bg: '#FEF2F2' },
  'Tapes':                { emoji: '📦', color: '#DC2626', bg: '#FEF2F2' },
  'Poker Chips':          { emoji: '🎰', color: '#DC2626', bg: '#FEF2F2' },
  'Toothbrushes':         { emoji: '🪥', color: '#DC2626', bg: '#FEF2F2' },
  'Boric Acid':           { emoji: '⚗️', color: '#DC2626', bg: '#FEF2F2' },
  'General Goods':        { emoji: '🛍️', color: '#DC2626', bg: '#FEF2F2' },
}
const DEFAULT_ICON = { emoji: '📦', color: '#DC2626', bg: '#FEF2F2' }

export default function HomePage() {
  const { t, catLabel, lang } = useLanguage()
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Vasu Traders! I would like to enquire about wholesale products.')}`

  const [categories, setCategories] = useState<{ name: string; emoji: string; count: number; color: string; bg: string }[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getProducts(false).then(products => {
      const counts: Record<string, number> = {}
      products.forEach(p => { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1 })
      const cats = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
          name,
          count,
          ...(CAT_ICONS[name] || DEFAULT_ICON),
        }))
      setCategories(cats)
      setTotalProducts(products.length)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflowX: 'hidden', width: '100%' }}>
      <style>{`
        .cat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .cat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(127,29,29,0.15);
          border-color: #DC2626 !important;
        }
        .cat-card:active {
          transform: scale(0.97);
        }
        .feature-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1);
        }
      `}</style>

      {/* ── HERO — Bold red banner like tennisdirect ─────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #B91C1C 100%)',
        padding: '56px 20px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          {/* Animated Logo */}
          <div style={{ marginBottom: '16px' }}>
            <AnimatedLogo size={200} />
          </div>

          <div style={{
            display: 'inline-block',
            background: '#FAC41A',
            color: '#7f1d1d',
            fontSize: '11px',
            fontWeight: 800,
            padding: '6px 20px',
            borderRadius: '4px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            {lang === 'hi' ? 'इंदौर का भरोसेमंद थोक विक्रेता' : "INDORE'S TRUSTED WHOLESALER"}
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 64px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.05,
            marginBottom: '16px',
            letterSpacing: '0.02em',
            fontFamily: "'Mandali', sans-serif",
          }}>
            {BUSINESS_NAME}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 'clamp(15px, 3.5vw, 18px)',
            fontWeight: 500,
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '500px',
            margin: '0 auto 32px',
          }}>
            {lang === 'hi'
              ? 'ताश, गुब्बारे, खेल सामग्री और बहुत कुछ — थोक दाम पर'
              : 'Playing cards, balloons, sports goods & more — at wholesale prices'}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalog" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#FAC41A', color: '#7f1d1d',
              padding: '14px 32px', borderRadius: '6px',
              fontWeight: 800, fontSize: '15px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.15s',
            }}>
              {t.homeCta}
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              padding: '14px 32px', borderRadius: '6px',
              fontWeight: 700, fontSize: '15px',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.15s',
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              {t.whatsappUs}
            </a>
          </div>
        </div>
      </section>

      {/* ── QUICK STATS BAR ─────────────────────────────────── */}
      <div style={{
        background: '#fff',
        borderBottom: '3px solid #DC2626',
        padding: '18px 20px',
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(32px, 8vw, 80px)',
        flexWrap: 'wrap',
      }}>
        {[
          { value: loaded ? `${totalProducts}+` : '—', label: lang === 'hi' ? 'उत्पाद' : 'Products' },
          { value: loaded ? `${categories.length}` : '—', label: lang === 'hi' ? 'श्रेणियाँ' : 'Categories' },
          { value: '20+', label: lang === 'hi' ? 'साल का अनुभव' : 'Years' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#B91C1C', lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORIES — clean grid cards ────────────────────── */}
      <section style={{ background: '#f9f9f9', padding: 'clamp(40px, 6vw, 64px) 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 5vw, 36px)',
              fontWeight: 800,
              color: '#1a1a1a',
              marginBottom: '8px',
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '2px',
            }}>
              {lang === 'hi' ? 'श्रेणी के अनुसार खरीदें' : 'Shop by Category'}
            </h2>
            <div style={{ width: '60px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
            <p style={{ fontSize: '15px', color: '#6b7280' }}>
              {lang === 'hi' ? 'जो चाहिए वो चुनें, सीधे ब्राउज़ करें' : 'Tap a category to browse products'}
            </p>
          </div>

          {!loaded ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Loading categories...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 45%), 1fr))',
              gap: 'clamp(12px, 2vw, 20px)',
            }}>
              {categories.map(cat => (
                <Link
                  key={cat.name}
                  href={`/catalog?category=${encodeURIComponent(cat.name)}`}
                  className="cat-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    borderRadius: '12px',
                    padding: 'clamp(24px, 4vw, 36px) 16px',
                    textDecoration: 'none',
                    border: '2px solid #f0f0f0',
                    textAlign: 'center',
                    minHeight: '200px',
                  }}
                >
                  <div style={{
                    fontSize: '60px',
                    lineHeight: 1,
                    marginBottom: '14px',
                  }}>
                    {cat.emoji}
                  </div>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '16px',
                    color: '#1a1a1a',
                    lineHeight: 1.3,
                    marginBottom: '6px',
                  }}>
                    {catLabel(cat.name)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#DC2626',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {cat.count} {lang === 'hi' ? 'उत्पाद' : 'products'}
                  </div>
                </Link>
              ))}

              {/* View All card */}
              <Link
                href="/catalog"
                className="cat-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#B91C1C',
                  borderRadius: '12px',
                  padding: 'clamp(24px, 4vw, 36px) 16px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  minHeight: '200px',
                  border: '2px solid #B91C1C',
                }}
              >
                <div style={{ marginBottom: '14px', color: '#FAC41A' }}>
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', lineHeight: 1.3 }}>
                  {lang === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#FAC41A', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {totalProducts} {lang === 'hi' ? 'उत्पाद' : 'total'}
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY US — feature cards ────────────────────────────── */}
      <section style={{ background: '#fff', padding: 'clamp(40px, 6vw, 64px) 20px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
            <h2 style={{
              fontSize: 'clamp(24px, 5vw, 36px)',
              fontWeight: 800,
              color: '#1a1a1a',
              marginBottom: '8px',
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '2px',
            }}>
              {lang === 'hi' ? 'हमें क्यों चुनें' : 'Why Vasu Traders?'}
            </h2>
            <div style={{ width: '60px', height: '4px', background: '#DC2626', margin: '0 auto', borderRadius: '2px' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: '✅', title: lang === 'hi' ? 'असली उत्पाद' : 'Genuine Products', desc: lang === 'hi' ? 'सिर्फ ब्रांडेड और गुणवत्ता वाले सामान' : 'Only authentic, quality-tested goods' },
              { icon: '💰', title: lang === 'hi' ? 'थोक दाम' : 'Wholesale Prices', desc: lang === 'hi' ? 'बड़े ऑर्डर पर सबसे अच्छे दाम' : 'Best rates for bulk orders' },
              { icon: '🚚', title: lang === 'hi' ? 'पूरे भारत में डिलीवरी' : 'Pan India Delivery', desc: lang === 'hi' ? 'पूरे भारत में भरोसेमंद शिपिंग' : 'Reliable shipping across India' },
            ].map(f => (
              <div key={f.title} className="feature-card" style={{
                padding: '28px 24px',
                background: '#FEF2F2',
                borderRadius: '12px',
                border: '1px solid #FECACA',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
        padding: '56px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 40px)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '12px',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '2px',
          }}>
            {lang === 'hi' ? 'ऑर्डर देने के लिए तैयार?' : 'Ready to Order?'}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '16px',
            marginBottom: '32px',
            fontWeight: 500,
          }}>
            {t.readyDesc}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalog" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#FAC41A', color: '#7f1d1d',
              padding: '14px 32px', borderRadius: '6px',
              fontWeight: 800, fontSize: '15px', textDecoration: 'none',
              textTransform: 'uppercase', letterSpacing: '1px',
            }}>
              {lang === 'hi' ? 'कैटलॉग देखें' : 'Browse Catalog'}
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#25D366', color: '#fff',
              padding: '14px 32px', borderRadius: '6px',
              fontWeight: 800, fontSize: '15px', textDecoration: 'none',
            }}>
              {t.whatsappUs}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER — 4-column like tennisdirect ────────────── */}
      <footer style={{
        background: '#7f1d1d',
        padding: '40px 20px 24px',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
        }}>
          <div>
            <h4 style={{ color: '#FAC41A', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'hi' ? 'श्रेणियाँ' : 'Categories'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.slice(0, 5).map(cat => (
                <Link key={cat.name} href={`/catalog?category=${encodeURIComponent(cat.name)}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s' }}>
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
              <Link href="/catalog" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
                {lang === 'hi' ? 'सभी उत्पाद' : 'All Products'}
              </Link>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
                {lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#FAC41A', fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              {lang === 'hi' ? 'संपर्क' : 'Get in Touch'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                WhatsApp
              </a>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Indore, Madhya Pradesh</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            © 2025 {BUSINESS_NAME} · All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
