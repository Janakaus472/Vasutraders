'use client'

import { useState, useEffect, useRef } from 'react'
import { StoreInfo, TeamMember, DEFAULT_STORE_INFO } from '@/app/api/admin/store-info/route'

let memberIdCounter = 1

function uid() { return `m${Date.now()}_${memberIdCounter++}` }

export default function StoreInfoPage() {
  const [info, setInfo] = useState<StoreInfo>(DEFAULT_STORE_INFO)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetRef = useRef<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/store-info')
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setInfo(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof StoreInfo, value: unknown) =>
    setInfo(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await fetch('/api/admin/store-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const addTeamMember = () =>
    set('team', [...info.team, { id: uid(), name: '', role: '', imageUrl: '' }])

  const updateMember = (id: string, changes: Partial<TeamMember>) =>
    set('team', info.team.map(m => m.id === id ? { ...m, ...changes } : m))

  const removeMember = (id: string) =>
    set('team', info.team.filter(m => m.id !== id))

  const openPhotoUpload = (memberId: string) => {
    uploadTargetRef.current = memberId
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const memberId = uploadTargetRef.current
    if (!file || !memberId) return
    e.target.value = ''
    setUploadingFor(memberId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      updateMember(memberId, { imageUrl: data.url })
    } catch (e: any) { setError(e.message) }
    setUploadingFor(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-4xl">🏪</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '800px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Store Info</h1>
          <p className="text-gray-400 text-sm mt-0.5">Edit About Us, Contact details &amp; Team — shown on your homepage</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors text-sm shadow-sm"
          >
            {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
          </button>
          {saved && <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>✓ Live on vasutraders.com</span>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between mb-5">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-4">✕</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── About Us ── */}
        <Section icon="📖" title="About Us">
          <Field label="Paragraph 1 (English)" hint="Main description — who you are, how long, what you do">
            <textarea
              rows={4}
              value={info.about_text_1}
              onChange={e => set('about_text_1', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-orange-400"
            />
          </Field>
          <Field label="Paragraph 1 (Hindi — हिन्दी)">
            <textarea
              rows={3}
              value={info.about_text_1_hi}
              onChange={e => set('about_text_1_hi', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-orange-400"
              dir="auto"
            />
          </Field>
          <Field label="Paragraph 2 (English)" hint="Products, coverage areas">
            <textarea
              rows={3}
              value={info.about_text_2}
              onChange={e => set('about_text_2', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-orange-400"
            />
          </Field>
          <Field label="Paragraph 2 (Hindi — हिन्दी)">
            <textarea
              rows={2}
              value={info.about_text_2_hi}
              onChange={e => set('about_text_2_hi', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-orange-400"
              dir="auto"
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Established Year" hint="e.g. 2004">
              <input
                type="text"
                value={info.established_year}
                onChange={e => set('established_year', e.target.value)}
                placeholder="2004"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              />
            </Field>
            <Field label="GST Number" hint="For trust & SEO">
              <input
                type="text"
                value={info.gst_number}
                onChange={e => set('gst_number', e.target.value)}
                placeholder="23XXXXX..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              />
            </Field>
          </div>
        </Section>

        {/* ── Contact Info ── */}
        <Section icon="📞" title="Contact Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Email Address" hint="Shown on homepage & used for SEO">
              <input
                type="email"
                value={info.email}
                onChange={e => set('email', e.target.value)}
                placeholder="info@vasutraders.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              />
            </Field>
            <Field label="Phone Number">
              <input
                type="tel"
                value={info.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              />
            </Field>
          </div>
          <Field label="Address (English)">
            <input
              type="text"
              value={info.address}
              onChange={e => set('address', e.target.value)}
              placeholder="Shop No. X, Market Name, Indore, MP"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
          </Field>
          <Field label="Address (Hindi — हिन्दी)">
            <input
              type="text"
              value={info.address_hi}
              onChange={e => set('address_hi', e.target.value)}
              placeholder="दुकान नंबर X, बाजार, इंदौर, मप्र"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              dir="auto"
            />
          </Field>
          <Field label="Google Maps Link" hint="Paste the share link from Google Maps — adds a 'Get Directions' button">
            <input
              type="url"
              value={info.maps_url}
              onChange={e => set('maps_url', e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Business Hours (English)">
              <input
                type="text"
                value={info.hours}
                onChange={e => set('hours', e.target.value)}
                placeholder="Mon – Sat: 10 AM – 7 PM"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
              />
            </Field>
            <Field label="Business Hours (Hindi)">
              <input
                type="text"
                value={info.hours_hi}
                onChange={e => set('hours_hi', e.target.value)}
                placeholder="सोम – शनि: 10 AM – 7 PM"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
                dir="auto"
              />
            </Field>
          </div>
        </Section>

        {/* ── Team ── */}
        <Section icon="👥" title="Our Team">
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
            Add photos of you and your team — customers trust businesses they can put a face to.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {info.team.map(member => (
              <div key={member.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: '#f9fafb', borderRadius: '14px', padding: '14px 16px',
                border: '1px solid #e5e7eb',
              }}>
                {/* Photo */}
                <button
                  onClick={() => openPhotoUpload(member.id)}
                  title="Click to upload photo"
                  style={{
                    width: '70px', height: '70px', flexShrink: 0,
                    borderRadius: '50%', overflow: 'hidden',
                    border: '2px dashed #d1d5db', background: '#fff',
                    cursor: 'pointer', padding: 0, position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {uploadingFor === member.id ? (
                    <span style={{ fontSize: '20px' }}>⏳</span>
                  ) : member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '28px' }}>👤</span>
                  )}
                </button>

                {/* Fields */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateMember(member.id, { name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-orange-400"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={e => updateMember(member.id, { role: e.target.value })}
                    placeholder="Role (e.g. Owner, Manager)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>

                <button
                  onClick={() => removeMember(member.id)}
                  title="Remove"
                  style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', width: '34px', height: '34px', color: '#dc2626', cursor: 'pointer', fontSize: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={addTeamMember}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', borderRadius: '12px',
                border: '2px dashed #d1d5db', background: '#fff',
                color: '#6b7280', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              }}
            >
              + Add Team Member
            </button>
          </div>
        </Section>

      </div>

      {/* Bottom save */}
      <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: '15px', color: '#1a1a1a' }}>{title}</span>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{hint}</p>}
    </div>
  )
}
