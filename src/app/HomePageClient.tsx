'use client'

import Link from 'next/link'
import { BUSINESS_NAME, WHATSAPP_NUMBER } from '@/lib/constants'
import { useLanguage } from '@/context/LanguageContext'
import AnimatedLogo from '@/components/AnimatedLogo'
import { StoreInfo } from './api/admin/store-info/route'

const DEFAULT_EMOJIS: Record<string, string> = {
  'Playing Cards':        '🃏',
  'Party Balloons':       '🎈',
  'Kanche & Glass Balls': '🔮',
  'Sports & Games':       '🏏',
  'Rubber Bands':         '🔁',
  'Tapes':                '📦',
  'Poker Chips':          '🎰',
  'Toothbrushes':         '🪥',
  'Boric Acid':           '⚗️',
  'General Goods':        '🛍️',
}

interface HomeCategoryLayout {
  name: string
  emoji: string
  visible: boolean
  imageUrl?: string
}

interface Props {
  categories: { name: string; count: number }[]
  totalProducts: number
  layout?: HomeCategoryLayout[]
  storeInfo?: StoreInfo
}

export default function HomePageClient({ categories, totalProducts, layout, storeInfo }: Props) {
  const { t, catLabel, lang } = useLanguage()
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Vasu Traders! I would like to enquire about wholesale products.')}`

  // Build ordered, filtered category list from layout config (if available)
  const catsWithIcons = (() => {
    if (layout && layout.length > 0) {
      const countMap = new Map(categories.map(c => [c.name, c.count]))
      return layout
        .filter(l => l.visible && countMap.has(l.name))
        .map(l => ({ name: l.name, count: countMap.get(l.name) || 0, emoji: l.emoji, imageUrl: l.imageUrl, color: '#DC2626', bg: '#FEF2F2' }))
    }
    return categories.map(c => ({
      ...c,
      emoji: DEFAULT_EMOJIS[c.name] || '📦',
      color: '#DC2626',
      bg: '#FEF2F2',
    }))
  })()

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
        .cat-card:active { transform: scale(0.97); }
        .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #B91C1C 100%)',
        padding: '56px 20px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <AnimatedLogo size={200} />
          </div>
          <div style={{ display: 'inline-block', background: '#FAC41A', color: '#7f1d1d', fontSize: '11px', fontWeight: 800, padding: '6px 20px', borderRadius: '4px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
            {lang === 'hi' ? 'मध्य भारत का भरोसेमंद थोक विक्रेता' : "CENTRAL INDIA'S TRUSTED WHOLESALERS"}
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, color: '#fff', lineHeight: 1.05, marginBottom: '16px', letterSpacing: '0.02em', fontFamily: "'Mandali', sans-serif" }}>
            {BUSINESS_NAME}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 500, lineHeight: 1.6, marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            {lang === 'hi'
              ? 'ताश, गुब्बारे, खेल सामग्री और बहुत कुछ — थोक दाम पर'
              : 'Playing cards, balloons, sports goods & more — at wholesale prices'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FAC41A', color: '#7f1d1d', padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.15s' }}>
              {t.homeCta}
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '14px 32px', borderRadius: '6px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)', transition: 'all 0.15s' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              {t.whatsappUs}
            </a>
          </div>
        </div>
      </section>

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

      {/* ── ABOUT ── */}
      <section id="about" style={{ background: '#fff', padding: 'clamp(40px, 6vw, 64px) 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
              {lang === 'hi' ? 'हमारे बारे में' : 'About Vasu Traders'}
            </h2>
            <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto', borderRadius: '2px' }} />
          </div>

          {/* Text content */}
          <div style={{ maxWidth: '720px', margin: '0 auto 36px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.85, marginBottom: '14px' }}>
              {lang === 'hi'
                ? (storeInfo?.about_text_1_hi || storeInfo?.about_text_1 || '')
                : (storeInfo?.about_text_1 || '')}
            </p>
            {(storeInfo?.about_text_2 || storeInfo?.about_text_2_hi) && (
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.85 }}>
                {lang === 'hi'
                  ? (storeInfo?.about_text_2_hi || storeInfo?.about_text_2 || '')
                  : (storeInfo?.about_text_2 || '')}
              </p>
            )}
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: storeInfo?.team?.length ? '48px' : '0' }}>
            {[
              { icon: '📍', text: lang === 'hi' ? (storeInfo?.address_hi || 'इंदौर, मध्य प्रदेश') : (storeInfo?.address || 'Indore, Madhya Pradesh') },
              { icon: '🏪', text: lang === 'hi' ? `${storeInfo?.established_year ? `${new Date().getFullYear() - Number(storeInfo.established_year)}+` : '20+'} वर्ष का अनुभव` : `${storeInfo?.established_year ? `${new Date().getFullYear() - Number(storeInfo.established_year)}+` : '20+'} Years in Business` },
              { icon: '🚚', text: lang === 'hi' ? 'पूरे भारत में डिलीवरी' : 'Pan India Supply' },
              ...(storeInfo?.gst_number ? [{ icon: '✅', text: `GST: ${storeInfo.gst_number}` }] : []),
            ].map(item => (
              <span key={item.text} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF2F2', color: '#B91C1C', fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '20px', border: '1px solid #FECACA' }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>

          {/* Team photos */}
          {storeInfo?.team && storeInfo.team.length > 0 && (
            <div>
              <h3 style={{ textAlign: 'center', fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '24px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1.5px' }}>
                {lang === 'hi' ? 'हमारी टीम' : 'Meet Our Team'}
              </h3>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {storeInfo.team.map(member => (
                  <div key={member.id} style={{ textAlign: 'center', width: '130px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #FECACA', background: '#FEF2F2', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {member.imageUrl
                        ? <img src={member.imageUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '40px' }}>👤</span>
                      }
                    </div>
                    {member.name && <div style={{ fontWeight: 800, fontSize: '14px', color: '#1a1a1a', lineHeight: 1.2, marginBottom: '3px' }}>{member.name}</div>}
                    {member.role && <div style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 700 }}>{member.role}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

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
              <Link key={cat.name} href={`/catalog?category=${encodeURIComponent(cat.name)}`} className="cat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: '12px', padding: 'clamp(24px, 4vw, 36px) 16px', textDecoration: 'none', border: '2px solid #f0f0f0', textAlign: 'center', minHeight: '200px' }}>
                {(cat as any).imageUrl
                  ? <img src={(cat as any).imageUrl} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', marginBottom: '14px' }} />
                  : <div style={{ fontSize: '60px', lineHeight: 1, marginBottom: '14px' }}>{cat.emoji}</div>
                }
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', lineHeight: 1.3, marginBottom: '6px' }}>{catLabel(cat.name)}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {cat.count} {lang === 'hi' ? 'उत्पाद' : 'products'}
                </div>
              </Link>
            ))}
            <Link href="/catalog" className="cat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#B91C1C', borderRadius: '12px', padding: 'clamp(24px, 4vw, 36px) 16px', textDecoration: 'none', textAlign: 'center', minHeight: '200px', border: '2px solid #B91C1C' }}>
              <div style={{ marginBottom: '14px', color: '#FAC41A' }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff', lineHeight: 1.3 }}>
                {lang === 'hi' ? 'सभी उत्पाद देखें' : 'View All Products'}
              </div>
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
              <div key={f.title} className="feature-card" style={{ padding: '28px 24px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1a1a1a', marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT US ── */}
      {(storeInfo?.email || storeInfo?.phone || storeInfo?.address || storeInfo?.maps_url || storeInfo?.hours) && (
        <section id="contact" style={{ background: '#fff', padding: 'clamp(40px, 6vw, 64px) 20px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
                {lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}
              </h2>
              <div style={{ width: '60px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
              <p style={{ fontSize: '15px', color: '#6b7280' }}>
                {lang === 'hi' ? 'हमसे जुड़ें — हम यहाँ हैं' : 'We\'d love to hear from you'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {storeInfo?.email && (
                <ContactCard
                  icon="✉️"
                  label={lang === 'hi' ? 'ईमेल' : 'Email'}
                  value={storeInfo.email}
                  href={`mailto:${storeInfo.email}`}
                />
              )}
              {storeInfo?.phone && (
                <ContactCard
                  icon="📞"
                  label={lang === 'hi' ? 'फोन' : 'Phone'}
                  value={storeInfo.phone}
                  href={`tel:${storeInfo.phone.replace(/\s/g, '')}`}
                />
              )}
              {storeInfo?.address && (
                <ContactCard
                  icon="📍"
                  label={lang === 'hi' ? 'पता' : 'Address'}
                  value={lang === 'hi' ? (storeInfo.address_hi || storeInfo.address) : storeInfo.address}
                  href={storeInfo.maps_url || undefined}
                />
              )}
              {storeInfo?.hours && (
                <ContactCard
                  icon="🕐"
                  label={lang === 'hi' ? 'समय' : 'Business Hours'}
                  value={lang === 'hi' ? (storeInfo.hours_hi || storeInfo.hours) : storeInfo.hours}
                />
              )}
            </div>

            {storeInfo?.maps_url && (
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <a
                  href={storeInfo.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    background: '#DC2626', color: '#fff',
                    padding: '13px 28px', borderRadius: '8px',
                    fontWeight: 800, fontSize: '14px', textDecoration: 'none',
                    textTransform: 'uppercase', letterSpacing: '1px',
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {lang === 'hi' ? 'Google Maps पर देखें' : 'Get Directions'}
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
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '14px 32px', borderRadius: '6px', fontWeight: 800, fontSize: '15px', textDecoration: 'none' }}>
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
                <Link key={cat.name} href={`/catalog?category=${encodeURIComponent(cat.name)}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
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
              <Link href="#about" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
                {lang === 'hi' ? 'हमारे बारे में' : 'About Us'}
              </Link>
              <Link href="#contact" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
                {lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}
              </Link>
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
              {storeInfo?.email && (
                <a href={`mailto:${storeInfo.email}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
                  ✉️ {storeInfo.email}
                </a>
              )}
              {storeInfo?.phone && (
                <a href={`tel:${storeInfo.phone.replace(/\s/g, '')}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>
                  📞 {storeInfo.phone}
                </a>
              )}
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                {storeInfo?.address || 'Indore, Madhya Pradesh'}
              </span>
              {storeInfo?.gst_number && (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                  GST: {storeInfo.gst_number}
                </span>
              )}
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

function ContactCard({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const inner = (
    <div style={{
      padding: '22px 20px', background: '#FEF2F2', borderRadius: '14px',
      border: '1px solid #FECACA', textAlign: 'center', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    }}>
      <span style={{ fontSize: '28px', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</span>
      {href && <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>↗</span>}
    </div>
  )

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </a>
    )
  }
  return <div>{inner}</div>
}
