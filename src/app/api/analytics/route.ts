import { NextRequest, NextResponse } from 'next/server'
import { recordEvent, getAnalyticsSummary } from '@/lib/supabase/analytics'

// POST /api/analytics — record a page view or product view
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_type, page, product_id, product_name, category } = body

    if (!event_type || !page) {
      return NextResponse.json({ error: 'Missing event_type or page' }, { status: 400 })
    }

    const ua = req.headers.get('user-agent') || ''
    const referrer = req.headers.get('referer') || ''

    // Skip bots
    if (/bot|crawl|spider|slurp|lighthouse/i.test(ua)) {
      return NextResponse.json({ ok: true })
    }

    await recordEvent({
      event_type,
      page,
      product_id,
      product_name,
      category,
      referrer,
      user_agent: ua.slice(0, 200),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to record' }, { status: 500 })
  }
}

// GET /api/analytics — fetch summary (admin only)
export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('vt_admin')?.value === '1'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const summary = await getAnalyticsSummary(Math.min(days, 90))
    return NextResponse.json(summary)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
