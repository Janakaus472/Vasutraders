'use client'

import { useState, useEffect, useRef } from 'react'

interface HomeCategoryItem {
  name: string
  emoji: string
  visible: boolean
}

type PreviewMode = 'mobile' | 'desktop'

const EMOJI_SUGGESTIONS = ['📦','🃏','🎈','🔮','🏏','🔁','🎰','🪥','⚗️','🛍️','🧴','🧹','🪣','🧲','🔧','🎯','🎪','🎭','🛒','🏷️','🎁','💊','🧸','🪆','🖊️','📏','✂️','🪡','🧶','🍭','🥤','🧃','🌿','🪴','💡']

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

  // DnD state
  const dragIndex = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

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

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
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
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  const toggleVisible = (name: string) => {
    setItems(prev => prev.map(i => i.name === name ? { ...i, visible: !i.visible } : i))
  }

  const openEmojiEdit = (name: string, current: string) => {
    setEditingEmoji(name)
    setEmojiInput(current)
  }

  const applyEmoji = (name: string, emoji: string) => {
    if (!emoji.trim()) return
    setItems(prev => prev.map(i => i.name === name ? { ...i, emoji: emoji.trim() } : i))
    setEditingEmoji(null)
  }

  // ── Drag handlers ──
  const onDragStart = (index: number) => {
    dragIndex.current = index
  }

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOver(index)
  }

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null || from === dropIndex) { setDragOver(null); return }
    const updated = [...items]
    const [moved] = updated.splice(from, 1)
    updated.splice(dropIndex, 0, moved)
    setItems(updated)
    dragIndex.current = null
    setDragOver(null)
  }

  const onDragEnd = () => {
    dragIndex.current = null
    setDragOver(null)
  }

  const visibleItems = items.filter(i => i.visible)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-4xl">🏠</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Home Layout</h1>
          <p className="text-gray-400 text-sm mt-0.5">Drag categories to reorder · toggle eye to show/hide · click emoji to change it</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
        >
          {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      {dbMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <p className="font-bold text-amber-700 mb-2">⚠️ One-time setup required</p>
          <p className="text-sm text-amber-600 mb-3">Run this SQL in your Supabase dashboard (SQL Editor) to create the settings table:</p>
          <pre className="bg-amber-100 rounded-xl p-3 text-xs text-amber-900 overflow-x-auto select-all">{`CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
          <p className="text-xs text-amber-500 mt-2">After running that SQL, refresh this page.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between mb-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <style>{`
          @media (min-width: 1100px) { .hl-grid { grid-template-columns: 1fr 420px !important; } }
          .drag-item { cursor: grab; transition: opacity 0.15s, transform 0.15s; }
          .drag-item:active { cursor: grabbing; }
          .drag-item.dragging { opacity: 0.4; }
          .drag-item.drag-target { transform: translateY(-2px); box-shadow: 0 0 0 2px #f97316, 0 4px 16px rgba(249,115,22,0.2); }
        `}</style>

        <div className="hl-grid" style={{ display: 'grid', gap: '24px' }}>

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
                  {items.map((item, index) => (
                    <div
                      key={item.name}
                      className={`drag-item ${dragOver === index ? 'drag-target' : ''}`}
                      draggable
                      onDragStart={() => onDragStart(index)}
                      onDragOver={e => onDragOver(e, index)}
                      onDrop={e => onDrop(e, index)}
                      onDragEnd={onDragEnd}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px',
                        borderBottom: index < items.length - 1 ? '1px solid #f5f5f5' : 'none',
                        background: dragOver === index ? '#fff7ed' : item.visible ? '#fff' : '#fafafa',
                        opacity: item.visible ? 1 : 0.55,
                      }}
                    >
                      {/* Drag handle */}
                      <div style={{ color: '#d1d5db', cursor: 'grab', flexShrink: 0, padding: '4px' }}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                          <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                          <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                        </svg>
                      </div>

                      {/* Position badge */}
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#d1d5db', width: '18px', textAlign: 'center', flexShrink: 0 }}>
                        {index + 1}
                      </span>

                      {/* Emoji button */}
                      {editingEmoji === item.name ? (
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
                        </div>
                      ) : (
                        <button
                          onClick={() => openEmojiEdit(item.name, item.emoji)}
                          title="Click to change emoji"
                          style={{ fontSize: '28px', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '4px 8px', cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}
                        >
                          {item.emoji}
                        </button>
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
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          transition: 'background 0.15s',
                        }}
                      >
                        {item.visible ? '👁️' : '🚫'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Emoji suggestions */}
            {editingEmoji && (
              <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-4 mt-3">
                <p className="text-xs font-bold text-gray-500 mb-2">Quick pick:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {EMOJI_SUGGESTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => applyEmoji(editingEmoji, e)}
                      style={{ fontSize: '22px', padding: '4px', background: 'none', border: '1.5px solid transparent', borderRadius: '8px', cursor: 'pointer' }}
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

          {/* ── RIGHT: Preview ── */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Preview tab toggle */}
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
                      transition: 'all 0.15s',
                    }}
                  >
                    {m === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
                  </button>
                ))}
              </div>

              {/* Preview frame */}
              <div style={{ padding: '16px', background: '#f9f9f9', minHeight: '300px' }}>
                <div style={{
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  padding: '20px 12px',
                  ...(previewMode === 'desktop' ? { maxWidth: '100%' } : { maxWidth: '360px', margin: '0 auto' }),
                }}>
                  {/* Section header */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '1px', fontFamily: 'serif' }}>
                      Shop by Category
                    </div>
                    <div style={{ width: '32px', height: '3px', background: '#DC2626', margin: '6px auto 4px', borderRadius: '2px' }} />
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>Tap a category to browse products</div>
                  </div>

                  {/* Category grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: previewMode === 'desktop'
                      ? 'repeat(auto-fill, minmax(100px, 1fr))'
                      : 'repeat(2, 1fr)',
                    gap: '8px',
                  }}>
                    {visibleItems.map(item => (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          background: '#fff', borderRadius: '10px', padding: previewMode === 'desktop' ? '16px 8px' : '14px 8px',
                          border: '1.5px solid #f0f0f0', textAlign: 'center',
                          minHeight: previewMode === 'desktop' ? '90px' : '80px',
                        }}
                      >
                        <div style={{ fontSize: previewMode === 'desktop' ? '28px' : '24px', lineHeight: 1, marginBottom: '6px' }}>
                          {item.emoji}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: previewMode === 'desktop' ? '11px' : '10px', color: '#1a1a1a', lineHeight: 1.2 }}>
                          {item.name}
                        </div>
                      </div>
                    ))}

                    {/* View All tile */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: '#B91C1C', borderRadius: '10px', padding: '14px 8px',
                      border: '1.5px solid #B91C1C', textAlign: 'center',
                      minHeight: previewMode === 'desktop' ? '90px' : '80px',
                    }}>
                      <div style={{ fontSize: '20px', lineHeight: 1, marginBottom: '6px', color: '#FAC41A' }}>≡</div>
                      <div style={{ fontWeight: 700, fontSize: '10px', color: '#fff', lineHeight: 1.2 }}>View All</div>
                    </div>
                  </div>

                  {visibleItems.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', padding: '16px' }}>
                      No categories visible — toggle the eye on the left
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 text-xs text-gray-400 space-y-1 px-1">
              <div className="flex items-center gap-2"><span>⠿</span> Drag the handle to reorder</div>
              <div className="flex items-center gap-2"><span>😀</span> Click emoji to change it</div>
              <div className="flex items-center gap-2"><span>👁️</span> Toggle to show/hide on home page</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
