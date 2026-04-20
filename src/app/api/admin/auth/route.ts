import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  const correctUser = process.env.ADMIN_USER
  const correctPass = process.env.ADMIN_PASSWORD

  if (!correctUser || !correctPass) {
    return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 })
  }

  if (username !== correctUser || password !== correctPass) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('vt_admin', '1', {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('vt_admin')
  return res
}
