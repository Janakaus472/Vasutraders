'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { lookupPhone } from '@/lib/supabase/auth'
import { Customer } from '@/types/user'

const SESSION_KEY = 'vt_customer'

interface AuthContextValue {
  customer: Customer | null
  isAdmin: boolean
  isLoading: boolean
  login: (phone: string) => Promise<'ok' | 'not_found'>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) setCustomer(JSON.parse(stored))
    } catch {}
    setIsLoading(false)
  }, [])

  const login = async (phone: string): Promise<'ok' | 'not_found'> => {
    const result = await lookupPhone(phone)
    if (!result) return 'not_found'
    setCustomer(result)
    localStorage.setItem(SESSION_KEY, JSON.stringify(result))
    return 'ok'
  }

  const logout = () => {
    setCustomer(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAdmin: customer?.is_admin === true,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
