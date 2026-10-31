import Link from 'next/link'

export type PolicySection = { title: string; body: string }

function renderBody(body: string) {
  const lines = body.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} style={{ margin: '0 0 8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }
    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2))
    } else {
      flushList()
      elements.push(
        <p key={key++} style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.75, margin: '0 0 8px' }}
          dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
      )
    }
  }
  flushList()
  return elements
}

interface Props {
  title: string
  breadcrumbLabel: string
  sections: PolicySection[]
  phone?: string
  email?: string
  address?: string
  gstNumber?: string
}

export default function PolicyRenderer({ title, breadcrumbLabel, sections, phone, email, address, gstNumber }: Props) {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>
        <Link href="/" style={{ color: '#B91C1C', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#374151' }}>{breadcrumbLabel}</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>
          {title}
        </h1>
        <div style={{ width: '50px', height: '4px', background: '#DC2626', margin: '0 auto 12px', borderRadius: '2px' }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Effective for all wholesale orders</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sections.map((section, i) => (
          <div key={i} style={{ background: '#fff', border: '1.5px solid #f3f4f6', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }}>{section.title}</h2>
            <div>{renderBody(section.body)}</div>
          </div>
        ))}
      </div>

      {(phone || email) && (
        <div style={{ textAlign: 'center', marginTop: '40px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '20px', padding: '32px 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px' }}>Have questions?</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>Contact us and we will be happy to help.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {phone && <a href={`tel:${phone}`} style={{ background: '#DC2626', color: '#fff', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none' }}>📞 Call Us</a>}
            {email && <a href={`mailto:${email}`} style={{ background: '#fff', color: '#B91C1C', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', border: '2px solid #FECACA' }}>✉️ Email Us</a>}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#9ca3af' }}>
        Vasu Traders{address ? ` · ${address}` : ''}{gstNumber ? ` · GST: ${gstNumber}` : ''}
      </p>
    </div>
  )
}
