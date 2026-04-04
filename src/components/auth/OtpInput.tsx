'use client'

import { useRef, useEffect, useState, KeyboardEvent, ChangeEvent } from 'react'

interface OtpInputProps {
  onComplete: (otp: string) => void
  isLoading: boolean
  error?: string
  onResend: () => void
  phone: string
}

export default function OtpInput({ onComplete, isLoading, error, onResend, phone }: OtpInputProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(30)
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    refs[0].current?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = val
    setDigits(next)

    if (val && index < 5) {
      refs[index + 1].current?.focus()
    }

    if (next.every((d) => d !== '') && val) {
      onComplete(next.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
  }

  const handleResend = () => {
    setCooldown(30)
    setDigits(['', '', '', '', '', ''])
    refs[0].current?.focus()
    onResend()
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-center text-sm">
        OTP sent to <span className="font-semibold">+61 {phone}</span>
      </p>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none disabled:bg-gray-50"
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {isLoading && (
        <p className="text-center text-gray-500 text-sm">Verifying…</p>
      )}
      <div className="text-center">
        {cooldown > 0 ? (
          <p className="text-gray-400 text-sm">Resend OTP in {cooldown}s</p>
        ) : (
          <button onClick={handleResend} className="text-orange-500 text-sm font-medium">
            Resend OTP
          </button>
        )}
      </div>
    </div>
  )
}
