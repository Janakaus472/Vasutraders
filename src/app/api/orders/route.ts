import { NextRequest, NextResponse } from 'next/server'
import { saveOrder, fetchOrders } from '@/lib/supabase/orders'

function generateOrderNumber(): string {
  return 'VT' + Date.now().toString().slice(-6)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const payload = {
      order_number: generateOrderNumber(),
      shop_name: body.shop_name,
      contact_name: body.contact_name,
      phone: body.phone,
      locality: body.locality,
      items: body.items,
    }
    const order = await saveOrder(payload)

    // TODO: Send WhatsApp via Baileys bot service when ready
    // const botUrl = process.env.WHATSAPP_BOT_URL
    // if (botUrl) {
    //   await fetch(`${botUrl}/send-order`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ order }),
    //   })
    // }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('Order save failed:', err)
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    const { updateOrderStatus } = await import('@/lib/supabase/orders')
    await updateOrderStatus(id, status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Status update failed:', err)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const orders = await fetchOrders()
    return NextResponse.json({ orders })
  } catch (err) {
    console.error('Orders fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
