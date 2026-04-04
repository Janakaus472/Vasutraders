import { supabase } from './client'
import { Customer } from '@/types/user'

export async function lookupPhone(phone: string): Promise<Customer | null> {
  // Normalize: strip leading 0, add 61 prefix if needed
  let normalized = phone.replace(/\D/g, '')
  if (normalized.startsWith('0')) normalized = '61' + normalized.slice(1)
  if (!normalized.startsWith('61')) normalized = '61' + normalized

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', normalized)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Customer
}
