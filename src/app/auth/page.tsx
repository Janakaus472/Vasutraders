'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import PhoneInput from '@/components/auth/PhoneInput'
import OtpInput from '@/components/auth/OtpInput'
import RecaptchaWidget, { RECAPTCHA_CONTAINER_ID } from '@/components/auth/RecaptchaWidget'

type Step = 'idle' | 'sending' | 'awaiting-otp' | 'verifying' | 'done'

function AuthPageInner() {
  const { sendOtp, verifyOtp, confirmationResult } = useAuth()
  const [step, setStep] = useState<Step>('idle')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/catalog'

  const handleSendOtp = async () => {
    setError('')
    setStep('sending')
    try {
      const e164 = `+61${phone}`
      await sendOtp(e164, RECAPTCHA_CONTAINER_ID)
      setStep('awaiting-otp')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try again.')
      setStep('idle')
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setError('')
    setStep('verifying')
    try {
      await verifyOtp(otp)
      setStep('done')
      router.replace(returnTo)
    } catch {
      setError('Incorrect OTP. Please try again.')
      setStep('awaiting-otp')
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">Vasu Traders</h1>
          <p className="text-gray-500 text-sm">
            {step === 'awaiting-otp' || step === 'verifying'
              ? 'Enter the OTP sent to your phone'
              : 'Enter your mobile to see wholesale prices'}
          </p>
        </div>

        {step === 'idle' || step === 'sending' ? (
          <PhoneInput
            value={phone}
            onChange={setPhone}
            onSubmit={handleSendOtp}
            isLoading={step === 'sending'}
            error={error}
          />
        ) : (
          <OtpInput
            onComplete={handleVerifyOtp}
            isLoading={step === 'verifying'}
            error={error}
            phone={phone}
            onResend={handleSendOtp}
          />
        )}

        <RecaptchaWidget />
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
