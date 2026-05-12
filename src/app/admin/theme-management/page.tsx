'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ThemeConfig, ActiveTheme, FestivalThemeConfig, PromoSlide, PromoThemeConfig,
  DEFAULT_FESTIVAL, DEFAULT_PROMO, DEFAULT_THEME_CONFIG,
} from '@/types/theme'

function newSlide(): PromoSlide {
  return { id: `slide_${Date.now()}_${Math.random().toString(36).slice(2)}` }
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: '14px',
  borderRadius: '10px', border: '2px solid #e5e7eb',
  background: '#fff', color: '#1a1a1a', fontFamily: 'inherit',
  fontWeight: 600, boxSizing: 'border-box', outline: 'none',
}

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 800,
  color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
  boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '20px',
}

const cardHead: React.CSSProperties = {
  padding: '14px 18px', borderBottom: '1px solid #f0f0f0',
  display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
}

const cardBody: React.CSSProperties = { padding: '18px' }

const hint: React.CSSProperties = {
  fontSize: '11px', color: '#9ca3af', marginTop: '5px', lineHeight: 1.5,
}

// ── Decoration options (generic, festival-neutral) ────────────────────────────

const DECO_OPTIONS: { key: FestivalThemeConfig['decorationType']; label: string; tip: string }[] = [
  { key: 'sparkles', label: '✨ Sparkles',    tip: 'Glowing floating orbs — suits any festival' },
  { key: 'confetti', label: '🎊 Confetti',    tip: 'Colorful falling pieces — celebrations & offers' },
  { key: 'lights',   label: '💡 Glow Lights', tip: 'Twinkling dots of light — elegant & subtle' },
  { key: 'stars',    label: '⭐ Stars',        tip: 'Rising golden stars — New Year, Eid, Navratri…' },
  { key: 'none',     label: '❌ None',         tip: 'No decorations' },
]

// ── Colour presets for quick picking ─────────────────────────────────────────

const COLOR_PRESETS = [
  { p: '#FF6B00', s: '#FAC41A', name: 'Diwali Orange' },
  { p: '#E91E8C', s: '#FF9800', name: 'Holi Pink' },
  { p: '#1565C0', s: '#4CAF50', name: 'Independence Blue' },
  { p: '#C62828', s: '#FFD600', name: 'Navratri Red' },
  { p: '#6A1B9A', s: '#F48FB1', name: 'Ganesh Purple' },
  { p: '#00695C', s: '#FFD600', name: 'Eid Green' },
  { p: '#1A237E', s: '#E53935', name: 'Republic Blue' },
  { p: '#BF360C', s: '#F9A825', name: 'Pongal Amber' },
]

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ThemeManagementPage() {
  const [config, setConfig]         = useState<ThemeConfig>(DEFAULT_THEME_CONFIG)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingSlide, setUploadingSlide]   = useState<string | null>(null)

  // Slide drag-and-drop
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const dragRef  = useRef<number | null>(null)
  const dropRef  = useRef<number | null>(null)
  const slideEls = useRef<(HTMLDivElement | null)[]>([])

  const bannerInput = useRef<HTMLInputElement>(null)
  const slideInput  = useRef<HTMLInputElement>(null)
  const slideTarget = useRef<string | null>(null)

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/admin/theme')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setConfig({
          ...DEFAULT_THEME_CONFIG, ...d,
          festival:    { ...DEFAULT_FESTIVAL,    ...d.festival },
          promotional: { ...DEFAULT_PROMO, ...d.promotional },
        })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // ── Slide drag-and-drop ───────────────────────────────────────────────────

  useEffect(() => {
    if (dragIdx === null) return
    const onMove = (e: PointerEvent) => {
      let nd = dragRef.current ?? 0
      const slides = config.promotional.slides
      for (let i = 0; i < slides.length; i++) {
        const el = slideEls.current[i]
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (e.clientY < r.top + r.height / 2) { nd = i; break }
        nd = i
      }
      dropRef.current = nd; setDropIdx(nd)
    }
    const onUp = () => {
      const from = dragRef.current, to = dropRef.current
      if (from !== null && to !== null && from !== to) {
        setConfig(prev => {
          const s = [...prev.promotional.slides]
          const [m] = s.splice(from, 1); s.splice(to, 0, m)
          return { ...prev, promotional: { ...prev.promotional, slides: s } }
        })
      }
      dragRef.current = null; dropRef.current = null
      setDragIdx(null); setDropIdx(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [dragIdx, config.promotional.slides])

  const startDrag = (e: React.PointerEvent, i: number) => {
    e.preventDefault()
    dragRef.current = i; dropRef.current = i
    setDragIdx(i); setDropIdx(i)
  }

  // ── Mutation helpers ──────────────────────────────────────────────────────

  const save = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setSaved(true); setTimeout(() => setSaved(false), 4000)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const setTheme = (t: ActiveTheme) => setConfig(p => ({ ...p, activeTheme: t }))

  const setFest = (patch: Partial<FestivalThemeConfig>) =>
    setConfig(p => ({ ...p, festival: { ...p.festival, ...patch } }))

  const setPromo = (patch: Partial<PromoThemeConfig>) =>
    setConfig(p => ({ ...p, promotional: { ...p.promotional, ...patch } }))

  const setSlide = (id: string, patch: Partial<PromoSlide>) =>
    setPromo({ slides: config.promotional.slides.map(s => s.id === id ? { ...s, ...patch } : s) })

  const addSlide    = () => setPromo({ slides: [...config.promotional.slides, newSlide()] })
  const deleteSlide = (id: string) => setPromo({ slides: config.promotional.slides.filter(s => s.id !== id) })
  const moveSlide   = (i: number, dir: -1 | 1) => {
    const s = [...config.promotional.slides], t = i + dir
    if (t < 0 || t >= s.length) return
    ;[s[i], s[t]] = [s[t], s[i]]; setPromo({ slides: s })
  }

  const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setUploadingBanner(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setFest({ bannerUrl: d.url })
    } catch (e: any) { setError(e.message) }
    setUploadingBanner(false)
  }

  const openSlideUpload = (id: string) => { slideTarget.current = id; slideInput.current?.click() }

  const uploadSlideImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0], id = slideTarget.current; e.target.value = ''
    if (!file || !id) return
    setUploadingSlide(id)
    try {
      const fd = new FormData(); fd.append('file', file)
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setSlide(id, { imageUrl: d.url })
    } catch (e: any) { setError(e.message) }
    setUploadingSlide(null)
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#9ca3af' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }} className="animate-pulse">🎨</div>
        <p style={{ marginTop: '12px', fontFamily: 'inherit' }}>Loading theme settings…</p>
      </div>
    </div>
  )

  const isDragging = dragIdx !== null

  // ── Theme card definitions ────────────────────────────────────────────────

  const THEMES: { key: ActiveTheme; emoji: string; title: string; desc: string; color: string }[] = [
    { key: 'default',     emoji: '🏠', color: '#DC2626',  title: 'Default Theme',        desc: 'Classic homepage with animated logo and category grid. The standard look for regular days.' },
    { key: 'festival',    emoji: '🎊', color: '#FF6B00',  title: 'Festival Theme',        desc: 'Festive hero with poster, greeting message, and animations. Diwali, Holi, Eid, New Year — any occasion.' },
    { key: 'promotional', emoji: '🎯', color: '#2563eb',  title: 'Promotional Slider',   desc: 'Full-width image carousel for offers, new arrivals, and campaigns. Switch anytime.' },
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '860px', userSelect: isDragging ? 'none' : 'auto' }}>

      {/* Hidden file inputs */}
      <input ref={bannerInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadBanner} />
      <input ref={slideInput}  type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadSlideImg} />

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Theme Management</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '3px' }}>Change the homepage for any festival or campaign — no developer needed.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', color: '#374151' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Preview
          </a>
          <button onClick={save} disabled={saving} style={{ padding: '9px 22px', background: saving ? '#e5e7eb' : '#FF6B00', color: saving ? '#9ca3af' : '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 800, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 14px rgba(255,107,0,0.35)', transition: 'all 0.2s' }}>
            {saving ? '⏳ Saving…' : saved ? '✅ Saved!' : '💾 Save'}
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '11px 16px', marginBottom: '16px', color: '#15803d', fontSize: '13px', fontWeight: 600 }}>
          ✅ Theme saved! Homepage will update within seconds.
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '11px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
      )}

      {/* ══ SECTION 1: ACTIVE THEME ══════════════════════════════════════════ */}
      <div style={card}>
        <div style={cardHead}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>Choose Active Theme</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Click to switch. Hit Save to go live.</div>
          </div>
        </div>
        <div style={{ ...cardBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {THEMES.map(th => {
            const active = config.activeTheme === th.key
            return (
              <button key={th.key} onClick={() => setTheme(th.key)} style={{
                border: `2px solid ${active ? th.color : '#e5e7eb'}`,
                borderRadius: '14px', background: active ? `${th.color}0d` : '#fff',
                padding: '18px 14px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', fontFamily: 'inherit',
                boxShadow: active ? `0 0 0 3px ${th.color}20` : 'none',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{th.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#111827', marginBottom: '4px' }}>{th.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5, marginBottom: '10px' }}>{th.desc}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', background: active ? th.color : '#f3f4f6', color: active ? '#fff' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {active ? '✓ Active' : 'Activate'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ SECTION 2: FESTIVAL THEME SETTINGS ══════════════════════════════ */}
      <div style={card}>
        <div style={{ ...cardHead, background: config.activeTheme === 'festival' ? '#fff7ed' : undefined }}>
          <span style={{ fontSize: '18px' }}>🎊</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>Festival Theme Settings</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Works for Diwali, Holi, Eid, New Year, Independence Day, Navratri, Ganesh Chaturthi and any other occasion.</div>
          </div>
          {config.activeTheme === 'festival' && (
            <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 800, background: '#FF6B00', color: '#fff', padding: '4px 10px', borderRadius: '6px' }}>ACTIVE</span>
          )}
        </div>
        <div style={cardBody}>

          {/* Banner upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={fieldLabel}>Festival Poster / Banner Image</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {config.festival.bannerUrl && (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={config.festival.bannerUrl} alt="Banner" style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e5e7eb', display: 'block' }} />
                  <button onClick={() => setFest({ bannerUrl: undefined })} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
                </div>
              )}
              <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                <button onClick={() => bannerInput.current?.click()} disabled={uploadingBanner} style={{ padding: '10px 18px', background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', color: '#374151', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {uploadingBanner ? '⏳ Uploading…' : '📷 Upload Poster / Banner'}
                </button>
                <p style={hint}>JPG / PNG / WebP · max 5 MB · 1200×600 px recommended<br />If no banner is uploaded, the animated logo is shown instead.</p>
              </div>
            </div>
          </div>

          {/* Greeting + sub text */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={fieldLabel}>Greeting Headline</label>
              <input type="text" value={config.festival.greetingText || ''} onChange={e => setFest({ greetingText: e.target.value })} placeholder="e.g. Happy Diwali · Happy Holi · Eid Mubarak…" style={inp} />
              <p style={hint}>Leave blank to show the business name.</p>
            </div>
            <div>
              <label style={fieldLabel}>Tagline / Sub Text</label>
              <input type="text" value={config.festival.subText || ''} onChange={e => setFest({ subText: e.target.value })} placeholder="e.g. Wishing you joy and prosperity!" style={inp} />
              <p style={hint}>Optional line shown below the headline.</p>
            </div>
          </div>

          {/* Decorations */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <label style={{ ...fieldLabel, margin: 0 }}>Decorations</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={config.festival.showDecorations} onChange={e => setFest({ showDecorations: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#FF6B00', cursor: 'pointer' }} />
                Enable animations
              </label>
            </div>
            {config.festival.showDecorations && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DECO_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => setFest({ decorationType: opt.key })} title={opt.tip} style={{
                    padding: '8px 14px', borderRadius: '8px', fontFamily: 'inherit',
                    border: `2px solid ${config.festival.decorationType === opt.key ? '#FF6B00' : '#e5e7eb'}`,
                    background: config.festival.decorationType === opt.key ? '#fff7ed' : '#fff',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    color: config.festival.decorationType === opt.key ? '#FF6B00' : '#374151',
                    transition: 'all 0.15s',
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div style={{ marginBottom: '20px' }}>
            <label style={fieldLabel}>Theme Colors</label>
            {/* Quick presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {COLOR_PRESETS.map(cp => (
                <button key={cp.name} onClick={() => setFest({ primaryColor: cp.p, secondaryColor: cp.s })} title={cp.name} style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: '2px solid #e5e7eb',
                  background: `linear-gradient(135deg, ${cp.p}, ${cp.s})`,
                  cursor: 'pointer', padding: 0,
                  boxShadow: config.festival.primaryColor === cp.p ? '0 0 0 3px #FF6B00' : 'none',
                  transition: 'box-shadow 0.15s',
                }} />
              ))}
            </div>
            <p style={{ ...hint, marginBottom: '10px' }}>Or pick custom colours:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ ...fieldLabel, marginBottom: '5px' }}>Primary</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={config.festival.primaryColor} onChange={e => setFest({ primaryColor: e.target.value })} style={{ width: '44px', height: '38px', borderRadius: '8px', border: '2px solid #e5e7eb', cursor: 'pointer', padding: '2px', flexShrink: 0 }} />
                  <input type="text" value={config.festival.primaryColor} onChange={e => setFest({ primaryColor: e.target.value })} style={{ ...inp, flex: 1 }} placeholder="#FF6B00" />
                </div>
              </div>
              <div>
                <label style={{ ...fieldLabel, marginBottom: '5px' }}>Secondary / Accent</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={config.festival.secondaryColor} onChange={e => setFest({ secondaryColor: e.target.value })} style={{ width: '44px', height: '38px', borderRadius: '8px', border: '2px solid #e5e7eb', cursor: 'pointer', padding: '2px', flexShrink: 0 }} />
                  <input type="text" value={config.festival.secondaryColor} onChange={e => setFest({ secondaryColor: e.target.value })} style={{ ...inp, flex: 1 }} placeholder="#FAC41A" />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label style={fieldLabel}>Auto-Expire Schedule <span style={{ color: '#9ca3af', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <p style={{ ...hint, marginBottom: '10px' }}>
              Set an end date so the festival theme automatically reverts to Default after the occasion — no manual switching needed.
              The start date hides the theme before the occasion begins (you still activate it manually).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ ...fieldLabel, marginBottom: '5px' }}>Show From</label>
                <input type="date" value={config.festival.startDate || ''} onChange={e => setFest({ startDate: e.target.value || undefined })} style={inp} />
              </div>
              <div>
                <label style={{ ...fieldLabel, marginBottom: '5px' }}>Revert After</label>
                <input type="date" value={config.festival.endDate || ''} onChange={e => setFest({ endDate: e.target.value || undefined })} style={inp} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══ SECTION 3: PROMOTIONAL SLIDER SETTINGS ═══════════════════════════ */}
      <div style={card}>
        <div style={{ ...cardHead, background: config.activeTheme === 'promotional' ? '#eff6ff' : undefined }}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>Promotional Slider Settings</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Add image slides with titles and call-to-action buttons. Great for offers and new arrivals.</div>
          </div>
          {config.activeTheme === 'promotional' && (
            <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 800, background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '6px' }}>ACTIVE</span>
          )}
        </div>
        <div style={cardBody}>

          {/* Slider options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <label style={fieldLabel}>Auto-slide Interval</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="number" min={0} max={30} value={config.promotional.autoSlideInterval} onChange={e => setPromo({ autoSlideInterval: Number(e.target.value) })} style={{ ...inp, width: '72px' }} />
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>sec (0 = off)</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <input type="checkbox" checked={config.promotional.showArrows} onChange={e => setPromo({ showArrows: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }} />
                Show left / right arrows
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <input type="checkbox" checked={config.promotional.showDots} onChange={e => setPromo({ showDots: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }} />
                Show dot indicators
              </label>
            </div>
          </div>

          {/* Slides header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>
              Slides ({config.promotional.slides.length})
            </div>
            <button onClick={addSlide} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              + Add Slide
            </button>
          </div>

          {/* Empty state */}
          {config.promotional.slides.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🖼️</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>No slides yet</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '14px' }}>Add image slides to create a promotional carousel.</div>
              <button onClick={addSlide} style={{ padding: '10px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                + Add First Slide
              </button>
            </div>
          )}

          {/* Slide cards */}
          {config.promotional.slides.map((slide, idx) => {
            const beingDragged = dragIdx === idx
            const isDropTarget = dropIdx === idx && dragIdx !== null && dragIdx !== idx
            return (
              <div
                key={slide.id}
                ref={el => { slideEls.current[idx] = el }}
                style={{
                  border: `2px solid ${isDropTarget ? '#2563eb' : beingDragged ? '#93c5fd' : '#e5e7eb'}`,
                  borderRadius: '12px', marginBottom: '10px',
                  background: beingDragged ? '#eff6ff' : '#fff',
                  opacity: beingDragged ? 0.5 : 1,
                  transition: 'border-color 0.1s',
                }}
              >
                {/* Slide header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
                  <div onPointerDown={e => startDrag(e, idx)} style={{ cursor: 'grab', color: '#d1d5db', padding: '2px 6px', touchAction: 'none', flexShrink: 0 }} title="Drag to reorder">
                    <svg width="12" height="18" fill="currentColor" viewBox="0 0 14 20">
                      <circle cx="4" cy="4" r="2" /><circle cx="10" cy="4" r="2" />
                      <circle cx="4" cy="10" r="2" /><circle cx="10" cy="10" r="2" />
                      <circle cx="4" cy="16" r="2" /><circle cx="10" cy="16" r="2" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', width: '20px', flexShrink: 0 }}>#{idx + 1}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    {slide.title || slide.subtitle || (slide.imageUrl ? 'Image slide' : 'New slide')}
                  </span>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} title="Move up" style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>↑</button>
                    <button onClick={() => moveSlide(idx, 1)} disabled={idx === config.promotional.slides.length - 1} title="Move down" style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: idx === config.promotional.slides.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === config.promotional.slides.length - 1 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>↓</button>
                    <button onClick={() => deleteSlide(slide.id)} title="Delete" style={{ width: '28px', height: '28px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '13px' }}>✕</button>
                  </div>
                </div>

                {/* Slide body — flex-wrap for mobile safety */}
                <div style={{ padding: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                  {/* Thumbnail */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button onClick={() => openSlideUpload(slide.id)} title="Upload image" style={{ width: '96px', height: '68px', borderRadius: '8px', border: '2px dashed #d1d5db', background: '#f9fafb', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      {uploadingSlide === slide.id
                        ? <span style={{ fontSize: '22px' }} className="animate-pulse">⏳</span>
                        : slide.imageUrl
                          ? <img src={slide.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '24px' }}>📷</span>
                      }
                    </button>
                    {slide.imageUrl && (
                      <button onClick={() => setSlide(slide.id, { imageUrl: undefined })} style={{ position: 'absolute', top: '-7px', right: '-7px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
                    )}
                  </div>

                  {/* Fields — grow and wrap within remaining space */}
                  <div style={{ flex: '1 1 180px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                    <div>
                      <label style={{ ...fieldLabel, marginBottom: '3px' }}>Title</label>
                      <input type="text" value={slide.title || ''} onChange={e => setSlide(slide.id, { title: e.target.value })} placeholder="Slide title…" style={{ ...inp, padding: '7px 10px', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ ...fieldLabel, marginBottom: '3px' }}>Subtitle</label>
                      <input type="text" value={slide.subtitle || ''} onChange={e => setSlide(slide.id, { subtitle: e.target.value })} placeholder="Short description…" style={{ ...inp, padding: '7px 10px', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ ...fieldLabel, marginBottom: '3px' }}>Button Text</label>
                      <input type="text" value={slide.ctaText || ''} onChange={e => setSlide(slide.id, { ctaText: e.target.value })} placeholder="e.g. Shop Now" style={{ ...inp, padding: '7px 10px', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ ...fieldLabel, marginBottom: '3px' }}>Button URL</label>
                      <input type="text" value={slide.ctaUrl || ''} onChange={e => setSlide(slide.id, { ctaUrl: e.target.value })} placeholder="/catalog or https://…" style={{ ...inp, padding: '7px 10px', fontSize: '13px' }} />
                    </div>
                  </div>

                </div>
              </div>
            )
          })}

          {config.promotional.slides.length > 0 && (
            <p style={{ ...hint, marginTop: '6px' }}>⠿ Hold the handle to drag &amp; reorder · 📷 Tap thumbnail to upload · All fields are optional</p>
          )}
        </div>
      </div>

      {/* Bottom save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '40px' }}>
        <button onClick={save} disabled={saving} style={{ padding: '12px 30px', background: saving ? '#e5e7eb' : '#FF6B00', color: saving ? '#9ca3af' : '#fff', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontWeight: 800, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 16px rgba(255,107,0,0.35)', transition: 'all 0.2s' }}>
          {saving ? '⏳ Saving…' : '💾 Save All Changes'}
        </button>
      </div>

    </div>
  )
}
