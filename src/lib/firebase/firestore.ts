import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { User } from 'firebase/auth'
import { getFirebaseDb } from './config'
import { Product, ProductUnit } from '@/types/product'
import { AppUser, UserRole } from '@/types/user'

// --- Users ---

export async function ensureUserDocument(user: User): Promise<void> {
  const ref = doc(getFirebaseDb(), 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      phone: user.phoneNumber || '',
      role: 'customer' as UserRole,
      displayName: '',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    })
  } else {
    await updateDoc(ref, { lastLoginAt: serverTimestamp() })
  }
}

export async function getUserDocument(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid: snap.id,
    phone: data.phone,
    role: data.role,
    displayName: data.displayName,
    createdAt: data.createdAt?.toDate(),
    lastLoginAt: data.lastLoginAt?.toDate(),
  }
}

// --- Products ---

export function productsQuery(adminMode = false) {
  const ref = collection(getFirebaseDb(), 'products')
  if (adminMode) {
    return query(ref, orderBy('displayOrder', 'asc'))
  }
  return query(ref, where('inStock', '==', true), orderBy('displayOrder', 'asc'))
}

export async function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), 'products'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), 'products', id))
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'products', id))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    id: snap.id,
    name: data.name,
    description: data.description,
    imageUrl: data.imageUrl,
    unit: data.unit as ProductUnit,
    pricePerUnit: data.pricePerUnit,
    minOrderQty: data.minOrderQty,
    inStock: data.inStock,
    category: data.category,
    displayOrder: data.displayOrder,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  }
}
