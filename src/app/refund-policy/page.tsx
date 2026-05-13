import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Vasu Traders',
  description: 'Read Vasu Traders return and refund policy. We accept returns for damaged or defective products within 7 days of delivery. Contact us for return requests.',
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
      content: `Vasu Traders is a wholesale supplier based in ${address}. We strive to ensure every order meets your expectations. This policy explains the conditions under which we accept returns and issue refunds.`,
    },
    {
      title: 'Eligible Returns',
      items: [
        'Products received in a damaged or defective condition',
        'Products that are significantly different from what was ordered (wrong item, wrong quantity)',
        'Products with manufacturing defects reported within 7 days of delivery',
      ],
    },
    {
      title: 'Non-Eligible Returns',
      items: [
        'Returns due to change of mind',
        'Products that have been used, opened, or altered',
        'Returns requested after 7 days from the date of delivery',
        'Perishable or consumable goods once delivered',
        'Custom or specially ordered products',
      ],
    },
    {
      title: 'How to Request a Return',
      steps: [
        `Contact us within 7 days of delivery via phone (${phone}) or email (${email})`,
        'Provide your order details and describe the issue with clear photos of the damaged/defective product',
        'We will review your request and respond within 2 business days',
        'If approved, we will arrange pickup or ask you to ship the items back to our warehouse',
        'Refund or replacement will be processed once we receive and inspect the returned goods',
      ],
    },
    {
      title: 'Refund Method & Timeline',
      items: [
        'Approved refunds are processed within 5–7 business days after receiving the returned product',
        'Refunds are issued via the original payment method or bank transfer',
        'Shipping charges are non-refundable unless the return is due to our error',
        'For wholesale orders paid via bank transfer, refunds are credited directly to your account',
      ],
    },
    {
      title: 'Exchanges',
      content: 'If you received a wrong or defective item, we offer a direct exchange for the correct product at no additional charge, subject to stock availability. Contact us within 7 days of delivery to request an exchange.',
    },
    {
      title: 'Damaged in Transit',
      content: 'If your order arrives visibly damaged, please refuse the delivery and notify us immediately. If damage is discovered after opening the package, take photos and contact us within 24 hours of delivery. We will arrange a replacement or full refund.',
    },
    {
      title: 'Contact for Returns',
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
        <span style={{ color: '#374151' }}>Return &amp; Refund Policy</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Return &amp; Refund Policy
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Effective for all orders placed on or after 1 January 2024 &nbsp;·&nbsp; Last updated: May 2025
        </p>
      </div>

      {/* Policy sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sections.map((section) => (
          <div key={section.title} style={{ background: '#fff', border: '1.5px solid #f3f4f6', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

            {'steps' in section && section.steps && (
              <ol style={{ margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.steps.map((step, i) => (
                  <li key={i} style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6 }}>{step}</li>
                ))}
              </ol>
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
          Have a question about your order?
        </h2>
        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
          Our team is available {hours} to assist you.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`tel:${phone}`}
            style={{ background: '#DC2626', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}
          >
            📞 Call Us
          </a>
          <a
            href={`mailto:${email}`}
            style={{ background: '#fff', color: '#B91C1C', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', border: '2px solid #FECACA' }}
          >
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
