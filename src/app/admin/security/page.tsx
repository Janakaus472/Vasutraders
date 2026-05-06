'use client'

import { useState, useEffect } from 'react'

export default function SecurityPage() {
  const [currentUsername, setCurrentUsername] = useState('')
  const [recoveryEmailOnFile, setRecoveryEmailOnFile] = useState('')
  const [loading, setLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/auth/credentials')
      .then(r => r.json())
      .then(data => {
        setCurrentUsername(data.username || '')
        setNewUsername(data.username || '')
        setRecoveryEmail(data.recovery_email || '')
        setRecoveryEmailOnFile(data.recovery_email || '')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSaved(false); setSaving(true)
    try {
      const res = await fetch('/api/admin/auth/credentials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_username: newUsername.trim() || undefined,
          new_password: newPassword || undefined,
          confirm_password: confirmPassword || undefined,
          recovery_email: recoveryEmail,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Update session in localStorage with new credentials
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('vt_admin_session')
        if (raw) {
          const session = JSON.parse(raw)
          localStorage.setItem('vt_admin_session', JSON.stringify({
            ...session,
            u: newUsername.trim() || currentUsername,
            p: newPassword || currentPassword,
          }))
        }
      }

      setCurrentUsername(newUsername.trim() || currentUsername)
      setRecoveryEmailOnFile(recoveryEmail)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <span className="animate-pulse text-4xl">🔐</span>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', fontSize: '15px',
    borderRadius: '10px', border: '2px solid #E5E7EB',
    background: '#FAFAFA', color: '#1a1a1a',
    fontFamily: 'inherit', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontWeight: 700, fontSize: '13px',
    color: '#374151', marginBottom: '6px',
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '560px' }}>
      <style>{`
        .sec-input:focus { border-color: #FF6B00 !important; box-shadow: 0 0 0 3px rgba(255,107,0,0.12) !important; }
      `}</style>

      <div className="mb-6">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>
          🔐 Security Settings
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
          Change your admin login credentials and recovery email.
        </p>
      </div>

      {/* Current credentials info */}
      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', fontSize: '14px', color: '#166534' }}>
        <strong>Current username:</strong> {currentUsername}
        {recoveryEmailOnFile
          ? <><br /><strong>Recovery email:</strong> {recoveryEmailOnFile}</>
          : <><br /><span style={{ color: '#DC2626' }}>⚠️ No recovery email set — you cannot recover a forgotten password.</span></>
        }
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#5C2D0F' }}>🔑 Current Password (required to save changes)</p>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              className="sec-input"
              style={inputStyle}
              value={currentPassword}
              onChange={e => { setCurrentPassword(e.target.value); setError('') }}
              placeholder="Enter your current password"
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#1D4ED8' }}>👤 Username</p>
          <div>
            <label style={labelStyle}>New Username <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(leave same to keep current)</span></label>
            <input
              type="text"
              className="sec-input"
              style={inputStyle}
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              placeholder="New username"
              autoComplete="username"
            />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#7C3AED' }}>🔒 New Password <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(leave blank to keep current)</span></p>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              className="sec-input"
              style={inputStyle}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              className="sec-input"
              style={inputStyle}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px', color: '#047857' }}>📧 Recovery Email</p>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6B7280' }}>
            If you forget your password, a reset code will be sent to this email.
          </p>
          <div>
            <label style={labelStyle}>Recovery Email</label>
            <input
              type="email"
              className="sec-input"
              style={inputStyle}
              value={recoveryEmail}
              onChange={e => setRecoveryEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {saved && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 16px', color: '#166534', fontSize: '14px', fontWeight: 600 }}>
            ✅ Credentials updated successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !currentPassword}
          style={{
            padding: '14px 24px',
            background: (!saving && currentPassword) ? 'linear-gradient(135deg, #FF6B00, #C2410C)' : '#E5E7EB',
            color: (!saving && currentPassword) ? '#fff' : '#9CA3AF',
            border: 'none', borderRadius: '12px',
            fontFamily: 'inherit', fontWeight: 800, fontSize: '15px',
            cursor: (!saving && currentPassword) ? 'pointer' : 'not-allowed',
            boxShadow: (!saving && currentPassword) ? '0 4px 14px rgba(255,107,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  )
}
