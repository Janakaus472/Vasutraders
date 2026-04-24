'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CategoryWithSubs, Category } from '@/lib/supabase/categories'
import { Product } from '@/types/product'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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

  // Product arrangement
  const [arrangeSub, setArrangeSub] = useState<{ category: string; subcategory: string } | null>(null)
  const [arrangeProducts, setArrangeProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [savingProducts, setSavingProducts] = useState(false)

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

  // ── Reorder helpers ──

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= categories.length) return
    const updated = [...categories]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setCategories(updated)

    setSaving(true)
    try {
      const updates = updated.map((c, i) => ({ id: c.id, display_order: i }))
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error((await res.json()).error)
    } catch (e: any) { setError(e.message); load() }
    setSaving(false)
  }

  const moveSubcategory = async (catId: string, subIndex: number, direction: 'up' | 'down') => {
    const cat = categories.find(c => c.id === catId)
    if (!cat) return
    const newIndex = direction === 'up' ? subIndex - 1 : subIndex + 1
    if (newIndex < 0 || newIndex >= cat.subcategories.length) return

    const updatedSubs = [...cat.subcategories]
    const [moved] = updatedSubs.splice(subIndex, 1)
    updatedSubs.splice(newIndex, 0, moved)
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, subcategories: updatedSubs } : c))

    setSaving(true)
    try {
      const updates = updatedSubs.map((s, i) => ({ id: s.id, display_order: i }))
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error((await res.json()).error)
    } catch (e: any) { setError(e.message); load() }
    setSaving(false)
  }

  // ── Product arrangement ──

  const loadProducts = async (category: string, subcategory: string) => {
    setLoadingProducts(true)
    try {
      const res = await fetch(`/api/admin/products?action=get_by_subcategory&category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setArrangeProducts(data)
    } catch (e: any) { setError(e.message) }
    setLoadingProducts(false)
  }

  const openArrangeProducts = (categoryName: string, subcategoryName: string) => {
    setArrangeSub({ category: categoryName, subcategory: subcategoryName })
    loadProducts(categoryName, subcategoryName)
  }

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= arrangeProducts.length) return
    const updated = [...arrangeProducts]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setArrangeProducts(updated)
  }

  const saveProductOrder = async () => {
    setSavingProducts(true)
    try {
      const updates = arrangeProducts.map((p, i) => ({ id: p.id, displayOrder: i }))
      const res = await fetch('/api/admin/products?action=reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setArrangeSub(null)
      setArrangeProducts([])
    } catch (e: any) { setError(e.message) }
    setSavingProducts(false)
  }

  const ArrowUp = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  )
  const ArrowDown = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
  )

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Categories</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage categories, subcategories, and their display order</p>
      </div>

      {saving && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-blue-600 text-sm flex items-center gap-2">
          <span className="animate-spin text-xs">&#9696;</span> Saving order...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
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
            placeholder="e.g. Hardware, Plastics, Tools..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400 text-sm"
            style={{ fontSize: '16px' }}
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCatName.trim() || addingCat}
            className="px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors text-sm"
          >
            {addingCat ? '...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Category list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">&#127991;</div>
          <p>No categories yet - add one above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, catIndex) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Main category row */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                {/* Reorder arrows for main category */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCategory(catIndex, 'up')}
                    disabled={catIndex === 0 || saving}
                    className="p-0.5 text-gray-400 hover:text-orange-500 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ArrowUp />
                  </button>
                  <button
                    onClick={() => moveCategory(catIndex, 'down')}
                    disabled={catIndex === categories.length - 1 || saving}
                    className="p-0.5 text-gray-400 hover:text-orange-500 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ArrowDown />
                  </button>
                </div>

                <span className="text-sm font-bold text-gray-300 w-5 text-center">{catIndex + 1}</span>
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
                  >&#9999;&#65039;</button>
                  {confirmDeleteId === cat.id ? (
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {deletingId === cat.id ? '...' : 'Delete?'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >&#128465;&#65039;</button>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              <div className="divide-y divide-gray-50">
                {cat.subcategories.map((sub, subIndex) => (
                  <div key={sub.id} className="flex items-center gap-2 px-4 py-2.5 pl-8">
                    {/* Reorder arrows for subcategory */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveSubcategory(cat.id, subIndex, 'up')}
                        disabled={subIndex === 0 || saving}
                        className="p-0.5 text-gray-300 hover:text-blue-500 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <ArrowUp />
                      </button>
                      <button
                        onClick={() => moveSubcategory(cat.id, subIndex, 'down')}
                        disabled={subIndex === cat.subcategories.length - 1 || saving}
                        className="p-0.5 text-gray-300 hover:text-blue-500 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <ArrowDown />
                      </button>
                    </div>

                    <span className="text-xs text-gray-300 w-4 text-center">{subIndex + 1}</span>
                    <span className="text-gray-300 text-xs">&#8627;</span>
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
                        onClick={() => openArrangeProducts(cat.name, sub.name)}
                        className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Arrange products in this subcategory"
                      >
                        Arrange
                      </button>
                      <button
                        onClick={() => { setRenamingId(sub.id); setRenameVal(sub.name) }}
                        className="p-1.5 text-gray-300 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors text-xs"
                        title="Rename"
                      >&#9999;&#65039;</button>
                      {confirmDeleteId === sub.id ? (
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deletingId === sub.id}
                          className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingId === sub.id ? '...' : 'Delete?'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(sub.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs"
                          title="Delete"
                        >&#128465;&#65039;</button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add subcategory inline */}
                {addingSubFor === cat.id && (
                  <div className="flex items-center gap-2 px-4 py-3 pl-10 bg-blue-50/50">
                    <span className="text-gray-300 text-xs">&#8627;</span>
                    <input
                      ref={subInputRef}
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSub(cat.id); if (e.key === 'Escape') setAddingSubFor(null) }}
                      placeholder="Subcategory name..."
                      className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      onClick={() => handleAddSub(cat.id)}
                      disabled={!newSubName.trim() || addingSub}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      {addingSub ? '...' : 'Add'}
                    </button>
                    <button onClick={() => setAddingSubFor(null)} className="p-2 text-gray-400 hover:text-gray-600 text-xs">&#10005;</button>
                  </div>
                )}

                {cat.subcategories.length === 0 && addingSubFor !== cat.id && (
                  <div className="px-10 py-2 text-xs text-gray-300">No subcategories - click &quot;+ Sub&quot; to add</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Product Arrangement Modal ── */}
      {arrangeSub && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setArrangeSub(null); setArrangeProducts([]) }}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Arrange Products</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {arrangeSub.category} &rarr; {arrangeSub.subcategory}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Use arrows to set the display order on the website
              </p>
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingProducts ? (
                <div className="text-center py-8 text-gray-400">Loading products...</div>
              ) : arrangeProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">&#128230;</div>
                  <p>No products in this subcategory</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {arrangeProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                    >
                      {/* Reorder arrows */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveProduct(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 text-gray-400 hover:text-green-600 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp />
                        </button>
                        <button
                          onClick={() => moveProduct(index, 'down')}
                          disabled={index === arrangeProducts.length - 1}
                          className="p-0.5 text-gray-400 hover:text-green-600 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowDown />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-gray-300 w-5 text-center">{index + 1}</span>

                      {/* Product image */}
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          N/A
                        </div>
                      )}

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">{product.name}</div>
                        <div className="text-xs text-gray-400">
                          &#8377;{product.pricePerUnit}/{product.unit}
                          {!product.inStock && <span className="ml-2 text-red-400">(Hidden)</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={() => { setArrangeSub(null); setArrangeProducts([]) }}
                className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProductOrder}
                disabled={savingProducts || arrangeProducts.length === 0}
                className="px-6 py-2.5 text-sm font-bold bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white rounded-xl transition-colors"
              >
                {savingProducts ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
