export interface Customer {
  id: string
  phone: string
  name: string | null
  is_active: boolean
  is_admin: boolean
  created_at: string
}
