import { NextRequest, NextResponse } from 'next/server'
import { getAdminCredentials, saveResetOtp } from '@/lib/supabase/admin-credentials'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const creds = await getAdminCredentials()
  if (!creds?.recovery_email) {
    return NextResponse.json({ error: 'No recovery email set. Ask your developer to reset via Supabase.' }, { status: 400 })
  }

  if (email.trim().toLowerCase() !== creds.recovery_email.trim().toLowerCase()) {
    return NextResponse.json({ error: 'Email does not match the recovery email on file.' }, { status: 400 })
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  await saveResetOtp(code)

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Email service not configured. Add RESEND_API_KEY to environment variables.' }, { status: 500 })
  }

  const resend = new Resend(resendKey)
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const { error: emailError } = await resend.emails.send({
    from,
    to: email.trim(),
    subject: 'Vasu Traders Admin — Password Reset Code',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px; background: #FFFAF5; border-radius: 16px;">
        <h2 style="color: #5C2D0F; margin: 0 0 8px;">Vasu Traders Admin</h2>
        <p style="color: #8B4513; margin: 0 0 24px; font-size: 15px;">Your password reset code:</p>
        <div style="background: #FFF7ED; border: 2px solid #FF6B00; border-radius: 12px; padding: 28px; text-align: center; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #C2410C; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #9CA3AF; font-size: 13px; margin-top: 20px;">Expires in 10 minutes. Do not share this code.</p>
      </div>
    `,
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    return NextResponse.json({ error: 'Failed to send email. Check your RESEND_API_KEY.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
