import { Metadata } from 'next'
import Link from 'next/link'
import { getSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export const metadata: Metadata = {
  title: 'Privacy Policy | Vasu Traders',
  description: 'Privacy policy for vasutraders.com. How Vasu Traders collects, uses, and protects your personal information.',
  alternates: { canonical: 'https://www.vasutraders.com/privacy-policy' },
  robots: { index: true, follow: true },
}

export const revalidate = 0

export default async function PrivacyPolicyPage() {
  const storeInfo = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO).catch(() => DEFAULT_STORE_INFO)
  const info: StoreInfo = { ...DEFAULT_STORE_INFO, ...storeInfo }

  const email = info.email || ''
  const address = info.address || 'Indore, Madhya Pradesh, India'

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>
        <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#374151' }}>Privacy Policy</span>
      </nav>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          Privacy Policy
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Last updated: May 2025 &nbsp;·&nbsp; vasutraders.com
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <PolicySection title="1. Introduction">
          <p style={bodyText}>
            Vasu Traders (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard information when you visit
            our website vasutraders.com or contact us for wholesale inquiries.
          </p>
          <p style={{ ...bodyText, marginTop: '10px' }}>
            Our website is a <strong>product catalog and wholesale inquiry platform</strong>. We do not
            operate a standard online store and do not process payments or store payment information
            through this website.
          </p>
        </PolicySection>

        <PolicySection title="2. Information We Collect">
          <p style={bodyText}>We may collect the following types of information:</p>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InfoBlock title="Contact Information">
              Name, phone number, email address, and business name provided when you contact us via
              phone, WhatsApp, or email for order inquiries.
            </InfoBlock>
            <InfoBlock title="Order Information">
              Product requirements, quantities, delivery address, and any other details you share
              during the order discussion process.
            </InfoBlock>
            <InfoBlock title="Website Usage Data">
              Standard analytics data including pages visited, time spent, device type, and
              approximate location (city/region level). This is collected via anonymised analytics
              tools to improve our website.
            </InfoBlock>
            <InfoBlock title="Communication Records">
              Records of phone calls, WhatsApp messages, or emails you send us for order and
              inquiry purposes.
            </InfoBlock>
          </div>
        </PolicySection>

        <PolicySection title="3. How We Use Your Information">
          <ul style={listStyle}>
            <li style={listItem}>To respond to your wholesale product inquiries</li>
            <li style={listItem}>To process and fulfil orders you place with us</li>
            <li style={listItem}>To communicate order status, dispatch details, and delivery updates</li>
            <li style={listItem}>To maintain records for accounting and tax compliance (GST)</li>
            <li style={listItem}>To improve our website and product catalog based on usage patterns</li>
            <li style={listItem}>To contact you about order follow-ups or relevant product updates (only with your consent)</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Information Sharing">
          <p style={bodyText}>
            We do not sell, rent, or trade your personal information to third parties. We may share
            information only in the following situations:
          </p>
          <ul style={listStyle}>
            <li style={listItem}><strong>Logistics Partners:</strong> Your delivery address is shared with transport/courier partners solely for order delivery</li>
            <li style={listItem}><strong>Legal Requirements:</strong> If required by law, court order, or government authority</li>
            <li style={listItem}><strong>Business Operations:</strong> With service providers who help us operate our website (hosting, analytics) under strict confidentiality agreements</li>
          </ul>
        </PolicySection>

        <PolicySection title="5. Data Storage & Security">
          <ul style={listStyle}>
            <li style={listItem}>Your data is stored securely using industry-standard practices</li>
            <li style={listItem}>Our website uses HTTPS (SSL encryption) to protect data in transit</li>
            <li style={listItem}>We retain your information only as long as necessary for business and legal purposes</li>
            <li style={listItem}>We take reasonable precautions to protect your data but cannot guarantee absolute security</li>
          </ul>
        </PolicySection>

        <PolicySection title="6. Cookies">
          <p style={bodyText}>
            Our website may use cookies to improve your browsing experience and track website
            analytics. These are standard cookies used to:
          </p>
          <ul style={listStyle}>
            <li style={listItem}>Remember your language preference (English/Hindi)</li>
            <li style={listItem}>Track anonymised page views for analytics</li>
            <li style={listItem}>Maintain your shopping cart session</li>
          </ul>
          <p style={{ ...bodyText, marginTop: '10px' }}>
            You can disable cookies through your browser settings, though this may affect some
            website functionality.
          </p>
        </PolicySection>

        <PolicySection title="7. Your Rights">
          <p style={bodyText}>You have the right to:</p>
          <ul style={listStyle}>
            <li style={listItem}>Request access to the personal information we hold about you</li>
            <li style={listItem}>Request correction of inaccurate information</li>
            <li style={listItem}>Request deletion of your information (subject to legal and business obligations)</li>
            <li style={listItem}>Opt out of any promotional communications from us</li>
          </ul>
          <p style={{ ...bodyText, marginTop: '10px' }}>
            To exercise these rights, please contact us at the details below.
          </p>
        </PolicySection>

        <PolicySection title="8. Third-Party Links">
          <p style={bodyText}>
            Our website may contain links to external websites (e.g., Google Maps, WhatsApp).
            We are not responsible for the privacy practices of these third-party websites.
            We encourage you to review their privacy policies before providing any personal information.
          </p>
        </PolicySection>

        <PolicySection title="9. Children's Privacy">
          <p style={bodyText}>
            Our website and services are intended for business use only. We do not knowingly
            collect personal information from individuals under the age of 18.
          </p>
        </PolicySection>

        <PolicySection title="10. Changes to This Policy">
          <p style={bodyText}>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated date. Continued use of our website after changes constitutes
            acceptance of the revised policy.
          </p>
        </PolicySection>

        <PolicySection title="11. Contact Us">
          <p style={{ ...bodyText, marginBottom: '14px' }}>
            If you have questions about this Privacy Policy or how we handle your information, please contact us:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ContactRow label="Business" value="Vasu Traders" />
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

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: '10px', borderLeft: '3px solid #DC2626' }}>
      <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
      <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6 }}>{children}</div>
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
