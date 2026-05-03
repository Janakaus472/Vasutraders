'use client'

import { useState, useEffect, useRef } from 'react'

interface HomeCategoryItem {
  name: string
  emoji: string
  visible: boolean
  imageUrl?: string
}

type PreviewMode = 'mobile' | 'desktop'

const EMOJI_SUGGESTIONS = ['📦','🃏','🎈','🔮','🏏','🔁','🎰','🪥','⚗️','🛍️','🧴','🧹','🪣','🧲','🔧','🎯','🎪','🎭','🛒','🏷️','🎁','💊','🧸','🪆','🖊️','📏','✂️','🧶','🍭','🥤','🧃','🌿','🪴','💡']

export default function HomeLayoutPage() {
  const [items, setItems] = useState<HomeCategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('mobile')
  const [editingEmoji, setEditingEmoji] = useState<string | null>(null)
  const [emojiInput, setEmojiInput] = useState('')
  const [dbMissing, setDbMissing] = useState(false)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetRef = useRef<string | null>(null)

  // Pointer-based DnD (works on mouse + touch)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const dragIdx = useRef<number | null>(null)
  const dropIdx = useRef<number | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    fetch('/api/admin/home-layout')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          if (data.error.includes('does not exist') || data.error.includes('relation')) setDbMissing(true)
          else setError(data.error)
        } else {
          setItems(data)
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Attach window pointermove/pointerup while dragging
  useEffect(() => {
    if (dragIndex === null) return

    const onMove = (e: PointerEvent) => {
      const y = e.clientY
      let newDrop = dragIdx.current ?? 0
      for (let i = 0; i < itemRefs.current.length; i++) {
        const el = itemRefs.current[i]
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (y < rect.top + rect.height / 2) { newDrop = i; break }
        newDrop = i
      }
      dropIdx.current = newDrop
      setDropIndex(newDrop)
    }

    const onUp = () => {
      const from = dragIdx.current
      const to = dropIdx.current
      if (from !== null && to !== null && from !== to) {
        setItems(prev => {
          const updated = [...prev]
          const [moved] = updated.splice(from, 1)
          updated.splice(to, 0, moved)
          return updated
        })
      }
      dragIdx.current = null
      dropIdx.current = null
      setDragIndex(null)
      setDropIndex(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragIndex])

  const startDrag = (e: React.PointerEvent, index: number) => {
    e.preventDefault()
    dragIdx.current = index
    dropIdx.current = index
    setDragIndex(index)
    setDropIndex(index)
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/home-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.includes('does not exist') || data.error?.includes('relation')) setDbMissing(true)
        else throw new Error(data.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const toggleVisible = (name: string) =>
    setItems(prev => prev.map(i => i.name === name ? { ...i, visible: !i.visible } : i))

  const applyEmoji = (name: string, emoji: string) => {
    if (!emoji.trim()) return
    setItems(prev => prev.map(i => i.name === name ? { ...i, emoji: emoji.trim() } : i))
    setEditingEmoji(null)
  }

  const openThumbnailPicker = (name: string) => {
    uploadTargetRef.current = name
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const name = uploadTargetRef.current
    if (!file || !name) return
    e.target.value = ''

    setUploadingFor(name)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems(prev => prev.map(i => i.name === name ? { ...i, imageUrl: data.url } : i))
    } catch (e: any) {
      setError(e.message)
    }
    setUploadingFor(null)
  }

  const removeThumbnail = (name: string) =>
    setItems(prev => prev.map(i => i.name === name ? { ...i, imageUrl: undefined } : i))

  const visibleItems = items.filter(i => i.visible)
  const isDragging = dragIndex !== null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-4xl">🏠</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", userSelect: isDragging ? 'none' : 'auto' }}>
      {/* Hidden file input for thumbnail upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <style>{`
        @media (min-width: 1100px) { .hl-grid { grid-template-columns: 1fr 420px !important; } }
        .drag-handle { cursor: grab; touch-action: none; }
        .drag-handle:active { cursor: grabbing; }
      `}</style>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Home Layout</h1>
          <p className="text-gray-400 text-sm mt-0.5">Hold the ⠿ handle to drag &amp; reorder · 👁️ to show/hide · click emoji to change</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
          >
            {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
          </button>
          {saved && (
            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
              ✓ Live on vasutraders.com
            </span>
          )}
        </div>
      </div>

      {dbMissing && (
        <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
          <p style={{ fontWeight: 800, color: '#92400e', marginBottom: '8px', fontSize: '15px' }}>⚠️ One-time Supabase setup needed</p>
          <p style={{ fontSize: '13px', color: '#78350f', marginBottom: '12px' }}>Open your <strong>Supabase dashboard → SQL Editor</strong> and run this query, then refresh:</p>
          <pre style={{ background: '#fde68a', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#451a03', overflowX: 'auto', cursor: 'text', userSelect: 'all' }}>{`CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between mb-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      <div className="hl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

        {/* ── LEFT: Drag list ── */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-600">Categories ({items.length})</span>
              <span className="text-xs text-gray-400">{visibleItems.length} visible on home</span>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <div className="text-4xl mb-2">🏷️</div>
                <p>No categories found</p>
              </div>
            ) : (
              <div>
                {items.map((item, index) => {
                  const isBeingDragged = dragIndex === index
                  const isDropTarget = dropIndex === index && dragIndex !== null && dragIndex !== index
                  const insertAbove = isDropTarget && dropIndex! < dragIndex!
                  const insertBelow = isDropTarget && dropIndex! > dragIndex!

                  return (
                    <div
                      key={item.name}
                      ref={el => { itemRefs.current[index] = el }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '11px 16px',
                        borderBottom: index < items.length - 1 ? '1px solid #f5f5f5' : 'none',
                        background: isBeingDragged ? '#fff7ed' : '#fff',
                        opacity: isBeingDragged ? 0.45 : item.visible ? 1 : 0.5,
                        borderTop: insertAbove ? '2px solid #f97316' : '2px solid transparent',
                        borderBottomColor: insertBelow ? '#f97316' : (index < items.length - 1 ? '#f5f5f5' : 'transparent'),
                        transition: 'border-color 0.1s',
                      }}
                    >
                      {/* Drag handle */}
                      <div
                        className="drag-handle"
                        onPointerDown={e => startDrag(e, index)}
                        style={{ color: '#c4c4c4', flexShrink: 0, padding: '4px 6px', borderRadius: '6px' }}
                      >
                        <svg width="14" height="20" fill="currentColor" viewBox="0 0 14 20">
                          <circle cx="4" cy="4" r="2"/><circle cx="10" cy="4" r="2"/>
                          <circle cx="4" cy="10" r="2"/><circle cx="10" cy="10" r="2"/>
                          <circle cx="4" cy="16" r="2"/><circle cx="10" cy="16" r="2"/>
                        </svg>
                      </div>

                      {/* Position number */}
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#d1d5db', width: '16px', textAlign: 'center', flexShrink: 0 }}>
                        {index + 1}
                      </span>

                      {/* Thumbnail */}
                      <div style={{ flexShrink: 0, position: 'relative' }}>
                        <button
                          onClick={() => openThumbnailPicker(item.name)}
                          title="Click to upload category thumbnail"
                          style={{
                            width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden',
                            border: '2px dashed #e5e7eb', background: '#f9fafb',
                            cursor: 'pointer', padding: 0, position: 'relative', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {uploadingFor === item.name ? (
                            <span style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>⏳</span>
                          ) : item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '26px', lineHeight: 1 }}>{item.emoji}</span>
                          )}
                          {/* Camera overlay on hover */}
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transition: 'opacity 0.15s',
                            borderRadius: '8px',
                          }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                          >
                            <span style={{ fontSize: '18px' }}>📷</span>
                          </div>
                        </button>
                        {item.imageUrl && (
                          <button
                            onClick={() => removeThumbnail(item.name)}
                            title="Remove thumbnail"
                            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: '#fff', border: '2px solid #fff', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, lineHeight: 1 }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Emoji (only shown when no image) */}
                      {!item.imageUrl && (
                        editingEmoji === item.name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <input
                              autoFocus
                              value={emojiInput}
                              onChange={e => setEmojiInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') applyEmoji(item.name, emojiInput)
                                if (e.key === 'Escape') setEditingEmoji(null)
                              }}
                              style={{ width: '52px', fontSize: '22px', textAlign: 'center', padding: '4px', border: '2px solid #f97316', borderRadius: '8px', outline: 'none' }}
                            />
                            <button onClick={() => applyEmoji(item.name, emojiInput)} style={{ fontSize: '11px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontWeight: 700 }}>OK</button>
                            <button onClick={() => setEditingEmoji(null)} style={{ fontSize: '11px', color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingEmoji(item.name); setEmojiInput(item.emoji) }}
                            title="Click to change emoji (used as fallback if no image)"
                            style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, flexShrink: 0, padding: '2px', opacity: 0.5 }}
                          >
                            {item.emoji}
                          </button>
                        )
                      )}

                      {/* Name */}
                      <span style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: item.visible ? '#1a1a1a' : '#9ca3af' }}>
                        {item.name}
                      </span>

                      {/* Visibility toggle */}
                      <button
                        onClick={() => toggleVisible(item.name)}
                        title={item.visible ? 'Hide from home page' : 'Show on home page'}
                        style={{
                          flexShrink: 0,
                          background: item.visible ? '#dcfce7' : '#f3f4f6',
                          border: 'none', borderRadius: '8px',
                          padding: '6px 10px', cursor: 'pointer', fontSize: '15px',
                        }}
                      >
                        {item.visible ? '👁️' : '🙈'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Emoji quick-pick panel */}
          {editingEmoji && (
            <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-4 mt-3">
              <p className="text-xs font-bold text-gray-500 mb-2">Quick pick:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {EMOJI_SUGGESTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => applyEmoji(editingEmoji, e)}
                    style={{ fontSize: '22px', padding: '4px 6px', background: 'none', border: '1.5px solid transparent', borderRadius: '8px', cursor: 'pointer' }}
                    onMouseEnter={ev => (ev.currentTarget.style.borderColor = '#f97316')}
                    onMouseLeave={ev => (ev.currentTarget.style.borderColor = 'transparent')}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live preview ── */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
              {(['mobile', 'desktop'] as PreviewMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setPreviewMode(m)}
                  style={{
                    flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    background: previewMode === m ? '#fff7ed' : '#fff',
                    color: previewMode === m ? '#f97316' : '#9ca3af',
                    borderBottom: previewMode === m ? '2px solid #f97316' : '2px solid transparent',
                  }}
                >
                  {m === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
                </button>
              ))}
            </div>

            <div style={{ padding: '16px', background: '#f9f9f9', minHeight: '300px' }}>
              <div style={{
                padding: '20px 12px',
                ...(previewMode === 'desktop' ? {} : { maxWidth: '320px', margin: '0 auto' }),
              }}>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '1px' }}>Shop by Category</div>
                  <div style={{ width: '32px', height: '3px', background: '#DC2626', margin: '5px auto', borderRadius: '2px' }} />
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: previewMode === 'desktop' ? 'repeat(auto-fill, minmax(90px, 1fr))' : 'repeat(2, 1fr)',
                  gap: '8px',
                }}>
                  {visibleItems.map(item => (
                    <div key={item.name} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: '#fff', borderRadius: '10px', padding: '10px 8px',
                      border: '1.5px solid #f0f0f0', textAlign: 'center', minHeight: '80px',
                    }}>
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', marginBottom: '6px' }} />
                        : <div style={{ fontSize: '26px', lineHeight: 1, marginBottom: '6px' }}>{item.emoji}</div>
                      }
                      <div style={{ fontWeight: 700, fontSize: '10px', color: '#1a1a1a', lineHeight: 1.2 }}>{item.name}</div>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: '#B91C1C', borderRadius: '10px', padding: '14px 8px',
                    border: '1.5px solid #B91C1C', textAlign: 'center', minHeight: '80px',
                  }}>
                    <div style={{ fontSize: '20px', color: '#FAC41A', marginBottom: '4px' }}>☰</div>
                    <div style={{ fontWeight: 700, fontSize: '10px', color: '#fff' }}>View All</div>
                  </div>
                </div>
                {visibleItems.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', padding: '16px' }}>
                    No categories visible
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 px-1 space-y-1.5" style={{ fontSize: '12px', color: '#9ca3af' }}>
            <div>⠿ Hold the dots to drag and reorder</div>
            <div>📷 Click the thumbnail to upload a category image</div>
            <div>😀 Click the emoji to change it (used if no image)</div>
            <div>👁️ / 🙈 Toggle visibility on home page</div>
            <div style={{ marginTop: '8px', padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#15803d', lineHeight: 1.6 }}>
              <strong>Recommended thumbnail size:</strong><br />
              400 × 400 px · Square · JPG or PNG or WebP · under 500 KB
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
