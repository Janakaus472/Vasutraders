export type UserRole = 'customer' | 'admin'

export interface AppUser {
  uid: string
  phone: string
  role: UserRole
  displayName: string
  createdAt: Date
  lastLoginAt: Date
}
