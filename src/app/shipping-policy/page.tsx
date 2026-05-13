import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Shipping Policy | Vasu Traders',
  description: 'Vasu Traders shipping and delivery policy for wholesale orders. Shipping timelines, charges, and transport modes explained.',
  alternates: { canonical: 'https://www.vasutraders.com/shipping-policy' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function ShippingPolicyPage() {
  const storeInfo = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO)
  const info: StoreInfo = { ...DEFAULT_STORE_INFO, ...storeInfo }

  const phone = info.phone || ''
  const email = info.email || ''
  const address = info.address || 'Indore, Madhya Pradesh, India'

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>
        <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#374151' }}>Shipping Policy</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Shipping Policy
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Effective for all wholesale orders &nbsp;·&nbsp; Last updated: May 2025
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <PolicySection title="Overview">
          <p style={bodyText}>
            Vasu Traders is a wholesale supplier based in {address}. We supply to retailers, shopkeepers,
            and businesses across India. Because every wholesale order varies in quantity, destination, and
            customer preferences, shipping terms are finalised on a per-order basis after discussion.
          </p>
        </PolicySection>

        <PolicySection title="Shipping Timelines">
          <ul style={listStyle}>
            <li style={listItem}>Orders are dispatched after payment confirmation and order finalisation</li>
            <li style={listItem}>Typical dispatch timeline is <strong>1–3 business days</strong> from the date of payment, subject to product availability and order size</li>
            <li style={listItem}>Delivery timeline depends on the destination city, transport mode chosen, and logistics partner availability</li>
            <li style={listItem}>Local deliveries within Indore may be arranged separately — timelines will be communicated at the time of order</li>
            <li style={listItem}>We will notify you once your order has been dispatched with transport/tracking details where available</li>
          </ul>
        </PolicySection>

        <PolicySection title="Shipping Charges">
          <ul style={listStyle}>
            <li style={listItem}>Shipping charges are <strong>not included</strong> in the product price unless explicitly stated</li>
            <li style={listItem}>Charges depend on the order quantity, total weight, dimensions, and delivery destination</li>
            <li style={listItem}>The applicable shipping charge will be communicated to you before your order is confirmed</li>
            <li style={listItem}>For very large or bulk orders, freight rates from logistics companies may be used — we will share quotes accordingly</li>
            <li style={listItem}>You are welcome to arrange your own transporter or courier if preferred</li>
          </ul>
        </PolicySection>

        <PolicySection title="Transport Modes">
          <p style={bodyText}>
            We dispatch orders via multiple transport modes depending on your location and preference:
          </p>
          <ul style={listStyle}>
            <li style={listItem}><strong>Road Transport (Tempo/Truck):</strong> Commonly used for large bulk orders to nearby states</li>
            <li style={listItem}><strong>Parcel Services:</strong> Used for medium-sized orders to most cities in India</li>
            <li style={listItem}><strong>Courier:</strong> Used for smaller orders where speed is required</li>
            <li style={listItem}><strong>Customer-Arranged Transport:</strong> If you send your own vehicle or transporter, we will load your goods accordingly</li>
          </ul>
          <p style={{ ...bodyText, marginTop: '12px' }}>
            Please specify your preferred transport mode when discussing your order with us.
          </p>
        </PolicySection>

        <PolicySection title="Delivery Areas">
          <ul style={listStyle}>
            <li style={listItem}>We supply to retailers and businesses across <strong>India</strong></li>
            <li style={listItem}>Regular supply routes to Indore, Ujjain, Bhopal, and Madhya Pradesh</li>
            <li style={listItem}>Pan-India delivery available via parcel and courier services</li>
            <li style={listItem}>International shipping is currently not available</li>
          </ul>
        </PolicySection>

        <PolicySection title="Responsibility After Dispatch">
          <ul style={listStyle}>
            <li style={listItem}>Once goods are handed over to the transporter, transport responsibility transfers to the logistics partner</li>
            <li style={listItem}>Vasu Traders is not liable for delays or losses caused during transit</li>
            <li style={listItem}>Please inspect goods on arrival. Any transit damage must be raised with the transporter immediately</li>
            <li style={listItem}>If goods are visibly damaged on delivery, please report it to us within <strong>48 hours</strong> with photos</li>
          </ul>
        </PolicySection>

        <PolicySection title="Contact for Shipping Queries">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {phone && <ContactRow label="Phone" value={phone} href={`tel:${phone}`} />}
            {email && <ContactRow label="Email" value={email} href={`mailto:${email}`} />}
            <ContactRow label="Address" value={address} />
          </div>
        </PolicySection>

      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '40px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '20px', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>Questions about shipping your order?</h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>Call or WhatsApp us — we will discuss the best shipping option for your order.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {phone && <a href={`tel:${phone}`} style={{ background: '#DC2626', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}>📞 Call Us</a>}
          {email && <a href={`mailto:${email}`} style={{ background: '#fff', color: '#B91C1C', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', border: '2px solid #FECACA' }}>✉️ Email Us</a>}
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#9ca3af' }}>
        Vasu Traders · {address}{info.gst_number ? ` · GST: ${info.gst_number}` : ''}
      </p>
    </div>
  )
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #f3f4f6', borderRadius: '16px', padding: '24px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px', margin: '0 0 12px 0' }}>{title}</h2>
      {children}
    </div>
  )
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span style={{ minWidth: '64px', fontSize: '13px', fontWeight: 700, color: '#B91C1C', paddingTop: '2px' }}>{label}</span>
      {href
        ? <a href={href} style={{ color: '#1a1a1a', fontSize: '15px', textDecoration: 'none', fontWeight: 600 }}>{value}</a>
        : <span style={{ color: '#4b5563', fontSize: '15px' }}>{value}</span>
      }
    </div>
  )
}

const bodyText: React.CSSProperties = { color: '#4b5563', fontSize: '15px', lineHeight: 1.75, margin: 0 }
const listStyle: React.CSSProperties = { margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }
const listItem: React.CSSProperties = { color: '#4b5563', fontSize: '15px', lineHeight: 1.6 }
