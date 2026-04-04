'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BUSINESS_NAME } from '@/lib/constants'

function AuthPageInner() {
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'not_found'>('idle')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/catalog'

  const handleSubmit = async () => {
    if (phone.length < 9) return
    setStatus('loading')
    const result = await login(phone)
    if (result === 'ok') {
      router.replace(returnTo)
    } else {
      setStatus('not_found')
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">{BUSINESS_NAME}</h1>
          <p className="text-gray-500 text-sm">Enter your mobile number to see wholesale prices</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-500 bg-white">
            <span className="px-4 py-4 text-gray-500 font-medium bg-gray-50 border-r-2 border-gray-200 text-lg">
              +61
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="4XX XXX XXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ''))
                setStatus('idle')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 px-4 py-4 text-lg outline-none bg-white"
              maxLength={10}
              autoFocus
            />
          </div>

          {status === 'not_found' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700 font-medium text-sm">Number not recognised</p>
              <p className="text-red-500 text-xs mt-1">Contact {BUSINESS_NAME} to get access</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === 'loading' || phone.length < 9}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
          >
            {status === 'loading' ? 'Checking…' : 'Enter Mobile to See Price'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  )
}
