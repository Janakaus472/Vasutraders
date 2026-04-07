'use client'

import { useState, useEffect } from 'react'

const SESSION_KEY = 'vt_admin_session'

export function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        if (session.expires > Date.now()) {
          setIsAdmin(true)
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
    setIsLoading(false)
  }, [])

  return { isLoading, isAdmin }
}

export function adminLogout() {
  localStorage.removeItem(SESSION_KEY)
}
