import { adminSupabase } from './client'

export async function saveOtp(phone: string, code: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const { error } = await adminSupabase
    .from('phone_otps')
    .upsert({ phone, code, expires_at: expiresAt, attempts: 0, created_at: new Date().toISOString() })
  if (error) throw error
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await adminSupabase
    .from('phone_otps')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error || !data) return { success: false, error: 'OTP not found. Request a new one.' }

  if (new Date(data.expires_at) < new Date()) {
    await adminSupabase.from('phone_otps').delete().eq('phone', phone)
    return { success: false, error: 'OTP expired. Request a new one.' }
  }

  if (data.attempts >= 5) {
    return { success: false, error: 'Too many attempts. Request a new OTP.' }
  }

  if (data.code !== code) {
    await adminSupabase.from('phone_otps').update({ attempts: data.attempts + 1 }).eq('phone', phone)
    return { success: false, error: 'Incorrect OTP. Try again.' }
  }

  await adminSupabase.from('phone_otps').delete().eq('phone', phone)
  return { success: true }
}
