import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminCredentials,
  setAdminCredentials,
  hashPassword,
  verifyAdminLogin,
} from '@/lib/supabase/admin-credentials'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const creds = await getAdminCredentials()
  return NextResponse.json({
    username: creds?.username ?? process.env.ADMIN_USER ?? '',
    recovery_email: creds?.recovery_email ?? '',
  })
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { current_password, new_username, new_password, confirm_password, recovery_email } = await req.json()

  if (!current_password) return NextResponse.json({ error: 'Current password is required' }, { status: 400 })

  if (new_password && new_password !== confirm_password) {
    return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 })
  }

  const stored = await getAdminCredentials()
  const currentUsername = stored?.username ?? process.env.ADMIN_USER ?? ''

  const valid = await verifyAdminLogin(currentUsername, current_password)
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

  const newHash = new_password
    ? hashPassword(new_password)
    : (stored?.password_hash ?? hashPassword(process.env.ADMIN_PASSWORD ?? ''))

  await setAdminCredentials({
    username: new_username?.trim() || currentUsername,
    password_hash: newHash,
    recovery_email: recovery_email !== undefined ? recovery_email : (stored?.recovery_email ?? ''),
  })

  return NextResponse.json({ ok: true })
}
