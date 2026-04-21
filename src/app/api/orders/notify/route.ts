import { NextRequest, NextResponse } from 'next/server'

const OWNER_EMAIL = 'janakaus472@gmail.com'

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 500 })

  try {
    const { order_number, shop_name, contact_name, phone, locality, items } = await req.json()

    const itemRows = (items as { name: string; quantity: number; unit: string }[])
      .map((item) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #FFE0C0">${item.name}</td><td style="padding:8px 12px;border-bottom:1px solid #FFE0C0;text-align:center">${item.quantity} ${item.unit}</td></tr>`)
      .join('')

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto">
        <div style="background:#5C2D0F;padding:20px 24px;border-radius:16px 16px 0 0">
          <h1 style="color:#FFD4A0;margin:0;font-size:22px;letter-spacing:1px">New Order Received</h1>
          <p style="color:#FFB880;margin:6px 0 0;font-size:14px">Order ${order_number}</p>
        </div>
        <div style="background:#FFF8F0;padding:24px;border:2px solid #FFD4A0;border-top:none;border-radius:0 0 16px 16px">
          <h3 style="color:#5C2D0F;margin:0 0 12px;font-size:16px">Customer Details</h3>
          <table style="width:100%;font-size:15px;color:#1a1a1a;margin-bottom:20px">
            <tr><td style="padding:6px 0;color:#8B4513;width:100px">Shop</td><td style="font-weight:700">${shop_name}</td></tr>
            ${contact_name ? `<tr><td style="padding:6px 0;color:#8B4513">Name</td><td style="font-weight:700">${contact_name}</td></tr>` : ''}
            <tr><td style="padding:6px 0;color:#8B4513">Phone</td><td style="font-weight:700"><a href="tel:${phone}" style="color:#C2410C;text-decoration:none">${phone}</a></td></tr>
            <tr><td style="padding:6px 0;color:#8B4513">Area</td><td style="font-weight:700">${locality}</td></tr>
          </table>
          <h3 style="color:#5C2D0F;margin:0 0 12px;font-size:16px">Items Ordered</h3>
          <table style="width:100%;font-size:14px;color:#1a1a1a;border-collapse:collapse">
            <thead><tr style="background:#5C2D0F;color:#FFD4A0"><th style="padding:10px 12px;text-align:left;font-size:12px;letter-spacing:1px">PRODUCT</th><th style="padding:10px 12px;text-align:center;font-size:12px;letter-spacing:1px">QTY</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#8B4513;font-style:italic">Get this order ready! Customer has been asked to confirm on WhatsApp.</p>
        </div>
      </div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vasu Traders <onboarding@resend.dev>',
        to: OWNER_EMAIL,
        subject: `New Order ${order_number} - ${shop_name}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Email failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email notification failed:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
