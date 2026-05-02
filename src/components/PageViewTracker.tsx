'use client'

import { usePageView } from '@/hooks/useAnalytics'

export default function PageViewTracker() {
  usePageView()
  return null
}
