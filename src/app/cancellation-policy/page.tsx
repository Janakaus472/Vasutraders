import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Cancellation Policy | Vasu Traders',
  description: 'Order cancellation policy for Vasu Traders wholesale orders. Learn when and how orders can be cancelled before dispatch.',
  alternates: { canonical: 'https://www.vasutraders.com/cancellation-policy' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function CancellationPolicyPage() {
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
        <span style={{ color: '#374151' }}>Cancellation Policy</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Cancellation Policy
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Last updated: May 2025 &nbsp;·&nbsp; Applies to all wholesale orders
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <PolicySection title="Overview">
          <p style={bodyText}>
            At Vasu Traders, orders are finalised through direct communication and confirmed only after
            mutual agreement on pricing, quantity, and payment. Because our orders are prepared and
            dispatched manually, cancellation requests must be made at the earliest opportunity —
            ideally before we begin packing the goods.
          </p>
        </PolicySection>

        {/* Status Timeline */}
        <PolicySection title="Cancellation Window by Order Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            <StatusCard
              status="Order Discussed — Not Yet Confirmed"
              icon="💬"
              cancellable={true}
              desc="You can freely withdraw from an order at this stage. No payment has been made and no obligation exists."
            />
            <StatusCard
              status="Order Confirmed — Payment Pending"
              icon="✅"
              cancellable={true}
              desc="You may cancel before making payment. Simply inform us and the order will be closed with no charge."
            />
            <StatusCard
              status="Payment Received — Not Yet Packed"
              icon="💳"
              cancellable={true}
              desc="Cancellation is possible at this stage. Contact us immediately. Full refund will be processed within 3–7 business days."
            />
            <StatusCard
              status="Packing In Progress"
              icon="📦"
              cancellable={false}
              desc="Cancellation may not be possible once packing has started. Contact us immediately — we will do our best to accommodate, but cancellation cannot be guaranteed."
            />
            <StatusCard
              status="Goods Dispatched"
              icon="🚚"
              cancellable={false}
              desc="Orders cannot be cancelled after dispatch. Goods are in transit. Please refer to our Return Policy for post-delivery issues."
            />
          </div>
        </PolicySection>

        <PolicySection title="How to Cancel an Order">
          <ul style={listStyle}>
            <li style={listItem}>Contact us immediately via phone or WhatsApp — this is the fastest way to stop an order in progress</li>
            <li style={listItem}>State your order details clearly: product names, quantities, and the date of order discussion</li>
            <li style={listItem}>If payment was already made, provide your payment reference number for the refund process</li>
            <li style={listItem}>We will confirm whether the cancellation can be accepted based on the current order status</li>
          </ul>
        </PolicySection>

        <PolicySection title="Cancellation by Vasu Traders">
          <p style={bodyText}>
            We reserve the right to cancel an order in the following situations:
          </p>
          <ul style={listStyle}>
            <li style={listItem}>Product is out of stock at the time of fulfilment</li>
            <li style={listItem}>Significant price changes due to market fluctuations (customer will be informed and given the option to proceed at new rate)</li>
            <li style={listItem}>Payment is not received within the agreed timeframe</li>
            <li style={listItem}>Any circumstances beyond our control (force majeure)</li>
          </ul>
          <p style={{ ...bodyText, marginTop: '12px' }}>
            In all cases where we cancel an order, any advance payment received will be <strong>refunded in full</strong> within 3–7 business days.
          </p>
        </PolicySection>

        <PolicySection title="Refunds on Cancellation">
          <ul style={listStyle}>
            <li style={listItem}>If a cancellation is approved before dispatch, we will refund the full amount paid</li>
            <li style={listItem}>Refund will be processed to the original payment method (bank transfer, UPI, etc.)</li>
            <li style={listItem}>Processing time: <strong>3–7 business days</strong> from the date of cancellation approval</li>
            <li style={listItem}>Please share your bank details or UPI ID if you need the refund sent to a different account</li>
          </ul>
        </PolicySection>

        <PolicySection title="Contact Us to Cancel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {phone && <ContactRow label="Phone" value={phone} href={`tel:${phone}`} />}
            {email && <ContactRow label="Email" value={email} href={`mailto:${email}`} />}
            <ContactRow label="Address" value={address} />
          </div>
          <p style={{ ...bodyText, marginTop: '14px', color: '#B91C1C', fontWeight: 700 }}>
            Please contact us as soon as possible — the earlier you inform us, the easier it is to cancel.
          </p>
        </PolicySection>

      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '20px', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
          Need to cancel or modify an order?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
          Contact us immediately — we will do our best to help.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {phone && <a href={`tel:${phone}`} style={{ background: '#DC2626', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}>📞 Call Us Now</a>}
          <Link href="/contact" style={{ background: '#fff', color: '#B91C1C', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', border: '2px solid #FECACA' }}>
            📋 All Contact Options
          </Link>
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

function StatusCard({ status, icon, cancellable, desc }: { status: string; icon: string; cancellable: boolean; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: cancellable ? '#F0FDF4' : '#FEF2F2', borderRadius: '10px', border: `1.5px solid ${cancellable ? '#BBF7D0' : '#FECACA'}` }}>
      <span style={{ fontSize: '22px', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' as const }}>
          <span style={{ fontWeight: 800, color: '#1a1a1a', fontSize: '14px' }}>{status}</span>
          <span style={{ fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: cancellable ? '#16A34A' : '#DC2626', color: '#fff' }}>
            {cancellable ? 'CANCELLABLE' : 'NOT CANCELLABLE'}
          </span>
        </div>
        <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>{desc}</div>
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
