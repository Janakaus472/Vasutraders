'use client'

import { useLanguage } from '@/context/LanguageContext'
import { BULK_ORDER_PHONE } from '@/lib/constants'

export default function WholesaleBanner() {
  const { lang } = useLanguage()

  return (
    <div style={{ background: '#FAC41A', color: '#7f1d1d', textAlign: 'center', padding: '8px 16px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', lineHeight: 1.5 }}>
      {lang === 'hi'
        ? 'हम केवल थोक (बल्क) ऑर्डर लेते हैं — पूरे भारत में सबसे अच्छे दाम की गारंटी'
        : 'WE ONLY DO BULK ORDERS — BEST PRICE GUARANTEED PAN INDIA'}
      <br />
      <a href={`tel:${BULK_ORDER_PHONE}`} style={{ color: '#7f1d1d', textDecoration: 'underline' }}>
        {lang === 'hi' ? 'थोक ऑर्डर के लिए कॉल करें: ' : 'Call for bulk orders: '}+91 94250 73114
      </a>
    </div>
  )
}
