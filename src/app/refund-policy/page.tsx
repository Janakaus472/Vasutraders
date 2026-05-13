import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Order & Delivery Policy | Vasu Traders',
  description: 'Vasu Traders order and delivery policy. All sales are final. Once payment is received, goods are dispatched via your requested transport mode. Delivery charges may apply.',
  alternates: { canonical: 'https://www.vasutraders.com/refund-policy' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function RefundPolicyPage() {
  const storeInfo = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO)
  const info: StoreInfo = { ...DEFAULT_STORE_INFO, ...storeInfo }

  const phone = info.phone || '+91-XXXXXXXXXX'
  const email = info.email || 'vasutraders@gmail.com'
  const address = info.address || 'Indore, Madhya Pradesh, India'
  const hours = info.hours || 'Mon – Sat: 10:00 AM – 7:00 PM'

  const sections = [
    {
      title: 'Overview',
      content: `Vasu Traders is a wholesale supplier based in ${address}. We deal in bulk wholesale orders for retailers and businesses. Please read this policy carefully before placing your order, as all sales are final once payment is received.`,
    },
    {
      title: 'No Return Policy',
      content: 'All products sold by Vasu Traders are non-returnable. Once payment is received and the order is confirmed, the goods are prepared and dispatched to the customer. We do not accept returns or exchanges under any circumstances. We encourage all buyers to verify product requirements, quantities, and specifications before placing an order.',
    },
    {
      title: 'Order Confirmation & Dispatch',
      items: [
        'An order is confirmed only upon receipt of full payment',
        'Once payment is received, goods will be packed and dispatched at the earliest',
        'You will be notified when your order has been dispatched',
        'Products are transported via the mode requested by the customer at the time of ordering',
        'If no transport mode is specified, we will dispatch via a suitable carrier at our discretion',
      ],
    },
    {
      title: 'Delivery Charges',
      items: [
        'Delivery charges are not included in the product price unless explicitly stated',
        'Delivery charges are calculated based on the quantity ordered, weight, and destination',
        'Higher quantity orders may attract higher delivery charges',
        'The applicable delivery charge will be communicated to you before dispatch',
        'For local deliveries within Indore, delivery terms will be discussed separately',
      ],
    },
    {
      title: 'Transport Mode',
      content: 'Customers can specify their preferred transport mode (e.g. road transport, courier, parcel service) at the time of placing the order. We will do our best to dispatch via the requested mode. Any additional cost arising from the chosen transport mode will be borne by the customer.',
    },
    {
      title: 'Responsibility After Dispatch',
      items: [
        'Once goods are handed over to the transporter or courier, responsibility for safe delivery rests with the transport provider',
        'Vasu Traders is not liable for delays, damage, or loss caused during transit',
        'Customers are advised to inspect goods upon receipt and raise any transit damage claims directly with the transporter',
      ],
    },
    {
      title: 'Contact Us',
      isContact: true,
      phone,
      email,
      address,
      hours,
    },
  ]

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>
        <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#374151' }}>Order &amp; Delivery Policy</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Order &amp; Delivery Policy
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Effective for all orders &nbsp;·&nbsp; Last updated: May 2025
        </p>
      </div>

      {/* Policy sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sections.map((section) => (
          <div key={section.title} style={{ background: '#fff', border: '1.5px solid #f3f4f6', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px' }}>
              {section.title}
            </h2>

            {'content' in section && section.content && (
              <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.75, margin: 0 }}>{section.content}</p>
            )}

            {'items' in section && section.items && (
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {section.items.map((item, i) => (
                  <li key={i} style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6 }}>{item}</li>
                ))}
              </ul>
            )}

            {'isContact' in section && section.isContact && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Phone', value: phone, href: `tel:${phone}` },
                  { label: 'Email', value: email, href: `mailto:${email}` },
                  { label: 'Address', value: address },
                  { label: 'Hours', value: hours },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ minWidth: '64px', fontSize: '13px', fontWeight: 700, color: '#B91C1C', paddingTop: '2px' }}>{row.label}</span>
                    {row.href
                      ? <a href={row.href} style={{ color: '#1a1a1a', fontSize: '15px', textDecoration: 'none', fontWeight: 600 }}>{row.value}</a>
                      : <span style={{ color: '#4b5563', fontSize: '15px' }}>{row.value}</span>
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '40px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '20px', padding: '32px 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>
          Have a question before ordering?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
          Our team is available {hours} to assist you.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`tel:${phone}`} style={{ background: '#DC2626', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}>
            📞 Call Us
          </a>
          <a href={`mailto:${email}`} style={{ background: '#fff', color: '#B91C1C', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', border: '2px solid #FECACA' }}>
            ✉️ Email Us
          </a>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#9ca3af' }}>
        Vasu Traders · {address} · GST: {info.gst_number || 'Registered Business'}
      </p>
    </div>
  )
}
