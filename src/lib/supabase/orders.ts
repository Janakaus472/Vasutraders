import { supabase } from './client'

export interface OrderItem {
  name: string
  quantity: number
  unit: string
}

export interface OrderPayload {
  order_number: string
  shop_name: string
  contact_name: string
  phone: string
  locality: string
  items: OrderItem[]
}

export interface Order extends OrderPayload {
  id: string
  status: string
  created_at: string
}

export async function saveOrder(payload: OrderPayload): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Order
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Order[]
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}
