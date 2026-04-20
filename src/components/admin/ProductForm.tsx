'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/types/product'
import { CategoryWithSubs } from '@/lib/supabase/categories'
import { UNITS } from '@/lib/categories'

const CREATE_NEW = '__create_new__'

interface Props { product?: Product }

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
  // Local preview: shows instantly when user picks a file (before upload finishes)
  const [localPreview, setLocalPreview] = useState('')

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

  // Handle category select — catches "Create new…"
  const handleCategoryChange = (val: string) => {
    if (val === CREATE_NEW) {
      setCreatingCat(true)
      setNewCatName('')
    } else {
      setCategory(val)
      setSubcategory('')
      setCreatingCat(false)
    }
  }

  // Create new category inline
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
      setCategory(newCat.name)
      setSubcategory('')
      setCreatingCat(false)
      setNewCatName('')
    } catch (e: any) {
      setError('Failed to create category: ' + (e.message || 'unknown'))
    }
    setSavingCat(false)
  }

  // Handle subcategory select — catches "Create new…"
  const handleSubcategoryChange = (val: string) => {
    if (val === CREATE_NEW) {
      setCreatingSub(true)
      setNewSubName('')
    } else {
      setSubcategory(val)
      setCreatingSub(false)
    }
  }

  // Create new subcategory inline
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
        c.id === selectedCatObj.id
          ? { ...c, subcategories: [...c.subcategories, newSub] }
          : c
      ))
      setSubcategory(newSub.name)
      setCreatingSub(false)
      setNewSubName('')
    } catch (e: any) {
      setError('Failed to create subcategory: ' + (e.message || 'unknown'))
    }
    setSavingSub(false)
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show thumbnail immediately from local file — no waiting for upload
    if (localPreview) URL.revokeObjectURL(localPreview)
    const objectUrl = URL.createObjectURL(file)
    setLocalPreview(objectUrl)

    setUploading(true)
    setError('')
    // Reset input so the same file can be re-selected later
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
      // Revert to previous image on failure
      URL.revokeObjectURL(objectUrl)
      setLocalPreview('')
    }
    setUploading(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Product name is required'); return }
    setSaving(true)
    setError('')
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
        if (!res.ok) throw new Error((await res.json()).error)
      }
      router.push('/admin/products')
    } catch (err: any) {
      setError(err.message || 'Failed to save')
      setSaving(false)
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
          {/* No capture attr — lets user choose file or camera */}
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
            <input
              ref={newCatInputRef}
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCat() } if (e.key === 'Escape') setCreatingCat(false) }}
              placeholder="New category name…"
              className="flex-1 border border-orange-300 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
              style={{ fontSize: '16px' }}
            />
            <button type="button" onClick={handleCreateCat} disabled={!newCatName.trim() || savingCat}
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl text-sm transition-colors">
              {savingCat ? '…' : 'Create'}
            </button>
            <button type="button" onClick={() => setCreatingCat(false)}
              className="px-3 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm">
              ✕
            </button>
          </div>
        ) : (
          <select
            value={category}
            onChange={e => handleCategoryChange(e.target.value)}
            disabled={catsLoading}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 bg-white text-sm disabled:bg-gray-50"
            style={{ fontSize: '16px' }}
          >
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
            <input
              ref={newSubInputRef}
              value={newSubName}
              onChange={e => setNewSubName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSub() } if (e.key === 'Escape') setCreatingSub(false) }}
              placeholder="New subcategory name…"
              className="flex-1 border border-blue-300 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              style={{ fontSize: '16px' }}
            />
            <button type="button" onClick={handleCreateSub} disabled={!newSubName.trim() || savingSub}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white font-bold rounded-xl text-sm transition-colors">
              {savingSub ? '…' : 'Create'}
            </button>
            <button type="button" onClick={() => setCreatingSub(false)}
              className="px-3 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm">
              ✕
            </button>
          </div>
        ) : (
          <select
            value={subcategory}
            onChange={e => handleSubcategoryChange(e.target.value)}
            disabled={!category || creatingCat}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-orange-400 bg-white text-sm disabled:bg-gray-50 disabled:text-gray-400"
            style={{ fontSize: '16px' }}
          >
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
          <input
            type="number" min="0" step="0.01"
            value={price} onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
            style={{ fontSize: '16px' }}
          />
        </div>
      </div>

      {/* Min Qty + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Min Order Qty</label>
          <input
            type="number" min="1"
            value={minQty} onChange={e => setMinQty(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-400"
            style={{ fontSize: '16px' }}
          />
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
    </form>
  )
}
