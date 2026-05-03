import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/supabase/otp'

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json()

  if (!phone || !code) {
    return NextResponse.json({ error: 'Phone and code required' }, { status: 400 })
  }

  const result = await verifyOtp(phone, code.trim())

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
