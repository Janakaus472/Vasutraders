'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as FirebaseUser, ConfirmationResult, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/config'
import { sendOtp as fbSendOtp, verifyOtp as fbVerifyOtp, signOut as fbSignOut } from '@/lib/firebase/auth'
import { getUserDocument } from '@/lib/firebase/firestore'
import { AppUser } from '@/types/user'
import { SESSION_DURATION_DAYS, LOGIN_TIMESTAMP_KEY } from '@/lib/constants'

interface AuthContextValue {
  user: AppUser | null
  firebaseUser: FirebaseUser | null
  isAdmin: boolean
  isLoading: boolean
  confirmationResult: ConfirmationResult | null
  sendOtp: (phone: string, containerId: string) => Promise<void>
  verifyOtp: (otp: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
      if (fbUser) {
        // Check session expiry
        const ts = localStorage.getItem(LOGIN_TIMESTAMP_KEY)
        if (ts) {
          const elapsed = Date.now() - parseInt(ts)
          const maxMs = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
          if (elapsed > maxMs) {
            await fbSignOut()
            setFirebaseUser(null)
            setUser(null)
            setIsLoading(false)
            return
          }
        }
        setFirebaseUser(fbUser)
        const appUser = await getUserDocument(fbUser.uid)
        setUser(appUser)
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const sendOtp = async (phone: string, containerId: string) => {
    const result = await fbSendOtp(phone, containerId)
    setConfirmationResult(result)
  }

  const verifyOtp = async (otp: string) => {
    if (!confirmationResult) throw new Error('No OTP in progress')
    await fbVerifyOtp(confirmationResult, otp)
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
    setConfirmationResult(null)
  }

  const signOut = async () => {
    await fbSignOut()
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
    setUser(null)
    setFirebaseUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAdmin: user?.role === 'admin',
        isLoading,
        confirmationResult,
        sendOtp,
        verifyOtp,
        signOut,
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
