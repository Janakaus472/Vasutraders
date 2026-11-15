import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const NOTIFY_EMAIL = process.env.LEAD_NOTIFY_EMAIL || 'vasutraders9809@gmail.com'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(req: NextRequest) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return NextResponse.json({ ok: true })

  try {
    const body = await req.json().catch(() => ({}))
    const { name, phone, location, source, context, page } = body as {
      name?: string; phone?: string; location?: string; source?: string; context?: string; page?: string
    }

    const digits = (phone ?? '').replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 13) {
      return NextResponse.json({ ok: false, error: 'Invalid phone' }, { status: 400 })
    }
    const waDigits = digits.length === 10 ? `91${digits}` : digits

    const cleanName = esc((name ?? '').slice(0, 80))
    const cleanLocation = esc((location ?? '').slice(0, 80))
    const cleanSource = esc((source ?? 'Website').slice(0, 80))
    const cleanContext = esc((context ?? '').slice(0, 200))
    const cleanPage = esc((page ?? '').slice(0, 300))
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

    const row = (label: string, value: string) =>
      `<tr><td style="padding:6px 0;color:#166534;width:90px;font-weight:700">${label}</td><td style="font-weight:700;color:#1a1a1a">${value}</td></tr>`

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#25D366;padding:20px 24px;border-radius:16px 16px 0 0">
          <h2 style="color:#fff;margin:0;font-size:20px">📲 New WhatsApp Lead</h2>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">${time} IST</p>
        </div>
        <div style="background:#f0fdf4;padding:24px;border:2px solid #86efac;border-top:none;border-radius:0 0 16px 16px">
          <table style="font-size:15px;width:100%">
            ${cleanName ? row('Name', cleanName) : ''}
            ${cleanLocation ? row('Location', cleanLocation) : ''}
            ${row('Phone', `<a href="tel:+${waDigits}" style="color:#166534;text-decoration:none">+${waDigits}</a>`)}
            ${cleanContext ? row('Product', cleanContext) : ''}
            ${row('Source', cleanSource)}
            ${cleanPage ? row('Page', `<a href="${cleanPage}" style="color:#166534">${cleanPage}</a>`) : ''}
          </table>
          <p style="margin:16px 0 0">
            <a href="https://wa.me/${waDigits}" style="display:inline-block;background:#25D366;color:#fff;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:8px">Reply on WhatsApp</a>
          </p>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;border-top:1px solid #bbf7d0;padding-top:12px">This visitor entered their number on vasutraders.com before opening WhatsApp. They may not have sent a message yet.</p>
        </div>
      </div>`

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
    await transporter.sendMail({
      from: `Vasu Traders <${process.env.GMAIL_USER}>`,
      to: NOTIFY_EMAIL,
      subject: `Lead: +${waDigits}${cleanContext ? ` — ${cleanContext}` : ''}`,
      html,
    })
  } catch (err) {
    console.error('whatsapp-lead failed', err)
  }

  return NextResponse.json({ ok: true })
}
