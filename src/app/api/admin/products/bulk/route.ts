import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/client'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

// POST /api/admin/products/bulk — insert many products at once
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { products } = await req.json()
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    if (products.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 products per batch' }, { status: 400 })
    }

    const rows = products.map((p: any, i: number) => ({
      name: (p.name || '').trim(),
      description: (p.description || '').trim(),
      image_url: (p.image_url || '').trim(),
      unit: (p.unit || 'Pcs').trim(),
      price_per_unit: parseFloat(p.price) || 0,
      min_order_qty: parseInt(p.min_qty) || 1,
      in_stock: p.in_stock !== false,
      category: (p.category || '').trim(),
      subcategory: (p.subcategory || '').trim(),
      display_order: i,
    })).filter((r: any) => r.name)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid products found (all names empty)' }, { status: 400 })
    }

    const db = getAdminSupabase()
    const { data, error } = await db
      .from('products')
      .insert(rows)
      .select('id, name')

    if (error) throw error

    return NextResponse.json({
      ok: true,
      inserted: data?.length || 0,
      products: data,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bulk insert failed' }, { status: 500 })
  }
}
