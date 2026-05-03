import { NextRequest, NextResponse } from 'next/server'
import { saveOtp } from '@/lib/supabase/otp'

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  const code = generateOtp()

  try {
    await saveOtp(phone, code)
  } catch {
    return NextResponse.json({ error: 'Failed to save OTP' }, { status: 500 })
  }

  const instanceId = process.env.GREENAPI_INSTANCE_ID
  const apiToken = process.env.GREENAPI_TOKEN

  if (!instanceId || !apiToken) {
    return NextResponse.json({ error: 'WhatsApp service not configured' }, { status: 500 })
  }

  const message =
    `Your Vasu Traders verification code is: *${code}*\n\nValid for 10 minutes. Do not share this code.`

  try {
    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: `91${phone}@c.us`, message }),
      }
    )
    if (!res.ok) {
      const text = await res.text()
      console.error('Green API error:', text)
      throw new Error('WhatsApp send failed')
    }
  } catch {
    return NextResponse.json({ error: 'Failed to send WhatsApp message. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
