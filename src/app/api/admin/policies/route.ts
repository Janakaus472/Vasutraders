import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSetting, setSetting } from '@/lib/supabase/settings'

const VALID_KEYS = ['shipping', 'returns', 'refund', 'cancellation', 'payment', 'terms', 'privacy']

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

export async function GET() {
  try {
    const results: Record<string, unknown> = {}
    await Promise.all(
      VALID_KEYS.map(async key => {
        results[key] = await getSetting(`policy_${key}`, null)
      })
    )
    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { key, sections } = await req.json()
    if (!VALID_KEYS.includes(key)) return NextResponse.json({ error: 'Invalid policy key' }, { status: 400 })
    if (sections === null) {
      await setSetting(`policy_${key}`, null)
    } else {
      if (!Array.isArray(sections)) return NextResponse.json({ error: 'sections must be an array' }, { status: 400 })
      await setSetting(`policy_${key}`, sections)
    }
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
