import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Vasu Traders',
  description: 'Terms and conditions for wholesale purchases from Vasu Traders. Understand our wholesale ordering process, pricing, and conditions of sale.',
  alternates: { canonical: 'https://www.vasutraders.com/terms-and-conditions' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function TermsPage() {
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
        <span style={{ color: '#374151' }}>Terms &amp; Conditions</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Terms &amp; Conditions
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Last updated: May 2025 &nbsp;·&nbsp; Applies to all wholesale orders
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <PolicySection title="1. About Vasu Traders">
          <p style={bodyText}>
            Vasu Traders is a wholesale supplier based in {address}. We supply products in bulk to
            retailers, shopkeepers, and businesses. This website (vasutraders.com) serves as a product
            catalog and inquiry platform — it is <strong>not a standard retail e-commerce store</strong>.
            All orders are finalised through direct communication (phone/WhatsApp) between the buyer
            and our team.
          </p>
        </PolicySection>

        <PolicySection title="2. Wholesale Business Model">
          <ul style={listStyle}>
            <li style={listItem}>Vasu Traders operates exclusively as a <strong>wholesale (B2B) supplier</strong></li>
            <li style={listItem}>Orders are intended for retailers, shopkeepers, and businesses — not individual consumers</li>
            <li style={listItem}>Minimum order quantities may apply depending on the product category</li>
            <li style={listItem}>Product availability is subject to stock levels at the time of order confirmation</li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Pricing">
          <ul style={listStyle}>
            <li style={listItem}>Prices displayed on this website are <strong>indicative only</strong> and may not reflect current rates</li>
            <li style={listItem}>Actual pricing is confirmed at the time of order discussion based on quantity, market rates, and availability</li>
            <li style={listItem}>Prices may vary depending on order size — larger orders typically attract better rates</li>
            <li style={listItem}>All prices are exclusive of applicable taxes (GST) unless stated otherwise</li>
            <li style={listItem}>Vasu Traders reserves the right to revise prices at any time without prior notice</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Ordering Process">
          <p style={bodyText}>Orders are placed through direct discussion, not through automated checkout. The process is:</p>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Browse the product catalog and identify products of interest',
              'Contact us by phone or WhatsApp with your product list and quantities',
              'We confirm availability, pricing, and shipping details',
              'Both parties agree on terms — price, delivery mode, and payment terms',
              'Payment is arranged as agreed',
              'Goods are dispatched and you are notified with dispatch details',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: '#FEF2F2', border: '2px solid #FECACA', color: '#B91C1C', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6, paddingTop: '2px' }}>{step}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        <PolicySection title="5. Order Confirmation">
          <ul style={listStyle}>
            <li style={listItem}>An order is <strong>confirmed only</strong> after mutual agreement on price, quantity, and payment terms</li>
            <li style={listItem}>Once confirmed and payment is received, the order is considered final</li>
            <li style={listItem}>Vasu Traders reserves the right to reject or cancel an order if products become unavailable</li>
            <li style={listItem}>In such cases, any advance payment received will be refunded in full</li>
          </ul>
        </PolicySection>

        <PolicySection title="6. Payment">
          <ul style={listStyle}>
            <li style={listItem}>Payment terms are agreed upon during the order discussion process</li>
            <li style={listItem}>We accept Bank Transfer (NEFT/RTGS/IMPS), UPI, and Cash (for in-person transactions)</li>
            <li style={listItem}>Advance or partial payment may be required before dispatch for new customers</li>
            <li style={listItem}>Payment confirmation is required before goods are dispatched</li>
          </ul>
        </PolicySection>

        <PolicySection title="7. Delivery & Shipping">
          <p style={bodyText}>
            Shipping terms, timelines, and charges are discussed at the time of order confirmation.
            Please refer to our <Link href="/shipping-policy" style={{ color: '#DC2626', fontWeight: 700 }}>Shipping Policy</Link> for full details.
          </p>
        </PolicySection>

        <PolicySection title="8. Returns & Refunds">
          <p style={bodyText}>
            Products are generally non-returnable. Exceptions apply for wrong products supplied or
            goods damaged in transit. Please refer to our <Link href="/returns-policy" style={{ color: '#DC2626', fontWeight: 700 }}>Return &amp; Refund Policy</Link> for full details.
          </p>
        </PolicySection>

        <PolicySection title="9. Product Information">
          <ul style={listStyle}>
            <li style={listItem}>Product images and descriptions on this website are for reference purposes only</li>
            <li style={listItem}>Actual products may vary slightly in packaging, colour, or design without affecting product quality</li>
            <li style={listItem}>Please confirm specific product requirements with us before ordering</li>
          </ul>
        </PolicySection>

        <PolicySection title="10. Limitation of Liability">
          <ul style={listStyle}>
            <li style={listItem}>Vasu Traders is not liable for any indirect, incidental, or consequential losses arising from the use of our products or services</li>
            <li style={listItem}>Our liability in any case is limited to the value of the goods supplied</li>
            <li style={listItem}>We are not responsible for delays caused by third-party logistics providers</li>
          </ul>
        </PolicySection>

        <PolicySection title="11. Governing Law">
          <p style={bodyText}>
            These terms are governed by the laws of India. Any disputes arising out of transactions
            with Vasu Traders are subject to the exclusive jurisdiction of courts in Indore,
            Madhya Pradesh, India.
          </p>
        </PolicySection>

        <PolicySection title="12. Changes to Terms">
          <p style={bodyText}>
            Vasu Traders reserves the right to update these Terms &amp; Conditions at any time.
            Continued use of this website or placing orders after changes constitutes acceptance
            of the revised terms.
          </p>
        </PolicySection>

        <PolicySection title="13. Contact Us">
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
