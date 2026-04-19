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

  return NextResponse.json({ ok: true })
}
