import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/supabase/products'
import { getSetting } from '@/lib/supabase/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [products, storeCode, inventory] = await Promise.all([
    getProducts(),
    getSetting<string>('google_store_code', 'SIYAGANJ001'),
    getSetting<Record<string, boolean>>('store_inventory', {}),
  ])

  const rows = products
    .filter(p => p.pricePerUnit > 0 && p.imageUrl)
    .map(p => {
      const inStore = inventory[p.id] ?? true
      const availability = inStore ? 'in stock' : 'out of stock'
      return `${storeCode},${p.id},${availability}`
    })

  const csv = ['store_code,item_id,availability', ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
