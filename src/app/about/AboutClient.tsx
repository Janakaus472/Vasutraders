'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { StoreInfo } from '@/app/api/admin/store-info/route'

export default function AboutClient({ storeInfo }: { storeInfo: StoreInfo }) {
  const { lang } = useLanguage()
  const yearsInBusiness = storeInfo?.established_year
    ? `${new Date().getFullYear() - Number(storeInfo.established_year)}+`
    : '20+'

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>
        <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#374151' }}>{lang === 'hi' ? 'हमारे बारे में' : 'About Us'}</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          {lang === 'hi' ? 'हमारे बारे में' : 'About Vasu Traders'}
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto', borderRadius: '2px' }} />
      </div>

      {/* Text content */}
      <div style={{ maxWidth: '720px', margin: '0 auto 40px', textAlign: 'center' }}>
        {(storeInfo?.about_text_1 || storeInfo?.about_text_1_hi) && (
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.85, marginBottom: '16px' }}>
            {lang === 'hi'
              ? (storeInfo?.about_text_1_hi || storeInfo?.about_text_1 || '')
              : (storeInfo?.about_text_1 || '')}
          </p>
        )}
        {(storeInfo?.about_text_2 || storeInfo?.about_text_2_hi) && (
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.85 }}>
            {lang === 'hi'
              ? (storeInfo?.about_text_2_hi || storeInfo?.about_text_2 || '')
              : (storeInfo?.about_text_2 || '')}
          </p>
        )}
      </div>

      {/* Trust badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
        {[
          { icon: '📍', text: lang === 'hi' ? (storeInfo?.address_hi || 'इंदौर, मध्य प्रदेश') : (storeInfo?.address || 'Indore, Madhya Pradesh') },
          { icon: '🏪', text: lang === 'hi' ? `${yearsInBusiness} वर्ष का अनुभव` : `${yearsInBusiness} Years in Business` },
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
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '28px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1.5px' }}>
            {lang === 'hi' ? 'हमारी टीम' : 'Meet Our Team'}
          </h2>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

      {/* CTA */}
      <div style={{ textAlign: 'center', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '20px', padding: '36px 24px' }}>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '10px' }}>
          {lang === 'hi' ? 'थोक ऑर्डर के लिए संपर्क करें' : 'Ready to place a wholesale order?'}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px' }}>
          {lang === 'hi' ? 'हमारे उत्पाद देखें और ऑर्डर दें' : 'Browse our full catalog and get in touch'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/catalog" style={{ background: '#DC2626', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}>
            {lang === 'hi' ? '📦 उत्पाद देखें' : '📦 Browse Products'}
          </Link>
          {storeInfo?.phone && (
            <a href={`tel:${storeInfo.phone}`} style={{ background: '#fff', color: '#B91C1C', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', border: '2px solid #FECACA' }}>
              📞 {storeInfo.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
