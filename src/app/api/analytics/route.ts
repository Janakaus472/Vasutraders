import { NextRequest, NextResponse } from 'next/server'
import { recordEvent, getAnalyticsSummary, getLocationStats } from '@/lib/supabase/analytics'

const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India', US: 'United States', GB: 'United Kingdom', AU: 'Australia',
  CA: 'Canada', AE: 'UAE', SG: 'Singapore', NZ: 'New Zealand',
  PK: 'Pakistan', BD: 'Bangladesh', NP: 'Nepal', LK: 'Sri Lanka',
  MY: 'Malaysia', ZA: 'South Africa', DE: 'Germany', FR: 'France',
  IT: 'Italy', ES: 'Spain', NL: 'Netherlands', SE: 'Sweden',
  NO: 'Norway', DK: 'Denmark', FI: 'Finland', CH: 'Switzerland',
  AT: 'Austria', BE: 'Belgium', PL: 'Poland', PT: 'Portugal',
  JP: 'Japan', CN: 'China', KR: 'South Korea', HK: 'Hong Kong',
  TW: 'Taiwan', TH: 'Thailand', ID: 'Indonesia', PH: 'Philippines',
  VN: 'Vietnam', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait',
  BH: 'Bahrain', OM: 'Oman', EG: 'Egypt', KE: 'Kenya', GH: 'Ghana',
  NG: 'Nigeria', TZ: 'Tanzania', ET: 'Ethiopia', MX: 'Mexico',
  BR: 'Brazil', AR: 'Argentina', CL: 'Chile', CO: 'Colombia',
  RU: 'Russia', UA: 'Ukraine', TR: 'Turkey', IL: 'Israel',
  IR: 'Iran', IQ: 'Iraq', MV: 'Maldives', BT: 'Bhutan', MM: 'Myanmar',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, page, product_id, product_name, category } = body

    if (!event_type || !page) {
      return NextResponse.json({ error: 'Missing event_type or page' }, { status: 400 })
    }

    const ua = req.headers.get('user-agent') || ''
    const referrer = req.headers.get('referer') || ''

    if (/bot|crawl|spider|slurp|lighthouse/i.test(ua)) {
      return NextResponse.json({ ok: true })
    }

    // Vercel automatically injects geo headers on every request
    const countryCode = req.headers.get('x-vercel-ip-country') || ''
    const region = req.headers.get('x-vercel-ip-country-region') || ''
    const rawCity = req.headers.get('x-vercel-ip-city') || ''
    const city = rawCity ? decodeURIComponent(rawCity) : ''
    const country = countryCode ? (COUNTRY_NAMES[countryCode] || countryCode) : ''

    await recordEvent({
      event_type, page, product_id, product_name, category,
      referrer, user_agent: ua.slice(0, 200),
      country, country_code: countryCode, region, city,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to record' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('vt_admin')?.value === '1'
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const type = searchParams.get('type')

    if (type === 'locations') {
      const stats = await getLocationStats(Math.min(days, 90))
      return NextResponse.json(stats)
    }

    const summary = await getAnalyticsSummary(Math.min(days, 90))
    return NextResponse.json(summary)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
