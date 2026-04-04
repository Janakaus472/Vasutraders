import { useEffect, useState, useCallback } from 'react'
import { getProducts } from '@/lib/supabase/products'
import { Product } from '@/types/product'

export function useProducts(adminMode = false) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getProducts(adminMode)
      setProducts(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [adminMode])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, isLoading, error, refetch: fetchProducts }
}
