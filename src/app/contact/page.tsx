import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'
import { WHATSAPP_NUMBER } from '@/lib/constants'
import WhatsAppTrackLink from '@/components/WhatsAppTrackLink'

export const metadata: Metadata = {
  title: { absolute: 'Contact Us | Vasu Traders' },
  description: 'Contact Vasu Traders for wholesale inquiries. Call, WhatsApp, or email us. Based in Indore, Madhya Pradesh — serving retailers across India.',
  alternates: { canonical: 'https://www.vasutraders.com/contact' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function ContactPage() {
  const storeInfo = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO)
  const info: StoreInfo = { ...DEFAULT_STORE_INFO, ...storeInfo }

  const phone = info.phone || ''
  const email = info.email || ''
  const address = info.address || 'Indore, Madhya Pradesh, India'
  const hours = info.hours || 'Mon – Sat: 10:00 AM – 7:00 PM'
  const waUrl = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Vasu Traders! I would like to enquire about wholesale products.')}`
    : null

  const contactItems = [
    ...(phone ? [{ icon: '📞', label: 'Phone / Call', value: phone, href: `tel:${phone.replace(/\s/g, '')}`, desc: 'Call us directly for quick assistance' }] : []),
    ...(waUrl ? [{ icon: '💬', label: 'WhatsApp', value: 'Chat on WhatsApp', href: waUrl, desc: 'Send us a WhatsApp message anytime', external: true }] : []),
    ...(email ? [{ icon: '✉️', label: 'Email', value: email, href: `mailto:${email}`, desc: 'Email us for formal inquiries or quotes' }] : []),
    { icon: '📍', label: 'Address', value: address, href: info.maps_url || undefined, desc: 'Our warehouse & office location', external: !!info.maps_url },
    { icon: '🕐', label: 'Business Hours', value: hours, desc: 'When we are available to take orders' },
    ...(info.gst_number ? [{ icon: '🏛️', label: 'GST Number', value: info.gst_number, desc: 'Registered business under GST' }] : []),
  ]

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>
        <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#374151' }}>Contact Us</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Contact Us
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
          We are a wholesale business. Get in touch for pricing, availability, or bulk order inquiries.
          Our team is happy to discuss your requirements.
        </p>
      </div>

      {/* Wholesale Note */}
      <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '14px', padding: '18px 20px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 800, color: '#92400E', fontSize: '14px', marginBottom: '4px' }}>Wholesale Inquiries Only</div>
          <div style={{ color: '#78350F', fontSize: '14px', lineHeight: 1.6 }}>
            Vasu Traders is a B2B wholesale supplier. We supply to retailers, shopkeepers, and businesses.
            Pricing and availability is discussed over call or WhatsApp before order confirmation.
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '16px', marginBottom: '40px' }}>
        {contactItems.map(item => {
          const inner = (
            <div style={{ padding: '22px 20px', background: '#fff', borderRadius: '14px', border: '1.5px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '1.5px' }}>{item.label}</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, wordBreak: 'break-word' as const }}>{item.value}</span>
              <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</span>
            </div>
          )
          if (item.href) {
            if (item.label === 'WhatsApp') {
              return (
                <WhatsAppTrackLink key={item.label} href={item.href} source="Contact Page" style={{ textDecoration: 'none', display: 'block' }}>
                  {inner}
                </WhatsAppTrackLink>
              )
            }
            return (
              <a key={item.label} href={item.href} target={item.external ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                {inner}
              </a>
            )
          }
          return <div key={item.label}>{inner}</div>
        })}
      </div>

      {/* How to Order Section */}
      <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '16px', padding: '28px 24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a', marginBottom: '16px' }}>
          How to Place a Wholesale Order
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { step: '1', text: 'Browse our product catalog and note the items you need' },
            { step: '2', text: 'Call or WhatsApp us with your product list and quantity requirements' },
            { step: '3', text: 'We confirm availability and share pricing based on your order size' },
            { step: '4', text: 'Agree on shipping mode, delivery timeline, and payment terms' },
            { step: '5', text: 'Confirm the order and arrange payment as discussed' },
            { step: '6', text: 'We pack and dispatch your order — and notify you when shipped' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '28px', height: '28px', borderRadius: '50%', background: '#DC2626', color: '#fff', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.step}
              </div>
              <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, paddingTop: '4px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div style={{ textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/catalog" style={{ background: '#DC2626', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}>
          📦 Browse Products
        </Link>
        {phone && (
          <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ background: '#fff', color: '#B91C1C', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', border: '2px solid #FECACA' }}>
            📞 Call Now
          </a>
        )}
        {waUrl && (
          <WhatsAppTrackLink href={waUrl} source="Contact Page CTA" style={{ background: '#25D366', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}>
            💬 WhatsApp
          </WhatsAppTrackLink>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '13px', color: '#9ca3af' }}>
        Vasu Traders · {address}{info.gst_number ? ` · GST: ${info.gst_number}` : ''}
      </p>
    </div>
  )
}
