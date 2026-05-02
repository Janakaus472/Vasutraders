'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, BulkVariant } from '@/types/product'
import { CategoryWithSubs } from '@/lib/supabase/categories'
import { UNITS } from '@/lib/categories'

const CREATE_NEW = '__create_new__'

interface Props { product?: Product }

// ─── Bulk variant local state shape ───────────────────────────────────────────
interface VariantDraft {
  id: string | null        // null = not yet saved
  quantity: string
  unit: string
  imageUrl: string
  localPreview: string
  price: string
  label: string
  uploading: boolean
  saving: boolean
  deleting: boolean
  open: boolean            // accordion open
}

function emptyDraft(unit: string): VariantDraft {
  return { id: null, quantity: '', unit, imageUrl: '', localPreview: '', price: '', label: '', uploading: false, saving: false, deleting: false, open: true }
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product
  const fileRef = useRef<HTMLInputElement>(null)
  const newCatInputRef = useRef<HTMLInputElement>(null)
  const newSubInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [catsLoading, setCatsLoading] = useState(true)
  const [catsError, setCatsError] = useState('')

  const [name, setName] = useState(product?.name || '')
  const [category, setCategory] = useState(product?.category || '')
  const [subcategory, setSubcategory] = useState(product?.subcategory || '')
  const [unit, setUnit] = useState<string>(product?.unit || 'Pcs')
  const [price, setPrice] = useState(product?.pricePerUnit ? String(product.pricePerUnit) : '')
  const [minQty, setMinQty] = useState(product?.minOrderQty ? String(product.minOrderQty) : '1')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '')
  const [inStock, setInStock] = useState(product?.inStock ?? true)

  // Inline create states
  const [creatingCat, setCreatingCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [savingCat, setSavingCat] = useState(false)
  const [creatingSub, setCreatingSub] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [savingSub, setSavingSub] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [localPreview, setLocalPreview] = useState('')

  // ─── Bulk variants ─────────────────────────────────────────────────────────
  const [bulkEnabled, setBulkEnabled] = useState(
    (product?.bulkVariants?.length ?? 0) > 0
  )
  const [variants, setVariants] = useState<VariantDraft[]>(() => {
    if (!product?.bulkVariants?.length) return []
    return product.bulkVariants.map(v => ({
      id: v.id,
      quantity: String(v.quantity),
      unit: v.unit,
      imageUrl: v.imageUrl,
      localPreview: '',
      price: v.price !== null ? String(v.price) : '',
      label: v.label,
      uploading: false,
      saving: false,
      deleting: false,
      open: false,
    }))
  })
  const [variantError, setVariantError] = useState('')
  const variantFileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setCategories(data)
      })
      .catch(() => setCatsError('Could not load categories.'))
      .finally(() => setCatsLoading(false))
  }, [])

  useEffect(() => { if (creatingCat && newCatInputRef.current) newCatInputRef.current.focus() }, [creatingCat])
  useEffect(() => { if (creatingSub && newSubInputRef.current) newSubInputRef.current.focus() }, [creatingSub])

  const selectedCatObj = categories.find(c => c.name === category)
  const subcategories = selectedCatObj?.subcategories || []

  const handleCategoryChange = (val: string) => {
    if (val === CREATE_NEW) { setCreatingCat(true); setNewCatName('') }
    else { setCategory(val); setSubcategory(''); setCreatingCat(false) }
  }

  const handleCreateCat = async () => {
    if (!newCatName.trim()) return
    setSavingCat(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), parent_id: null }),
      })
      const newCat = await res.json()
      if (!res.ok) throw new Error(newCat.error)
      const withSubs: CategoryWithSubs = { ...newCat, subcategories: [] }
      setCategories(prev => [...prev, withSubs])
      setCategory(newCat.name); setSubcategory(''); setCreatingCat(false); setNewCatName('')
    } catch (e: any) { setError('Failed to create category: ' + (e.message || 'unknown')) }
    setSavingCat(false)
  }

  const handleSubcategoryChange = (val: string) => {
    if (val === CREATE_NEW) { setCreatingSub(true); setNewSubName('') }
    else { setSubcategory(val); setCreatingSub(false) }
  }

  const handleCreateSub = async () => {
    if (!newSubName.trim() || !selectedCatObj) return
    setSavingSub(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubName.trim(), parent_id: selectedCatObj.id }),
      })
      const newSub = await res.json()
      if (!res.ok) throw new Error(newSub.error)
      setCategories(prev => prev.map(c =>
        c.id === selectedCatObj.id ? { ...c, subcategories: [...c.subcategories, newSub] } : c
      ))
      setSubcategory(newSub.name); setCreatingSub(false); setNewSubName('')
    } catch (e: any) { setError('Failed to create subcategory: ' + (e.message || 'unknown')) }
    setSavingSub(false)
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (localPreview) URL.revokeObjectURL(localPreview)
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)
    setUploading(true); setError('')
    e.target.value = ''
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImageUrl(data.url)
    } catch (err: any) {
      setError('Image upload failed: ' + (err.message || 'unknown'))
      URL.revokeObjectURL(objectUrl); setLocalPreview('')
    }
    setUploading(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Product name is required'); return }
    setSaving(true); setError('')
    try {
      const data = {
        name: name.trim(),
        description: product?.description || '',
        imageUrl,
        unit: unit as Product['unit'],
        pricePerUnit: price ? parseFloat(price) : 0,
        minOrderQty: parseInt(minQty) || 1,
        inStock,
        category,
        subcategory,
        displayOrder: product?.displayOrder || 0,
      }
      if (isEdit) {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: product.id, ...data }),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const created = await res.json()
        if (!res.ok) throw new Error(created.error)
        // Redirect to edit page so admin can add bulk variants immediately
        router.push(`/admin/products/${created.id}`)
        return
      }
      router.push('/admin/products')
    } catch (err: any) {
      setError(err.message || 'Failed to save')
      setSaving(false)
    }
  }

  // ─── Variant helpers ────────────────────────────────────────────────────────

  const updateVariant = (idx: number, patch: Partial<VariantDraft>) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, ...patch } : v))
  }

  const handleVariantImagePick = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const prev = variants[idx]
    if (prev.localPreview) URL.revokeObjectURL(prev.localPreview)
    const objectUrl = URL.createObjectURL(file)
    updateVariant(idx, { localPreview: objectUrl, uploading: true })
    e.target.value = ''
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      updateVariant(idx, { imageUrl: data.url, uploading: false })
    } catch {
      URL.revokeObjectURL(objectUrl)
      updateVariant(idx, { localPreview: '', uploading: false })
      setVariantError('Image upload failed')
    }
  }

  const handleSaveVariant = async (idx: number) => {
    const v = variants[idx]
    if (!v.quantity || parseInt(v.quantity) < 1) { setVariantError('Quantity is required'); return }
    if (!v.imageUrl) { setVariantError('Image is required for bulk variants'); return }
    setVariantError('')
    updateVariant(idx, { saving: true })
    try {
      const payload = {
        productId: product!.id,
        quantity: parseInt(v.quantity),
        unit: v.unit,
        imageUrl: v.imageUrl,
        price: v.price ? parseFloat(v.price) : null,
        label: v.label.trim(),
        displayOrder: idx,
      }
      if (v.id) {
        // Update existing
        await fetch('/api/admin/bulk-variants', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: v.id, ...payload }),
        })
        updateVariant(idx, { saving: false, open: false })
      } else {
        // Create new
        const res = await fetch('/api/admin/bulk-variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const created = await res.json()
        if (!res.ok) throw new Error(created.error)
        updateVariant(idx, { id: created.id, saving: false, open: false })
      }
    } catch (e: any) {
      setVariantError(e.message || 'Failed to save variant')
      updateVariant(idx, { saving: false })
    }
  }

  const handleDeleteVariant = async (idx: number) => {
    const v = variants[idx]
    if (v.id) {
      updateVariant(idx, { deleting: true })
      try {
        await fetch(`/api/admin/bulk-variants?id=${v.id}`, { method: 'DELETE' })
      } catch {}
    }
    setVariants(prev => prev.filter((_, i) => i !== idx))
  }

  const moveVariant = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= variants.length) return
    const next = variants.map((v, i) => {
      if (i === idx) return variants[newIdx]
      if (i === newIdx) return variants[idx]
      return v
    })
    setVariants(next)
    // Persist order for saved variants
    const updates = next
      .map((v, i) => v.id ? { id: v.id, displayOrder: i } : null)
      .filter(Boolean) as { id: string; displayOrder: number }[]
    if (updates.length) {
      await fetch('/api/admin/bulk-variants?action=reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">

      {/* Image */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
        <div className="flex items-center gap-3">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors overflow-hidden flex-shrink-0"
          >
            {(localPreview || imageUrl) ? (
              <>
                <img src={localPreview || imageUrl} alt="" className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold animate-pulse">Uploading…</span>
                  </div>
                )}
              </>
            ) : uploading ? (
              <span className="text-gray-400 animate-pulse text-2xl">⏳</span>
            ) : (
              <span className="text-3xl">📷</span>
            )}
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
              {uploading ? 'Uploading…' : (imageUrl || localPreview) ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-gray-400 mt-1">Photo or camera on mobile</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
        <input
          required value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. 38mm Nail Box"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
          style={{ fontSize: '16px' }}
          autoFocus={!isEdit}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
        {catsError && <p className="text-xs text-red-400 mb-1">{catsError}</p>}
        {creatingCat ? (
          <div className="flex gap-2">
            <input ref={newCatInputRef} value={newCatName} onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCat() } if (e.key === 'Escape') setCreatingCat(false) }}
              placeholder="New category name…"
              className="flex-1 border border-orange-300 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
              style={{ fontSize: '16px' }} />
            <button type="button" onClick={handleCreateCat} disabled={!newCatName.trim() || savingCat}
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl text-sm transition-colors">
              {savingCat ? '…' : 'Create'}
            </button>
            <button type="button" onClick={() => setCreatingCat(false)}
              className="px-3 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm">✕</button>
          </div>
        ) : (
          <select value={category} onChange={e => handleCategoryChange(e.target.value)} disabled={catsLoading}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 bg-white text-sm disabled:bg-gray-50"
            style={{ fontSize: '16px' }}>
            <option value="">{catsLoading ? 'Loading…' : 'Select category…'}</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            <option value={CREATE_NEW}>➕ Create new category…</option>
          </select>
        )}
      </div>

      {/* Subcategory */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Subcategory</label>
        {creatingSub ? (
          <div className="flex gap-2">
            <input ref={newSubInputRef} value={newSubName} onChange={e => setNewSubName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSub() } if (e.key === 'Escape') setCreatingSub(false) }}
              placeholder="New subcategory name…"
              className="flex-1 border border-blue-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              style={{ fontSize: '16px' }} />
            <button type="button" onClick={handleCreateSub} disabled={!newSubName.trim() || savingSub}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white font-bold rounded-xl text-sm transition-colors">
              {savingSub ? '…' : 'Create'}
            </button>
            <button type="button" onClick={() => setCreatingSub(false)}
              className="px-3 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm">✕</button>
          </div>
        ) : (
          <select value={subcategory} onChange={e => handleSubcategoryChange(e.target.value)}
            disabled={!category || creatingCat}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 bg-white text-sm disabled:bg-gray-50 disabled:text-gray-400"
            style={{ fontSize: '16px' }}>
            <option value="">{!category ? 'Select category first' : 'Select subcategory…'}</option>
            {subcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            {category && <option value={CREATE_NEW}>➕ Create new subcategory…</option>}
          </select>
        )}
      </div>

      {/* Unit + Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Unit *</label>
          <select value={unit} onChange={e => setUnit(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 bg-white"
            style={{ fontSize: '16px' }}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
          <input type="number" min="0" step="0.01"
            value={price} onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
            style={{ fontSize: '16px' }} />
        </div>
      </div>

      {/* Min Qty + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Min Order Qty</label>
          <input type="number" min="1"
            value={minQty} onChange={e => setMinQty(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
            style={{ fontSize: '16px' }} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <button type="button" onClick={() => setInStock(v => !v)}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {inStock ? '✅ Active' : '👁️ Hidden'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold py-4 rounded-xl transition-colors text-base">
          {saving ? 'Saving…' : isEdit ? 'Update Product' : '➕ Add Product'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
          Cancel
        </button>
      </div>

      {/* ─── BULK VARIANTS SECTION ─────────────────────────────────────────── */}
      <div className="border-t border-gray-100 pt-6 mt-2">

        {/* Toggle */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-bold text-gray-800">Bulk Variants</p>
            <p className="text-xs text-gray-400 mt-0.5">Add packs with their own image & optional price</p>
          </div>
          <button
            type="button"
            onClick={() => setBulkEnabled(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${bulkEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${bulkEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {bulkEnabled && (
          <div className="mt-4 space-y-3">

            {!isEdit && (
              <p className="text-xs text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                Save the product first — you&apos;ll be taken directly to the edit page to add bulk variants.
              </p>
            )}

            {isEdit && (
              <>
                {variantError && (
                  <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl">{variantError}</p>
                )}

                {variants.map((v, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden">

                    {/* Variant header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer select-none"
                      onClick={() => updateVariant(idx, { open: !v.open })}
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                        {(v.localPreview || v.imageUrl) ? (
                          <img src={v.localPreview || v.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {v.quantity ? `${v.quantity} ${v.unit}` : 'New variant'}
                          {v.label ? ` · ${v.label}` : ''}
                        </p>
                        {v.price && <p className="text-xs text-orange-600 font-semibold">₹{v.price}</p>}
                        {!v.id && <span className="text-xs text-amber-500 font-semibold">Unsaved</span>}
                      </div>

                      {/* Reorder */}
                      <div className="flex gap-1">
                        <button type="button" onClick={e => { e.stopPropagation(); moveVariant(idx, -1) }}
                          disabled={idx === 0}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-30 text-xs">
                          ▲
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); moveVariant(idx, 1) }}
                          disabled={idx === variants.length - 1}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 disabled:opacity-30 text-xs">
                          ▼
                        </button>
                      </div>

                      <span className="text-gray-400 text-xs">{v.open ? '▲' : '▼'}</span>
                    </div>

                    {/* Variant body */}
                    {v.open && (
                      <div className="px-4 py-4 space-y-4 bg-white">

                        {/* Image upload */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2">
                            Bulk Pack Image <span className="text-red-400">*</span>
                          </label>
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => variantFileRefs.current[idx]?.click()}
                              className="relative w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors overflow-hidden flex-shrink-0"
                            >
                              {(v.localPreview || v.imageUrl) ? (
                                <>
                                  <img src={v.localPreview || v.imageUrl} alt="" className="w-full h-full object-cover" />
                                  {v.uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <span className="text-white text-xs animate-pulse">⏳</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-2xl">{v.uploading ? '⏳' : '📷'}</span>
                              )}
                            </div>
                            <button type="button" onClick={() => variantFileRefs.current[idx]?.click()}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-gray-700 transition-colors">
                              {v.uploading ? 'Uploading…' : (v.imageUrl || v.localPreview) ? 'Change' : 'Upload'}
                            </button>
                            <input
                              ref={el => { variantFileRefs.current[idx] = el }}
                              type="file" accept="image/*"
                              onChange={e => handleVariantImagePick(e, idx)}
                              className="hidden"
                            />
                          </div>
                        </div>

                        {/* Qty + Unit */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Quantity <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="number" min="1"
                              value={v.quantity}
                              onChange={e => updateVariant(idx, { quantity: e.target.value })}
                              placeholder="e.g. 30"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                              style={{ fontSize: '16px' }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                            <select
                              value={v.unit}
                              onChange={e => updateVariant(idx, { unit: e.target.value })}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 bg-white text-sm"
                              style={{ fontSize: '16px' }}
                            >
                              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Price + Label */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Price ₹ (optional)</label>
                            <input
                              type="number" min="0" step="0.01"
                              value={v.price}
                              onChange={e => updateVariant(idx, { price: e.target.value })}
                              placeholder="Leave blank"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                              style={{ fontSize: '16px' }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Label (optional)</label>
                            <input
                              type="text"
                              value={v.label}
                              onChange={e => updateVariant(idx, { label: e.target.value })}
                              placeholder="e.g. Best Value"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 text-sm"
                              style={{ fontSize: '16px' }}
                            />
                          </div>
                        </div>

                        {/* Save / Delete */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveVariant(idx)}
                            disabled={v.saving || v.uploading}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                          >
                            {v.saving ? 'Saving…' : v.id ? 'Update' : 'Save Variant'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(idx)}
                            disabled={v.deleting}
                            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 font-bold rounded-xl text-sm transition-colors border border-red-100"
                          >
                            {v.deleting ? '…' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setVariants(prev => [...prev, emptyDraft(unit)])}
                  className="w-full py-3 border-2 border-dashed border-orange-200 rounded-2xl text-sm font-bold text-orange-500 hover:bg-orange-50 transition-colors"
                >
                  ➕ Add Bulk Variant
                </button>
              </>
            )}
          </div>
        )}
      </div>

    </form>
  )
}
