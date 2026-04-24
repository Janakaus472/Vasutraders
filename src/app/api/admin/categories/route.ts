import { NextRequest, NextResponse } from 'next/server'
import { getCategories, addCategory, renameCategory, deleteCategory, reorderCategories } from '@/lib/supabase/categories'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

function unauth() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// GET /api/admin/categories — public, categories are non-sensitive read data
export async function GET() {
  try {
    const cats = await getCategories()
    return NextResponse.json(cats)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/admin/categories — { name, parent_id }
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  try {
    const { name, parent_id } = await req.json()
    const cat = await addCategory(name, parent_id ?? null)
    return NextResponse.json(cat)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/admin/categories — { id, name }
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  try {
    const { id, name } = await req.json()
    await renameCategory(id, name)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/admin/categories — reorder: [{ id, display_order }]
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  try {
    const updates = await req.json()
    await reorderCategories(updates)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/admin/categories?id=X
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return unauth()
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    await deleteCategory(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
