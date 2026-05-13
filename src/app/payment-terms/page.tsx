import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Payment Terms | Vasu Traders',
  description: 'Payment terms and conditions for wholesale orders with Vasu Traders. Advance payment, UPI, bank transfer and other accepted payment methods explained.',
  alternates: { canonical: 'https://www.vasutraders.com/payment-terms' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function PaymentTermsPage() {
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
        <span style={{ color: '#374151' }}>Payment Terms</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Payment Terms
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Last updated: May 2025 &nbsp;·&nbsp; Applies to all wholesale orders
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <PolicySection title="Overview">
          <p style={bodyText}>
            Vasu Traders is a wholesale supplier and our payment terms are flexible and are agreed
            upon during the order discussion. Because every order is different — varying in quantity,
            products, and customer relationship — payment terms are finalised on a case-by-case basis
            before order confirmation.
          </p>
        </PolicySection>

        <PolicySection title="Payment Methods Accepted">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '12px', marginTop: '4px' }}>
            {[
              { icon: '🏦', label: 'Bank Transfer', desc: 'NEFT / RTGS / IMPS' },
              { icon: '📱', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm, etc.' },
              { icon: '💵', label: 'Cash', desc: 'In-person at our Indore location' },
              { icon: '🧾', label: 'Cheque', desc: 'For established business accounts (subject to clearance)' },
            ].map(m => (
              <div key={m.label} style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{m.icon}</div>
                <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '14px', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </PolicySection>

        <PolicySection title="Payment Terms by Order Type">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <TermBlock
              title="New Customers"
              color="#FEF2F2"
              borderColor="#FECACA"
              titleColor="#B91C1C"
            >
              Full advance payment is typically required before goods are dispatched.
              This helps us confirm the order and begin packing your goods.
            </TermBlock>
            <TermBlock
              title="Regular / Established Customers"
              color="#F0FDF4"
              borderColor="#BBF7D0"
              titleColor="#166534"
            >
              Flexible payment terms may be available based on order history and relationship.
              Partial advance with balance on delivery, or credit terms may be offered at our discretion.
            </TermBlock>
            <TermBlock
              title="Large Bulk Orders"
              color="#EFF6FF"
              borderColor="#BFDBFE"
              titleColor="#1D4ED8"
            >
              For very large orders, we may agree on a phased payment structure —
              such as 50% advance and 50% before dispatch — to be discussed and confirmed in writing.
            </TermBlock>
          </div>
        </PolicySection>

        <PolicySection title="When Payment is Due">
          <ul style={listStyle}>
            <li style={listItem}>Payment terms are discussed and agreed <strong>before</strong> the order is confirmed</li>
            <li style={listItem}>Goods are dispatched only after the agreed payment (full or partial advance) is received and confirmed</li>
            <li style={listItem}>For cheque payments, dispatch occurs after cheque clearance</li>
            <li style={listItem}>Payment confirmation (screenshot or bank reference) must be shared with us before we begin packing</li>
          </ul>
        </PolicySection>

        <PolicySection title="Taxes & GST">
          <ul style={listStyle}>
            <li style={listItem}>Vasu Traders is a registered business under GST{info.gst_number ? ` (GST: ${info.gst_number})` : ''}</li>
            <li style={listItem}>Applicable GST will be added to the invoice as per the prevailing tax rates</li>
            <li style={listItem}>A GST invoice will be provided for all orders where required</li>
            <li style={listItem}>Please inform us if you require a GST-compliant tax invoice at the time of ordering</li>
          </ul>
        </PolicySection>

        <PolicySection title="Refunds & Failed Payments">
          <ul style={listStyle}>
            <li style={listItem}>If an order is cancelled before dispatch (by either party), any advance payment will be refunded in full</li>
            <li style={listItem}>Refunds are processed via the original payment method within 3–7 business days</li>
            <li style={listItem}>If a cheque bounces, the customer is liable for any bank charges and the order will be placed on hold</li>
            <li style={listItem}>For other refund scenarios, please refer to our <Link href="/returns-policy" style={{ color: '#DC2626', fontWeight: 700 }}>Return &amp; Refund Policy</Link></li>
          </ul>
        </PolicySection>

        <PolicySection title="Contact for Payment Queries">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {phone && <ContactRow label="Phone" value={phone} href={`tel:${phone}`} />}
            {email && <ContactRow label="Email" value={email} href={`mailto:${email}`} />}
            <ContactRow label="Address" value={address} />
          </div>
        </PolicySection>

      </div>

      <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '13px', color: '#9ca3af' }}>
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

function TermBlock({ title, children, color, borderColor, titleColor }: { title: string; children: React.ReactNode; color: string; borderColor: string; titleColor: string }) {
  return (
    <div style={{ padding: '16px 18px', background: color, borderRadius: '10px', border: `1.5px solid ${borderColor}` }}>
      <div style={{ fontWeight: 800, color: titleColor, fontSize: '14px', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{children}</div>
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
