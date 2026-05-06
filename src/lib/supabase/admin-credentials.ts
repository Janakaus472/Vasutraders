import { adminSupabase } from './client'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

const CREDS_KEY = 'admin_credentials'
const OTP_KEY   = 'admin_reset_otp'

export interface AdminCredentials {
  username: string
  password_hash: string
  recovery_email?: string
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    const input = scryptSync(password, salt, 64)
    return timingSafeEqual(input, Buffer.from(hash, 'hex'))
  } catch {
    return false
  }
}

export async function getAdminCredentials(): Promise<AdminCredentials | null> {
  const { data } = await adminSupabase
    .from('settings')
    .select('value')
    .eq('key', CREDS_KEY)
    .single()
  return data ? (data.value as AdminCredentials) : null
}

export async function setAdminCredentials(creds: AdminCredentials): Promise<void> {
  const { error } = await adminSupabase
    .from('settings')
    .upsert({ key: CREDS_KEY, value: creds, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}

export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  const creds = await getAdminCredentials()
  if (creds) return username === creds.username && verifyPassword(password, creds.password_hash)
  return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD
}

export async function saveResetOtp(code: string): Promise<void> {
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const { error } = await adminSupabase
    .from('settings')
    .upsert({ key: OTP_KEY, value: { code, expires_at }, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw error
}

export async function verifyAndConsumeResetOtp(code: string): Promise<boolean> {
  const { data } = await adminSupabase.from('settings').select('value').eq('key', OTP_KEY).single()
  if (!data) return false
  const otp = data.value as { code: string; expires_at: string }
  if (new Date(otp.expires_at) < new Date()) {
    await adminSupabase.from('settings').delete().eq('key', OTP_KEY)
    return false
  }
  if (otp.code !== code) return false
  await adminSupabase.from('settings').delete().eq('key', OTP_KEY)
  return true
}
