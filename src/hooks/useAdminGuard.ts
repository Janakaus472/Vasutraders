import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export function useAdminGuard() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/auth?returnTo=/admin')
    }
  }, [isAdmin, isLoading, router])

  return { isLoading, isAdmin }
}
