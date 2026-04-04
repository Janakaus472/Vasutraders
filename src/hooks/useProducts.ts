import { useEffect, useState } from 'react'
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore'
import { productsQuery } from '@/lib/firebase/firestore'
import { Product, ProductUnit } from '@/types/product'

function docToProduct(doc: DocumentData & { id: string }): Product {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    description: data.description || '',
    imageUrl: data.imageUrl || '',
    unit: data.unit as ProductUnit,
    pricePerUnit: data.pricePerUnit,
    minOrderQty: data.minOrderQty || 1,
    inStock: data.inStock,
    category: data.category || '',
    displayOrder: data.displayOrder || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

export function useProducts(adminMode = false) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = productsQuery(adminMode)
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        setProducts(snapshot.docs.map((d) => docToProduct(d as any)))
        setIsLoading(false)
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )
    return unsubscribe
  }, [adminMode])

  return { products, isLoading, error }
}
