'use client'

interface PhoneInputProps {
  value: string
  onChange: (val: string) => void
  onSubmit: () => void
  isLoading: boolean
  error?: string
}

export default function PhoneInput({ value, onChange, onSubmit, isLoading, error }: PhoneInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-500 bg-white">
        <span className="px-4 py-4 text-gray-500 font-medium bg-gray-50 border-r-2 border-gray-200 text-lg">
          +61
        </span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="4XX XXX XXX"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          className="flex-1 px-4 py-4 text-lg outline-none bg-white"
          maxLength={10}
          autoFocus
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={onSubmit}
        disabled={isLoading || value.length < 9}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
      >
        {isLoading ? 'Sending OTP…' : 'Get Started with Your Number'}
      </button>
    </div>
  )
}
