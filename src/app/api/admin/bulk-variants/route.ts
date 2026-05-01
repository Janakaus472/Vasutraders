import { NextRequest, NextResponse } from 'next/server'
import { getBulkVariants, addBulkVariant, updateBulkVariant, deleteBulkVariant, reorderBulkVariants } from '@/lib/supabase/bulk_variants'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// GET /api/admin/bulk-variants?productId=X
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  const productId = new URL(req.url).searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
  try {
    const variants = await getBulkVariants(productId)
    return NextResponse.json(variants)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/admin/bulk-variants — add variant
// POST /api/admin/bulk-variants?action=reorder — reorder variants
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  const action = new URL(req.url).searchParams.get('action')
  try {
    if (action === 'reorder') {
      const updates = await req.json()
      await reorderBulkVariants(updates)
      return NextResponse.json({ ok: true })
    }
    const body = await req.json()
    const variant = await addBulkVariant(body)
    return NextResponse.json(variant)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/admin/bulk-variants — update variant
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  try {
    const { id, ...fields } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await updateBulkVariant(id, fields)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/admin/bulk-variants?id=X
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await deleteBulkVariant(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
