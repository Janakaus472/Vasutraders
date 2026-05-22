import { NextRequest, NextResponse } from 'next/server'

const NOTIFY_EMAIL = 'vasutraders9809@gmail.com'

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ ok: true })

  try {
    const body = await req.json().catch(() => ({}))
    const { source, context } = body as { source?: string; context?: string }

    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#25D366;padding:20px 24px;border-radius:16px 16px 0 0">
          <h2 style="color:#fff;margin:0;font-size:20px">📲 WhatsApp Enquiry</h2>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">${time} IST</p>
        </div>
        <div style="background:#f0fdf4;padding:24px;border:2px solid #86efac;border-top:none;border-radius:0 0 16px 16px">
          <table style="font-size:15px;width:100%">
            <tr><td style="padding:6px 0;color:#166534;width:90px;font-weight:700">Source</td><td style="font-weight:700;color:#1a1a1a">${source || 'Website'}</td></tr>
            ${context ? `<tr><td style="padding:6px 0;color:#166534;font-weight:700">Context</td><td style="font-weight:700;color:#1a1a1a">${context}</td></tr>` : ''}
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;border-top:1px solid #bbf7d0;padding-top:12px">A visitor clicked WhatsApp on vasutraders.com to enquire or place an order.</p>
        </div>
      </div>`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Vasu Traders <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        subject: `WhatsApp Click — ${source || 'Website'}`,
        html,
      }),
    })
  } catch {}

  return NextResponse.json({ ok: true })
}
