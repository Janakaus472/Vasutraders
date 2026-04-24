import { NextRequest, NextResponse } from 'next/server'
import { addProduct, updateProduct, updateProductPrice, bulkUpdatePrices, deleteProduct, duplicateProduct, reorderProducts, getProductsBySubcategory } from '@/lib/supabase/products'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// POST /api/admin/products — add product
// POST /api/admin/products?action=duplicate&id=X — duplicate
// POST /api/admin/products?action=bulk — bulk price update
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  try {
    if (action === 'duplicate') {
      const id = searchParams.get('id')
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const product = await duplicateProduct(id)
      return NextResponse.json(product)
    }
    if (action === 'bulk') {
      const updates = await req.json()
      await bulkUpdatePrices(updates)
      return NextResponse.json({ ok: true })
    }
    if (action === 'reorder') {
      const updates = await req.json()
      await reorderProducts(updates)
      return NextResponse.json({ ok: true })
    }
    if (action === 'get_by_subcategory') {
      const category = searchParams.get('category')
      const subcategory = searchParams.get('subcategory')
      if (!category || !subcategory) return NextResponse.json({ error: 'Missing category/subcategory' }, { status: 400 })
      const products = await getProductsBySubcategory(category, subcategory)
      return NextResponse.json(products)
    }
    if (action === 'bulk_action') {
      const { ids, action: bulkType } = await req.json()
      if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'No ids' }, { status: 400 })
      if (bulkType === 'delete') {
        await Promise.all(ids.map((id: string) => deleteProduct(id)))
      } else if (bulkType === 'out_of_stock') {
        await Promise.all(ids.map((id: string) => updateProduct(id, { inStock: false })))
      } else if (bulkType === 'available') {
        await Promise.all(ids.map((id: string) => updateProduct(id, { inStock: true })))
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
      return NextResponse.json({ ok: true })
    }
    const product = await req.json()
    const id = await addProduct(product)
    return NextResponse.json({ id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/admin/products — update product fields or price
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  try {
    const body = await req.json()
    const { id, priceOnly, price, ...fields } = body
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    if (priceOnly) {
      await updateProductPrice(id, price)
    } else {
      await updateProduct(id, fields)
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/admin/products?id=X
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await deleteProduct(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
