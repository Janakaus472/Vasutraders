import { NextRequest, NextResponse } from 'next/server'
import { getSetting, setSetting } from '@/lib/supabase/settings'
import { revalidatePath } from 'next/cache'

// Re-export types so server code can still import from this route if needed
export type {
  FestivalThemeConfig, PromoSlide, PromoThemeConfig, ActiveTheme, ThemeConfig,
} from '@/types/theme'
export { DEFAULT_FESTIVAL, DEFAULT_PROMO, DEFAULT_THEME_CONFIG } from '@/types/theme'

import type { ThemeConfig } from '@/types/theme'
import { DEFAULT_FESTIVAL, DEFAULT_PROMO, DEFAULT_THEME_CONFIG } from '@/types/theme'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

function mergeConfig(saved: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...DEFAULT_THEME_CONFIG,
    ...saved,
    festival: { ...DEFAULT_FESTIVAL, ...(saved?.festival ?? {}) },
    promotional: { ...DEFAULT_PROMO, ...(saved?.promotional ?? {}) },
  }
}

export async function GET() {
  try {
    const saved = await getSetting<Partial<ThemeConfig>>('theme_config', {})
    return NextResponse.json(mergeConfig(saved as Partial<ThemeConfig>))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const config: ThemeConfig = await req.json()
    await setSetting('theme_config', config)
    try { revalidatePath('/') } catch {}
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
