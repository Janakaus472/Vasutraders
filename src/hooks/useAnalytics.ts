'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Track page views on route change
export function usePageView() {
  const pathname = usePathname()
  const tracked = useRef<string>('')

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return
    // Don't double-track same page
    if (tracked.current === pathname) return
    tracked.current = pathname

    // Small delay to avoid tracking navigations that immediately redirect
    const timer = setTimeout(() => {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'page_view', page: pathname }),
      }).catch(() => {})
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])
}

// Track a product view (call when user clicks to view a product)
export function trackProductView(product: { id: string; name: string; category?: string }) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: 'product_view',
      page: `/catalog/product/${product.id}`,
      product_id: product.id,
      product_name: product.name,
      category: product.category || '',
    }),
  }).catch(() => {})
}
