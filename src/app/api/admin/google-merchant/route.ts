import { NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/supabase/settings'

export async function GET() {
  const storeCode = await getSetting<string>('google_store_code', '')
  const inventory = await getSetting<Record<string, boolean>>('store_inventory', {})
  return NextResponse.json({ storeCode, inventory })
}

export async function PUT(req: Request) {
  try {
    const { storeCode, inventory } = await req.json()
    await setSetting('google_store_code', storeCode ?? '')
    await setSetting('store_inventory', inventory ?? {})
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
