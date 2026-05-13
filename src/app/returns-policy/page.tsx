import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Vasu Traders',
  description: 'Vasu Traders return and refund policy for wholesale orders. Products are generally non-returnable. Exceptions apply for wrong or damaged goods.',
  alternates: { canonical: 'https://www.vasutraders.com/returns-policy' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function ReturnsPolicyPage() {
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
        <span style={{ color: '#374151' }}>Return &amp; Refund Policy</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Return &amp; Refund Policy
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Effective for all wholesale orders &nbsp;·&nbsp; Last updated: May 2025
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <PolicySection title="Overview">
          <p style={bodyText}>
            Vasu Traders is a wholesale supplier based in {address}. We deal in bulk wholesale orders
            for retailers and businesses. Please read this policy carefully before placing your order.
            Due to the nature of wholesale trade, our return and refund policy is limited and applies
            only in specific circumstances described below.
          </p>
        </PolicySection>

        {/* Highlight Box */}
        <div style={{ background: '#FEF3C7', border: '1.5px solid #FDE68A', borderRadius: '14px', padding: '20px 24px', display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '24px', flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 800, color: '#92400E', fontSize: '15px', marginBottom: '6px' }}>General Rule: All Sales Are Final</div>
            <div style={{ color: '#78350F', fontSize: '14px', lineHeight: 1.6 }}>
              As a wholesale business, we generally do not accept returns or process refunds once an order
              is confirmed and dispatched. Please verify your product requirements, quantities, and
              specifications before confirming your order.
            </div>
          </div>
        </div>

        <PolicySection title="Non-Returnable Products">
          <p style={bodyText}>
            The following situations do <strong>not</strong> qualify for return or refund:
          </p>
          <ul style={listStyle}>
            <li style={listItem}>Change of mind after order confirmation</li>
            <li style={listItem}>Ordering wrong quantity — please confirm your requirements before ordering</li>
            <li style={listItem}>Products correctly supplied as per the order specification</li>
            <li style={listItem}>Goods that have been opened, used, or re-packed</li>
            <li style={listItem}>Minor variations in product packaging, colour, or design that do not affect product quality</li>
          </ul>
        </PolicySection>

        <PolicySection title="Exceptions — When Returns May Be Accepted">
          <p style={bodyText}>
            Returns or replacements may be considered <strong>only</strong> in the following exceptional cases:
          </p>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ExceptionCard
              number="1"
              title="Wrong Product Supplied"
              desc="If we have dispatched a different product than what was ordered and agreed upon, we will arrange a replacement or credit note. Please contact us within 48 hours of receiving the goods with proof (photos/invoice)."
            />
            <ExceptionCard
              number="2"
              title="Goods Damaged During Transit"
              desc="If goods arrive in a damaged condition due to transit mishandling, please report it to us within 48 hours of delivery with clear photos of the damaged goods and packaging. We will assess the situation and resolve it appropriately."
            />
          </div>
        </PolicySection>

        <PolicySection title="How to Report an Issue">
          <ul style={listStyle}>
            <li style={listItem}>Contact us by phone or WhatsApp within <strong>48 hours</strong> of receiving the goods</li>
            <li style={listItem}>Provide your order details (invoice number, product names, quantities)</li>
            <li style={listItem}>Share clear photos of the issue (wrong product or damaged packaging/goods)</li>
            <li style={listItem}>Our team will review the issue and respond within 1–2 business days</li>
            <li style={listItem}>Approved cases will be resolved by replacement, credit note, or partial refund at our discretion</li>
          </ul>
        </PolicySection>

        <PolicySection title="Refund Process">
          <ul style={listStyle}>
            <li style={listItem}>Refunds are issued only for approved cases (wrong product or confirmed transit damage)</li>
            <li style={listItem}>Refund method will be the same as the original payment method (bank transfer, UPI, etc.)</li>
            <li style={listItem}>Processing time: <strong>3–7 business days</strong> from approval</li>
            <li style={listItem}>Partial refunds may be issued for partially affected orders</li>
          </ul>
        </PolicySection>

        <PolicySection title="Contact Us for Returns or Issues">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {phone && <ContactRow label="Phone" value={phone} href={`tel:${phone}`} />}
            {email && <ContactRow label="Email" value={email} href={`mailto:${email}`} />}
            <ContactRow label="Address" value={address} />
          </div>
        </PolicySection>

      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '40px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '20px', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
          Have a concern about your order?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
          Contact us immediately — we are here to help resolve genuine issues.
        </p>
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
      <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px 0' }}>{title}</h2>
      {children}
    </div>
  )
}

function ExceptionCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
      <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: '#16A34A', color: '#fff', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 800, color: '#166534', fontSize: '14px', marginBottom: '6px' }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{desc}</div>
      </div>
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
const listStyle: React.CSSProperties = { margin: '8px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }
const listItem: React.CSSProperties = { color: '#4b5563', fontSize: '15px', lineHeight: 1.6 }
