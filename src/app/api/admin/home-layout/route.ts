import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '@/lib/supabase/categories'
import { getSetting, setSetting } from '@/lib/supabase/settings'

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

// GET — returns merged layout (saved config + current DB categories)
export async function GET() {
  try {
    const [cats, saved] = await Promise.all([
      getCategories(),
      getSetting<HomeCategoryItem[]>('home_layout', []),
    ])

    const mainCats = cats.filter(c => !c.parent_id)
    const savedMap = new Map(saved.map(s => [s.name, s]))

    // Merge: saved items first (preserving their order), then new categories appended
    const savedNames = saved.map(s => s.name)
    const newCats = mainCats.filter(c => !savedMap.has(c.name))

    const merged: HomeCategoryItem[] = [
      ...savedNames
        .filter(n => mainCats.some(c => c.name === n))
        .map(n => savedMap.get(n)!),
      ...newCats.map(c => ({
        name: c.name,
        emoji: DEFAULT_EMOJIS[c.name] || '📦',
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
