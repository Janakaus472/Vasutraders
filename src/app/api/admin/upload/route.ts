import { NextRequest, NextResponse } from 'next/server'
import { uploadProductImage } from '@/lib/supabase/storage'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

export async function POST(req: NextRequest) {
  if (!req.cookies.get('vt_admin')?.value === undefined) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    const url = await uploadProductImage(file)
    return NextResponse.json({ url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
