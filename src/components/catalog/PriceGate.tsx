'use client'

import { useRouter } from 'next/navigation'

export default function PriceGate() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push('/auth?returnTo=/catalog')}
      className="w-full text-left"
    >
      <span className="inline-flex items-center gap-1 text-orange-600 font-medium text-sm bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
        🔒 Enter Mobile to See Price
      </span>
    </button>
  )
}
