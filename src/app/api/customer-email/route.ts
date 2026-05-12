import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/client'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, email, name, shop_name } = body

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const key = `customer_email_${phone}`
    const value = {
      email: email.trim().toLowerCase(),
      name: name || null,
      shop_name: shop_name || null,
      phone,
      updated_at: new Date().toISOString(),
    }

    const { error } = await adminSupabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Customer email save failed:', err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    // Fetch all customer email settings
    const { data: emailSettings, error: emailErr } = await adminSupabase
      .from('settings')
      .select('key, value')
      .like('key', 'customer_email_%')

    if (emailErr) throw emailErr

    const emailMap: Record<string, { email: string; name?: string; shop_name?: string }> = {}
    for (const row of emailSettings ?? []) {
      const phone = (row.key as string).replace('customer_email_', '')
      emailMap[phone] = row.value as { email: string; name?: string; shop_name?: string }
    }

    return NextResponse.json({ emails: emailMap })
  } catch (err) {
    console.error('Customer emails fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
