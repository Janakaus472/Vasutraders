'use client'

import { useState, useEffect, useRef } from 'react'
import { CategoryWithSubs, Category } from '@/lib/supabase/categories'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add main category
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  // Add subcategory
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState('')
  const [addingSub, setAddingSub] = useState(false)

  // Rename
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const subInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCategories(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load categories')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (addingSubFor && subInputRef.current) subInputRef.current.focus() }, [addingSubFor])
  useEffect(() => { if (renamingId && renameInputRef.current) renameInputRef.current.focus() }, [renamingId])

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    setAddingCat(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), parent_id: null }),
      })
      const cat = await res.json()
      if (!res.ok) throw new Error(cat.error)
      setCategories(prev => [...prev, { ...cat, subcategories: [] }])
      setNewCatName('')
    } catch (e: any) { setError(e.message) }
    setAddingCat(false)
  }

  const handleAddSub = async (parentId: string) => {
    if (!newSubName.trim()) return
    setAddingSub(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubName.trim(), parent_id: parentId }),
      })
      const sub = await res.json()
      if (!res.ok) throw new Error(sub.error)
      setCategories(prev => prev.map(c =>
        c.id === parentId ? { ...c, subcategories: [...c.subcategories, sub] } : c
      ))
      setNewSubName('')
      setAddingSubFor(null)
    } catch (e: any) { setError(e.message) }
    setAddingSub(false)
  }

  const handleRename = async (id: string, isMain: boolean) => {
    if (!renameVal.trim()) { setRenamingId(null); return }
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: renameVal.trim() }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      if (isMain) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: renameVal.trim() } : c))
      } else {
        setCategories(prev => prev.map(c => ({
          ...c,
          subcategories: c.subcategories.map(s => s.id === id ? { ...s, name: renameVal.trim() } : s)
        })))
      }
    } catch (e: any) { setError(e.message) }
    setRenamingId(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setCategories(prev =>
        prev
          .filter(c => c.id !== id)
          .map(c => ({ ...c, subcategories: c.subcategories.filter(s => s.id !== id) }))
      )
    } catch (e: any) { setError(e.message) }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Categories</h1>
        <p className="text-gray-400 text-sm mt-0.5">Create and manage product categories and subcategories</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Add new category */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-gray-700 text-sm mb-3">Add New Category</h2>
        <div className="flex gap-2">
          <input
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="e.g. Hardware, Plastics, Tools…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 text-sm"
            style={{ fontSize: '16px' }}
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCatName.trim() || addingCat}
            className="px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors text-sm"
          >
            {addingCat ? '…' : 'Add'}
          </button>
        </div>
      </div>

      {/* Category list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🏷️</div>
          <p>No categories yet — add one above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Main category row */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-lg">🏷️</span>
                {renamingId === cat.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onBlur={() => handleRename(cat.id, true)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(cat.id, true); if (e.key === 'Escape') setRenamingId(null) }}
                    className="flex-1 border border-orange-300 rounded-lg px-3 py-1.5 text-sm outline-none font-semibold"
                    style={{ fontSize: '16px' }}
                  />
                ) : (
                  <span className="flex-1 font-bold text-gray-800">{cat.name}</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setAddingSubFor(addingSubFor === cat.id ? null : cat.id); setNewSubName('') }}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    + Sub
                  </button>
                  <button
                    onClick={() => { setRenamingId(cat.id); setRenameVal(cat.name) }}
                    className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Rename"
                  >✏️</button>
                  {confirmDeleteId === cat.id ? (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {deletingId === cat.id ? '…' : 'Delete?'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >🗑️</button>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              <div className="divide-y divide-gray-50">
                {cat.subcategories.map(sub => (
                  <div key={sub.id} className="flex items-center gap-3 px-4 py-2.5 pl-10">
                    <span className="text-gray-300 text-xs">↳</span>
                    {renamingId === sub.id ? (
                      <input
                        ref={renameInputRef}
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={() => handleRename(sub.id, false)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRename(sub.id, false); if (e.key === 'Escape') setRenamingId(null) }}
                        className="flex-1 border border-orange-300 rounded-lg px-3 py-1 text-sm outline-none"
                        style={{ fontSize: '16px' }}
                      />
                    ) : (
                      <span className="flex-1 text-sm text-gray-600">{sub.name}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setRenamingId(sub.id); setRenameVal(sub.name) }}
                        className="p-1.5 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors text-xs"
                        title="Rename"
                      >✏️</button>
                      {confirmDeleteId === sub.id ? (
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deletingId === sub.id}
                          className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === sub.id ? '…' : 'Delete?'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(sub.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs"
                          title="Delete"
                        >🗑️</button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add subcategory inline */}
                {addingSubFor === cat.id && (
                  <div className="flex items-center gap-2 px-4 py-3 pl-10 bg-blue-50/50">
                    <span className="text-gray-300 text-xs">↳</span>
                    <input
                      ref={subInputRef}
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSub(cat.id); if (e.key === 'Escape') setAddingSubFor(null) }}
                      placeholder="Subcategory name…"
                      className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      onClick={() => handleAddSub(cat.id)}
                      disabled={!newSubName.trim() || addingSub}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      {addingSub ? '…' : 'Add'}
                    </button>
                    <button onClick={() => setAddingSubFor(null)} className="p-2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                  </div>
                )}

                {cat.subcategories.length === 0 && addingSubFor !== cat.id && (
                  <div className="px-10 py-2 text-xs text-gray-300">No subcategories — click "+ Sub" to add</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
