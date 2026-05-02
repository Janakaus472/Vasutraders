'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types/product'
import { getProducts } from '@/lib/supabase/products'
import { UNITS } from '@/lib/categories'

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isBulkMode = searchParams.get('bulk') === '1'
  const filterParam = searchParams.get('filter')

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [bulkMode, setBulkMode] = useState(isBulkMode)
  const [bulkPrices, setBulkPrices] = useState<Record<string, string>>({})
  const [savingBulk, setSavingBulk] = useState(false)
  const [bulkSaved, setBulkSaved] = useState(false)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editPriceVal, setEditPriceVal] = useState('')
  const [editNameVal, setEditNameVal] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkActing, setBulkActing] = useState(false)
  const priceInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts(true)
      setProducts(data)
      const prices: Record<string, string> = {}
      data.forEach(p => { prices[p.id] = p.pricePerUnit ? String(p.pricePerUnit) : '' })
      setBulkPrices(prices)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (isBulkMode) setBulkMode(true) }, [isBulkMode])
  useEffect(() => { if (editingPriceId && priceInputRef.current) priceInputRef.current.focus() }, [editingPriceId])
  useEffect(() => { if (editingNameId && nameInputRef.current) nameInputRef.current.focus() }, [editingNameId])

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => !!c)))]
  const units = ['all', ...Array.from(new Set(products.map(p => p.unit).filter(Boolean)))]

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter
    const matchUnit = unitFilter === 'all' || p.unit === unitFilter
    const matchFilter =
      filterParam === 'noprice' ? (!p.pricePerUnit || p.pricePerUnit === 0) :
      filterParam === 'nocategory' ? !p.category :
      true
    return matchSearch && matchCat && matchUnit && matchFilter
  })

  const adminPatch = (body: object) =>
    fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

  // Inline price save
  const savePriceInline = async (id: string) => {
    const val = parseFloat(editPriceVal)
    if (isNaN(val) || val < 0) { setEditingPriceId(null); return }
    setSavingId(id)
    setSaveError(null)
    try {
      const res = await adminPatch({ id, priceOnly: true, price: val })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`) }
      setProducts(prev => prev.map(p => p.id === id ? { ...p, pricePerUnit: val } : p))
      setBulkPrices(prev => ({ ...prev, [id]: String(val) }))
    } catch (e: any) {
      setSaveError(`Failed to save price: ${e.message}`)
    }
    setEditingPriceId(null)
    setSavingId(null)
  }

  // Inline name save
  const saveNameInline = async (id: string) => {
    const name = editNameVal.trim()
    if (!name) { setEditingNameId(null); return }
    setSavingId(id)
    setSaveError(null)
    try {
      const res = await adminPatch({ id, name })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`) }
      setProducts(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    } catch (e: any) {
      setSaveError(`Failed to save name: ${e.message}`)
    }
    setEditingNameId(null)
    setSavingId(null)
  }

  // Toggle status
  const toggleStatus = async (product: Product) => {
    const inStock = !product.inStock
    setSaveError(null)
    try {
      const res = await adminPatch({ id: product.id, inStock })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`) }
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, inStock } : p))
    } catch (e: any) {
      setSaveError(`Failed to update status: ${e.message}`)
    }
  }

  // Delete
  const handleDelete = async (id: string) => {
    setSavingId(id)
    setSaveError(null)
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`) }
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e: any) {
      setSaveError(`Failed to delete: ${e.message}`)
    }
    setConfirmDeleteId(null)
    setSavingId(null)
  }

  // Duplicate
  const handleDuplicate = async (product: Product) => {
    setSavingId(product.id)
    setSaveError(null)
    try {
      const res = await fetch(`/api/admin/products?action=duplicate&id=${product.id}`, { method: 'POST' })
      const newProduct = await res.json()
      if (!res.ok) throw new Error(newProduct.error || `HTTP ${res.status}`)
      setProducts(prev => [...prev, newProduct])
      setBulkPrices(prev => ({ ...prev, [newProduct.id]: String(newProduct.pricePerUnit || '') }))
    } catch (e: any) {
      setSaveError(`Failed to duplicate: ${e.message}`)
    }
    setSavingId(null)
  }

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const selectAllFiltered = () => {
    setSelectedIds(new Set(filtered.map(p => p.id)))
  }
  const clearSelection = () => setSelectedIds(new Set())

  // Bulk actions on selected products
  const bulkAction = async (action: 'delete' | 'out_of_stock' | 'available') => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    setBulkActing(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/admin/products?action=bulk_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`) }
      if (action === 'delete') {
        setProducts(prev => prev.filter(p => !selectedIds.has(p.id)))
      } else {
        const inStock = action === 'available'
        setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, inStock } : p))
      }
      setSelectedIds(new Set())
    } catch (e: any) {
      setSaveError(`Bulk action failed: ${e.message}`)
    }
    setBulkActing(false)
  }

  // Bulk save
  const saveBulkPrices = async () => {
    setSavingBulk(true)
    setSaveError(null)
    const updates = Object.entries(bulkPrices)
      .map(([id, val]) => ({ id, price: parseFloat(val) }))
      .filter(u => !isNaN(u.price) && u.price >= 0)
    try {
      const res = await fetch('/api/admin/products?action=bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `HTTP ${res.status}`) }
      setProducts(prev => prev.map(p => {
        const u = updates.find(u => u.id === p.id)
        return u ? { ...p, pricePerUnit: u.price } : p
      }))
      setBulkSaved(true)
      setTimeout(() => setBulkSaved(false), 2000)
    } catch (e: any) {
      setSaveError(`Failed to save prices: ${e.message}`)
    }
    setSavingBulk(false)
  }

  const active = products.filter(p => p.inStock).length

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <span className="text-red-700 text-sm font-medium">⚠️ {saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-400 text-sm">{products.length} total · {active} active · {products.length - active} hidden</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setBulkMode(b => !b); if (isBulkMode) router.replace('/admin/products') }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${bulkMode ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}
          >
            💰 {bulkMode ? 'Exit Bulk Edit' : 'Bulk Price Edit'}
          </button>
          <Link href="/admin/products/bulk-upload"
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-1">
            📤 Bulk Upload
          </Link>
          <Link href="/admin/products/new"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-1">
            ➕ Add Product
          </Link>
        </div>
      </div>

      {/* Bulk mode banner */}
      {bulkMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-blue-700 text-sm font-medium">✏️ Bulk edit mode — change prices below then save all at once</div>
          <button
            onClick={saveBulkPrices}
            disabled={savingBulk}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            {savingBulk ? 'Saving…' : bulkSaved ? '✅ Saved!' : 'Save All Prices'}
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <input
          type="search" placeholder="Search products…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400"
          style={{ fontSize: '16px' }}
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 bg-white">
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
        <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 bg-white">
          {units.map(u => <option key={u} value={u}>{u === 'all' ? 'All Units' : u}</option>)}
        </select>
        {(search || categoryFilter !== 'all' || unitFilter !== 'all' || filterParam) && (
          <button onClick={() => { setSearch(''); setCategoryFilter('all'); setUnitFilter('all'); router.replace('/admin/products') }}
            className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl">
            ✕ Clear
          </button>
        )}
      </div>

      <div className="text-xs text-gray-400">{filtered.length} product{filtered.length !== 1 ? 's' : ''} shown</div>

      {/* Bulk selection bar */}
      {selectedIds.size > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-orange-700 text-sm font-semibold">{selectedIds.size} selected</span>
            <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-gray-700 underline">Clear</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => bulkAction('available')}
              disabled={bulkActing}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
            >
              {bulkActing ? '...' : 'Mark Available'}
            </button>
            <button
              onClick={() => bulkAction('out_of_stock')}
              disabled={bulkActing}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
            >
              {bulkActing ? '...' : 'Mark Out of Stock'}
            </button>
            <button
              onClick={() => { if (confirm(`Delete ${selectedIds.size} products? This cannot be undone.`)) bulkAction('delete') }}
              disabled={bulkActing}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              {bulkActing ? '...' : `Delete (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="text-center py-16 text-gray-400">Loading products…</div>}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>No products found</p>
          <Link href="/admin/products/new" className="mt-4 inline-block text-orange-500 underline text-sm">Add one →</Link>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && filtered.length > 0 && (
        <>
          {/* Table — hidden on mobile */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every(p => selectedIds.has(p.id))}
                      onChange={e => e.target.checked ? selectAllFiltered() : clearSelection()}
                      className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price ₹</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50/60 ${!p.inStock ? 'opacity-50' : ''} ${selectedIds.has(p.id) ? 'bg-orange-50/40' : ''}`}>
                    {/* Checkbox */}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                      />
                    </td>
                    {/* Image */}
                    <td className="px-4 py-2">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                        : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-lg">📦</div>
                      }
                    </td>
                    {/* Name — inline edit on click */}
                    <td className="px-4 py-2 max-w-[220px]">
                      {editingNameId === p.id ? (
                        <input
                          ref={nameInputRef}
                          value={editNameVal}
                          onChange={e => setEditNameVal(e.target.value)}
                          onBlur={() => saveNameInline(p.id)}
                          onKeyDown={e => { if (e.key === 'Enter') saveNameInline(p.id); if (e.key === 'Escape') setEditingNameId(null) }}
                          className="w-full border border-orange-300 rounded-lg px-2 py-1 text-sm outline-none"
                          style={{ fontSize: '14px' }}
                        />
                      ) : (
                        <span
                          className="font-medium text-gray-800 cursor-pointer hover:text-orange-600 hover:underline"
                          title="Click to edit name"
                          onClick={() => { setEditingNameId(p.id); setEditNameVal(p.name) }}
                        >
                          {p.name}
                        </span>
                      )}
                    </td>
                    {/* Category */}
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{p.category || <span className="text-gray-300">—</span>}</span>
                      {p.subcategory && <div className="text-xs text-gray-400 mt-0.5">{p.subcategory}</div>}
                    </td>
                    {/* Unit */}
                    <td className="px-4 py-2 text-gray-500 text-xs font-medium">{p.unit}</td>
                    {/* Price — inline edit or bulk input */}
                    <td className="px-4 py-2">
                      {bulkMode ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-xs">₹</span>
                          <input
                            type="number" min="0" step="0.01"
                            value={bulkPrices[p.id] ?? ''}
                            onChange={e => setBulkPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                            className="w-24 border border-blue-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-400"
                            style={{ fontSize: '14px' }}
                          />
                        </div>
                      ) : editingPriceId === p.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-xs">₹</span>
                          <input
                            ref={priceInputRef}
                            type="number" min="0" step="0.01"
                            value={editPriceVal}
                            onChange={e => setEditPriceVal(e.target.value)}
                            onBlur={() => savePriceInline(p.id)}
                            onKeyDown={e => { if (e.key === 'Enter') savePriceInline(p.id); if (e.key === 'Escape') setEditingPriceId(null) }}
                            className="w-24 border border-orange-300 rounded-lg px-2 py-1 text-sm outline-none"
                            style={{ fontSize: '14px' }}
                          />
                        </div>
                      ) : (
                        <span
                          className={`font-semibold cursor-pointer hover:text-orange-600 hover:underline ${p.pricePerUnit ? 'text-orange-600' : 'text-gray-300'}`}
                          title="Click to edit price"
                          onClick={() => { setEditingPriceId(p.id); setEditPriceVal(p.pricePerUnit ? String(p.pricePerUnit) : '') }}
                        >
                          {p.pricePerUnit ? `₹${p.pricePerUnit}` : 'Set price'}
                        </span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-2">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${p.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {p.inStock ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${p.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-orange-50 hover:text-orange-600" title="Edit">
                          ✏️
                        </Link>
                        <button onClick={() => handleDuplicate(p)} disabled={savingId === p.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40" title="Duplicate">
                          📋
                        </button>
                        {confirmDeleteId === p.id ? (
                          <button onClick={() => handleDelete(p.id)} disabled={savingId === p.id}
                            className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-40">
                            {savingId === p.id ? '…' : 'Sure?'}
                          </button>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(p.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500" title="Delete">
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(p => (
              <div key={p.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${!p.inStock ? 'opacity-60' : ''} ${selectedIds.has(p.id) ? 'ring-2 ring-orange-300 bg-orange-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-400 cursor-pointer flex-shrink-0"
                  />
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p.category && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{p.category}</span>}
                      <span className="text-xs text-gray-400">{p.unit}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleStatus(p)}
                    className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {p.inStock ? 'Active' : 'Hidden'}
                  </button>
                </div>

                {/* Price row */}
                <div className="mt-3 flex items-center justify-between">
                  {bulkMode ? (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-sm">₹</span>
                      <input type="number" min="0"
                        value={bulkPrices[p.id] ?? ''}
                        onChange={e => setBulkPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                        className="w-28 border border-blue-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                        style={{ fontSize: '16px' }}
                        placeholder="Price"
                      />
                    </div>
                  ) : editingPriceId === p.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">₹</span>
                      <input
                        ref={priceInputRef} type="number" min="0"
                        value={editPriceVal}
                        onChange={e => setEditPriceVal(e.target.value)}
                        onBlur={() => savePriceInline(p.id)}
                        onKeyDown={e => { if (e.key === 'Enter') savePriceInline(p.id); if (e.key === 'Escape') setEditingPriceId(null) }}
                        className="w-28 border border-orange-300 rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingPriceId(p.id); setEditPriceVal(p.pricePerUnit ? String(p.pricePerUnit) : '') }}
                      className={`text-lg font-bold ${p.pricePerUnit ? 'text-orange-600' : 'text-gray-300'} hover:underline`}
                    >
                      {p.pricePerUnit ? `₹${p.pricePerUnit}` : 'Set price'}
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/products/${p.id}`}
                      className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600">✏️</Link>
                    <button onClick={() => handleDuplicate(p)} disabled={savingId === p.id}
                      className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40">📋</button>
                    {confirmDeleteId === p.id ? (
                      <button onClick={() => handleDelete(p.id)} disabled={savingId === p.id}
                        className="px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-bold">
                        {savingId === p.id ? '…' : 'Delete?'}
                      </button>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(p.id)}
                        className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500">🗑️</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bulk save footer */}
      {bulkMode && !loading && filtered.length > 0 && (
        <div className="sticky bottom-4 flex justify-center">
          <button
            onClick={saveBulkPrices}
            disabled={savingBulk}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg text-sm disabled:opacity-60"
          >
            {savingBulk ? 'Saving…' : bulkSaved ? '✅ All Prices Saved!' : `💾 Save All Prices (${filtered.length})`}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading…</div>}>
      <ProductsContent />
    </Suspense>
  )
}
