import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '@/lib/supabase/categories'
import { getSetting, setSetting } from '@/lib/supabase/settings'
import { adminSupabase } from '@/lib/supabase/client'

export interface HomeCategoryItem {
  name: string
  emoji: string
  visible: boolean
}

const DEFAULT_EMOJIS: Record<string, string> = {
  'Playing Cards':        '🃏',
  'Party Balloons':       '🎈',
  'Kanche & Glass Balls': '🔮',
  'Sports & Games':       '🏏',
  'Rubber Bands':         '🔁',
  'Tapes':                '📦',
  'Poker Chips':          '🎰',
  'Toothbrushes':         '🪥',
  'Boric Acid':           '⚗️',
  'General Goods':        '🛍️',
}

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

// GET — returns merged layout using the same category source as the home page
export async function GET() {
  try {
    const [cats, productsRes, saved] = await Promise.all([
      getCategories(),
      adminSupabase.from('products').select('category').eq('in_stock', true),
      getSetting<HomeCategoryItem[]>('home_layout', []),
    ])

    // Build full ordered category name list (same logic as home page)
    const counts: Record<string, number> = {}
    for (const row of productsRes.data || []) {
      if (row.category) counts[row.category] = (counts[row.category] || 0) + 1
    }
    const orderedNames = cats.map(c => c.name)
    const allCatNames = [
      ...orderedNames.filter(n => counts[n]),
      ...Object.keys(counts).filter(n => !orderedNames.includes(n)),
    ]

    const savedMap = new Map(saved.map(s => [s.name, s]))
    const savedNames = saved.map(s => s.name)
    const newCatNames = allCatNames.filter(n => !savedMap.has(n))

    const merged: HomeCategoryItem[] = [
      // saved items that still exist in the product catalog
      ...savedNames
        .filter(n => allCatNames.includes(n))
        .map(n => savedMap.get(n)!),
      // newly discovered categories not yet in saved layout
      ...newCatNames.map(name => ({
        name,
        emoji: DEFAULT_EMOJIS[name] || '📦',
        visible: true,
      })),
    ]

    return NextResponse.json(merged)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT — saves layout
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const items: HomeCategoryItem[] = await req.json()
    await setSetting('home_layout', items)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
