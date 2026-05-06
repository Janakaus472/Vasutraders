import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAndConsumeResetOtp,
  getAdminCredentials,
  setAdminCredentials,
  hashPassword,
} from '@/lib/supabase/admin-credentials'

export async function POST(req: NextRequest) {
  const { code, new_password, confirm_password } = await req.json()

  if (!code || !new_password) {
    return NextResponse.json({ error: 'Code and new password are required' }, { status: 400 })
  }

  if (new_password !== confirm_password) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
  }

  const valid = await verifyAndConsumeResetOtp(code)
  if (!valid) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })

  const creds = await getAdminCredentials()
  if (!creds) return NextResponse.json({ error: 'No credentials configured. Contact developer.' }, { status: 400 })

  await setAdminCredentials({ ...creds, password_hash: hashPassword(new_password) })

  // Auto-login after reset
  const res = NextResponse.json({ ok: true, username: creds.username })
  res.cookies.set('vt_admin', '1', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
    path: '/',
  })
  return res
}
