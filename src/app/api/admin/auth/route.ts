import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminLogin } from '@/lib/supabase/admin-credentials'

function setAdminCookie(res: NextResponse) {
  res.cookies.set('vt_admin', '1', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
    path: '/',
  })
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  const ok = await verifyAdminLogin(username, password)
  if (!ok) return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  const res = NextResponse.json({ ok: true })
  setAdminCookie(res)
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('vt_admin')
  return res
}
