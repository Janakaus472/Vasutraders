import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSetting, setSetting } from '@/lib/supabase/settings'
import { StoreInfo, DEFAULT_STORE_INFO } from '@/types/store-info'

export type { TeamMember, StoreInfo } from '@/types/store-info'
export { DEFAULT_STORE_INFO } from '@/types/store-info'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

export async function GET() {
  try {
    const info = await getSetting<StoreInfo>('store_info', DEFAULT_STORE_INFO)
    return NextResponse.json({ ...DEFAULT_STORE_INFO, ...info })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const info: StoreInfo = await req.json()
    await setSetting('store_info', info)
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
