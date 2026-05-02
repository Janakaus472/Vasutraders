import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null
let _adminClient: SupabaseClient | null = null

// Custom fetch that bypasses Next.js data cache so product/variant reads are always fresh
const noStoreFetch: typeof fetch = (url, options) =>
  fetch(url, { ...options, cache: 'no-store' })

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { fetch: noStoreFetch } }
    )
  }
  return _client
}

// Admin client uses service key — bypasses RLS for writes
export function getAdminSupabase(): SupabaseClient {
  if (!_adminClient) {
    const serviceKey =
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { global: { fetch: noStoreFetch } }
    )
  }
  return _adminClient
}

// Convenience export — same lazy pattern
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop]
  },
})

// Admin supabase — uses service key, bypasses RLS
export const adminSupabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getAdminSupabase() as any)[prop]
  },
})
