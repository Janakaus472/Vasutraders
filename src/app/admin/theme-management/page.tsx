'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ThemeConfig, ActiveTheme, FestivalThemeConfig, PromoSlide, PromoThemeConfig,
  DEFAULT_FESTIVAL, DEFAULT_PROMO, DEFAULT_THEME_CONFIG,
} from '@/types/theme'

// ── Types & defaults ──────────────────────────────────────────────────────────

function newSlide(): PromoSlide {
  return { id: `slide_${Date.now()}_${Math.random().toString(36).slice(2)}` }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: '14px',
  borderRadius: '10px', border: '2px solid #e5e7eb',
  background: '#fff', color: '#1a1a1a', fontFamily: 'inherit',
  fontWeight: 600, boxSizing: 'border-box', outline: 'none',
}

const sectionCard: React.CSSProperties = {
  background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
  boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '24px',
}

const sectionHeader: React.CSSProperties = {
  padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
  display: 'flex', alignItems: 'center', gap: '10px',
}

const sectionBody: React.CSSProperties = { padding: '20px' }

const label: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 800,
  color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ThemeManagementPage() {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Upload state
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingSlide, setUploadingSlide] = useState<string | null>(null)

  // Slide drag-and-drop
  const [dragSlideIdx, setDragSlideIdx] = useState<number | null>(null)
  const [dropSlideIdx, setDropSlideIdx] = useState<number | null>(null)
  const dragIdxRef = useRef<number | null>(null)
  const dropIdxRef = useRef<number | null>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const slideInputRef = useRef<HTMLInputElement>(null)
  const uploadSlideTarget = useRef<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/theme')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setConfig({ ...DEFAULT_THEME_CONFIG, ...data, festival: { ...DEFAULT_FESTIVAL, ...data.festival }, promotional: { ...DEFAULT_PROMO, ...data.promotional } })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Pointer drag on slides
  useEffect(() => {
    if (dragSlideIdx === null) return
    const onMove = (e: PointerEvent) => {
      let newDrop = dragIdxRef.current ?? 0
      const slides = config.promotional.slides
      for (let i = 0; i < slides.length; i++) {
        const el = slideRefs.current[i]
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (e.clientY < rect.top + rect.height / 2) { newDrop = i; break }
        newDrop = i
      }
      dropIdxRef.current = newDrop
      setDropSlideIdx(newDrop)
    }
    const onUp = () => {
      const from = dragIdxRef.current
      const to = dropIdxRef.current
      if (from !== null && to !== null && from !== to) {
        setConfig(prev => {
          const slides = [...prev.promotional.slides]
          const [moved] = slides.splice(from, 1)
          slides.splice(to, 0, moved)
          return { ...prev, promotional: { ...prev.promotional, slides } }
        })
      }
      dragIdxRef.current = null
      dropIdxRef.current = null
      setDragSlideIdx(null)
      setDropSlideIdx(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [dragSlideIdx, config.promotional.slides])

  const startSlideDrag = (e: React.PointerEvent, idx: number) => {
    e.preventDefault()
    dragIdxRef.current = idx
    dropIdxRef.current = idx
    setDragSlideIdx(idx)
    setDropSlideIdx(idx)
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const setTheme = (t: ActiveTheme) => setConfig(prev => ({ ...prev, activeTheme: t }))

  const setFestival = (patch: Partial<FestivalThemeConfig>) =>
    setConfig(prev => ({ ...prev, festival: { ...prev.festival, ...patch } }))

  const setPromo = (patch: Partial<PromoThemeConfig>) =>
    setConfig(prev => ({ ...prev, promotional: { ...prev.promotional, ...patch } }))

  const setSlide = (id: string, patch: Partial<PromoSlide>) =>
    setPromo({ slides: config.promotional.slides.map(s => s.id === id ? { ...s, ...patch } : s) })

  const addSlide = () => setPromo({ slides: [...config.promotional.slides, newSlide()] })

  const deleteSlide = (id: string) => setPromo({ slides: config.promotional.slides.filter(s => s.id !== id) })

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const slides = [...config.promotional.slides]
    const target = idx + dir
    if (target < 0 || target >= slides.length) return
    ;[slides[idx], slides[target]] = [slides[target], slides[idx]]
    setPromo({ slides })
  }

  const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingBanner(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFestival({ bannerUrl: data.url })
    } catch (e: any) { setError(e.message) }
    setUploadingBanner(false)
  }

  const openSlideUpload = (id: string) => {
    uploadSlideTarget.current = id
    slideInputRef.current?.click()
  }

  const uploadSlideImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const id = uploadSlideTarget.current
    e.target.value = ''
    if (!file || !id) return
    setUploadingSlide(id)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSlide(id, { imageUrl: data.url })
    } catch (e: any) { setError(e.message) }
    setUploadingSlide(null)
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#9ca3af' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }} className="animate-pulse">✨</div>
          <p>Loading theme settings…</p>
        </div>
      </div>
    )
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const isDragging = dragSlideIdx !== null

  const themeDescriptions: Record<ActiveTheme, { emoji: string; title: string; desc: string; color: string }> = {
    default: {
      emoji: '🏠', title: 'Default Theme', color: '#DC2626',
      desc: 'Classic homepage with animated logo, category grid, and business info.',
    },
    festival: {
      emoji: '🪔', title: 'Festival Theme', color: '#FF6B00',
      desc: 'Festive hero with poster banner, decorations, and greeting message.',
    },
    promotional: {
      emoji: '🎯', title: 'Promotional Slider', color: '#2563eb',
      desc: 'Full-width image carousel to showcase offers, products, and campaigns.',
    },
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '860px', userSelect: isDragging ? 'none' : 'auto' }}>
      {/* Hidden file inputs */}
      <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadBanner} />
      <input ref={slideInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadSlideImage} />

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>Theme Management</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            Switch the homepage appearance instantly — no developer needed.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', color: '#374151' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Preview Site
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '10px 24px', background: saving ? '#e5e7eb' : '#FF6B00', color: saving ? '#9ca3af' : '#fff', border: 'none', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 800, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 14px rgba(255,107,0,0.35)', transition: 'all 0.2s' }}
          >
            {saving ? '⏳ Saving…' : saved ? '✅ Saved!' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {/* Success notice */}
      {saved && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#15803d', fontSize: '13px', fontWeight: 600 }}>
          ✅ Theme saved! Homepage will update within seconds.
        </div>
      )}

      {/* Error notice */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* ══ SECTION 1: CHOOSE THEME ══ */}
      <div style={sectionCard}>
        <div style={sectionHeader}>
          <span style={{ fontSize: '20px' }}>✨</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#111827' }}>Active Theme</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>Click a theme to activate it, then save.</div>
          </div>
        </div>
        <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {(Object.entries(themeDescriptions) as [ActiveTheme, typeof themeDescriptions.default][]).map(([key, info]) => {
            const isActive = config.activeTheme === key
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  border: `2px solid ${isActive ? info.color : '#e5e7eb'}`,
                  borderRadius: '14px', background: isActive ? `${info.color}08` : '#fff',
                  padding: '20px 16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                  boxShadow: isActive ? `0 0 0 3px ${info.color}22` : 'none',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{info.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>{info.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5, marginBottom: '12px' }}>{info.desc}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '11px', fontWeight: 800, padding: '5px 10px', borderRadius: '6px',
                  background: isActive ? info.color : '#f3f4f6',
                  color: isActive ? '#fff' : '#6b7280',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  {isActive ? '✓ Active' : 'Activate'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ SECTION 2: FESTIVAL THEME SETTINGS ══ */}
      <div style={sectionCard}>
        <div style={{ ...sectionHeader, background: config.activeTheme === 'festival' ? '#fff7ed' : undefined }}>
          <span style={{ fontSize: '20px' }}>🪔</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#111827' }}>Festival Theme Settings</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>Configure festival poster, greeting, and decorations.</div>
          </div>
          {config.activeTheme === 'festival' && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 800, background: '#FF6B00', color: '#fff', padding: '4px 10px', borderRadius: '6px' }}>ACTIVE</span>
          )}
        </div>
        <div style={sectionBody}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

            {/* Banner Upload */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>Festival Banner / Poster</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {config.festival.bannerUrl ? (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={config.festival.bannerUrl} alt="Banner" style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e5e7eb', display: 'block' }} />
                    <button
                      onClick={() => setFestival({ bannerUrl: undefined })}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}
                    >✕</button>
                  </div>
                ) : null}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <button
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    style={{ padding: '10px 20px', background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {uploadingBanner ? '⏳ Uploading…' : '📷 Upload Banner Image'}
                  </button>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '6px 0 0' }}>
                    JPG/PNG/WebP · max 5 MB · recommended 1200×600 px<br />
                    If no banner, the animated logo will be shown.
                  </p>
                </div>
              </div>
            </div>

            {/* Greeting Text */}
            <div>
              <label style={label}>Greeting Text</label>
              <input
                type="text"
                value={config.festival.greetingText || ''}
                onChange={e => setFestival({ greetingText: e.target.value })}
                placeholder="e.g. Happy Diwali from Vasu Traders!"
                style={inputStyle}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '5px 0 0' }}>Leave blank to show the business name.</p>
            </div>

            {/* Sub Text */}
            <div>
              <label style={label}>Sub Text</label>
              <input
                type="text"
                value={config.festival.subText || ''}
                onChange={e => setFestival({ subText: e.target.value })}
                placeholder="e.g. Wishing you joy and prosperity!"
                style={inputStyle}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '5px 0 0' }}>Optional tagline shown below the greeting.</p>
            </div>

            {/* Decorations toggle */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>Decorations</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={config.festival.showDecorations}
                    onChange={e => setFestival({ showDecorations: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#FF6B00', cursor: 'pointer' }}
                  />
                  Enable decorations
                </label>
              </div>
              {config.festival.showDecorations && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'diyas', label: '🪔 Diyas', desc: 'Floating glowing diyas' },
                    { key: 'confetti', label: '🎊 Confetti', desc: 'Colorful falling confetti' },
                    { key: 'lights', label: '✨ Lights', desc: 'Twinkling lights' },
                    { key: 'none', label: '❌ None', desc: 'No decorations' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setFestival({ decorationType: opt.key as FestivalThemeConfig['decorationType'] })}
                      title={opt.desc}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: '2px solid',
                        borderColor: config.festival.decorationType === opt.key ? '#FF6B00' : '#e5e7eb',
                        background: config.festival.decorationType === opt.key ? '#fff7ed' : '#fff',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                        color: config.festival.decorationType === opt.key ? '#FF6B00' : '#374151',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div>
              <label style={label}>Primary Color</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.festival.primaryColor}
                  onChange={e => setFestival({ primaryColor: e.target.value })}
                  style={{ width: '48px', height: '40px', borderRadius: '8px', border: '2px solid #e5e7eb', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={config.festival.primaryColor}
                  onChange={e => setFestival({ primaryColor: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="#FF6B00"
                />
              </div>
            </div>

            <div>
              <label style={label}>Secondary Color</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.festival.secondaryColor}
                  onChange={e => setFestival({ secondaryColor: e.target.value })}
                  style={{ width: '48px', height: '40px', borderRadius: '8px', border: '2px solid #e5e7eb', cursor: 'pointer', padding: '2px' }}
                />
                <input
                  type="text"
                  value={config.festival.secondaryColor}
                  onChange={e => setFestival({ secondaryColor: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="#FAC41A"
                />
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label style={label}>Auto-Start Date <span style={{ color: '#9ca3af', fontWeight: 500 }}>(optional)</span></label>
              <input
                type="date"
                value={config.festival.startDate || ''}
                onChange={e => setFestival({ startDate: e.target.value || undefined })}
                style={inputStyle}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '5px 0 0' }}>Festival theme activates automatically on this date.</p>
            </div>

            <div>
              <label style={label}>Auto-End Date <span style={{ color: '#9ca3af', fontWeight: 500 }}>(optional)</span></label>
              <input
                type="date"
                value={config.festival.endDate || ''}
                onChange={e => setFestival({ endDate: e.target.value || undefined })}
                style={inputStyle}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '5px 0 0' }}>Reverts to default theme after this date.</p>
            </div>

          </div>
        </div>
      </div>

      {/* ══ SECTION 3: PROMOTIONAL SLIDER SETTINGS ══ */}
      <div style={sectionCard}>
        <div style={{ ...sectionHeader, background: config.activeTheme === 'promotional' ? '#eff6ff' : undefined }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#111827' }}>Promotional Slider Settings</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>Add slides with images, titles, and call-to-action buttons.</div>
          </div>
          {config.activeTheme === 'promotional' && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 800, background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '6px' }}>ACTIVE</span>
          )}
        </div>
        <div style={sectionBody}>

          {/* Slider options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <label style={label}>Auto-slide Interval</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={config.promotional.autoSlideInterval}
                  onChange={e => setPromo({ autoSlideInterval: Number(e.target.value) })}
                  style={{ ...inputStyle, width: '80px' }}
                />
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>seconds (0 = off)</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                <input type="checkbox" checked={config.promotional.showArrows} onChange={e => setPromo({ showArrows: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }} />
                Show navigation arrows
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                <input type="checkbox" checked={config.promotional.showDots} onChange={e => setPromo({ showDots: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }} />
                Show dot indicators
              </label>
            </div>
          </div>

          {/* Slides list */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>
              Slides ({config.promotional.slides.length})
            </div>
            <button
              onClick={addSlide}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              + Add Slide
            </button>
          </div>

          {config.promotional.slides.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🖼️</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>No slides yet</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>Add slides to create a promotional carousel.</div>
              <button onClick={addSlide} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                + Add First Slide
              </button>
            </div>
          )}

          <div>
            {config.promotional.slides.map((slide, idx) => {
              const isBeingDragged = dragSlideIdx === idx
              const isDropTarget = dropSlideIdx === idx && dragSlideIdx !== null && dragSlideIdx !== idx
              return (
                <div
                  key={slide.id}
                  ref={el => { slideRefs.current[idx] = el }}
                  style={{
                    border: '2px solid',
                    borderColor: isDropTarget ? '#2563eb' : isBeingDragged ? '#93c5fd' : '#e5e7eb',
                    borderRadius: '12px', marginBottom: '12px',
                    background: isBeingDragged ? '#eff6ff' : '#fff',
                    opacity: isBeingDragged ? 0.5 : 1,
                    transition: 'border-color 0.1s',
                  }}
                >
                  {/* Slide header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                    {/* Drag handle */}
                    <div
                      onPointerDown={e => startSlideDrag(e, idx)}
                      style={{ cursor: 'grab', color: '#d1d5db', padding: '2px 6px', flexShrink: 0, touchAction: 'none' }}
                      title="Drag to reorder"
                    >
                      <svg width="14" height="20" fill="currentColor" viewBox="0 0 14 20">
                        <circle cx="4" cy="4" r="2" /><circle cx="10" cy="4" r="2" />
                        <circle cx="4" cy="10" r="2" /><circle cx="10" cy="10" r="2" />
                        <circle cx="4" cy="16" r="2" /><circle cx="10" cy="16" r="2" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#9ca3af', minWidth: '24px' }}>#{idx + 1}</span>
                    <span style={{ flex: 1, fontWeight: 700, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {slide.title || slide.subtitle || (slide.imageUrl ? 'Image slide' : 'New slide')}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} title="Move up" style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>↑</button>
                      <button onClick={() => moveSlide(idx, 1)} disabled={idx === config.promotional.slides.length - 1} title="Move down" style={{ width: '28px', height: '28px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff', cursor: idx === config.promotional.slides.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === config.promotional.slides.length - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>↓</button>
                      <button onClick={() => deleteSlide(slide.id)} title="Delete slide" style={{ width: '28px', height: '28px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '13px' }}>✕</button>
                    </div>
                  </div>

                  {/* Slide body */}
                  <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '14px', alignItems: 'start' }}>
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        onClick={() => openSlideUpload(slide.id)}
                        style={{ width: '100px', height: '72px', borderRadius: '8px', border: '2px dashed #d1d5db', background: '#f9fafb', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, position: 'relative' }}
                        title="Click to upload image"
                      >
                        {uploadingSlide === slide.id ? (
                          <span style={{ fontSize: '24px' }} className="animate-pulse">⏳</span>
                        ) : slide.imageUrl ? (
                          <img src={slide.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '28px', lineHeight: 1 }}>📷</span>
                        )}
                      </button>
                      {slide.imageUrl && (
                        <button
                          onClick={() => setSlide(slide.id, { imageUrl: undefined })}
                          style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', cursor: 'pointer', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}
                        >✕</button>
                      )}
                    </div>

                    {/* Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                      <div>
                        <label style={{ ...label, marginBottom: '4px' }}>Title</label>
                        <input
                          type="text"
                          value={slide.title || ''}
                          onChange={e => setSlide(slide.id, { title: e.target.value })}
                          placeholder="Slide title…"
                          style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...label, marginBottom: '4px' }}>Subtitle</label>
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onChange={e => setSlide(slide.id, { subtitle: e.target.value })}
                          placeholder="Short description…"
                          style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...label, marginBottom: '4px' }}>Button Text</label>
                        <input
                          type="text"
                          value={slide.ctaText || ''}
                          onChange={e => setSlide(slide.id, { ctaText: e.target.value })}
                          placeholder="e.g. Shop Now"
                          style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...label, marginBottom: '4px' }}>Button URL</label>
                        <input
                          type="text"
                          value={slide.ctaUrl || ''}
                          onChange={e => setSlide(slide.id, { ctaUrl: e.target.value })}
                          placeholder="/catalog or https://…"
                          style={{ ...inputStyle, padding: '8px 10px', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {config.promotional.slides.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
              ⠿ Drag the handle to reorder · 📷 Click thumbnail to upload image
            </div>
          )}
        </div>
      </div>

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '40px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '12px 32px', background: saving ? '#e5e7eb' : '#FF6B00', color: saving ? '#9ca3af' : '#fff', border: 'none', borderRadius: '12px', fontFamily: 'inherit', fontWeight: 800, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 16px rgba(255,107,0,0.35)', transition: 'all 0.2s' }}
        >
          {saving ? '⏳ Saving…' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  )
}
