const REQUIRED: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anon key',
  SUPABASE_SERVICE_KEY: 'Supabase service role key',
  DEEPSEEK_API_KEY: 'DeepSeek API key (platform.deepseek.com)',
  RESEND_API_KEY: 'Resend email API key (resend.com)',
}

const missing = Object.entries(REQUIRED)
  .filter(([key]) => !process.env[key])
  .map(([key, label]) => `  ${key}  →  ${label}`)

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables:\n${missing.join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
  )
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY!,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY!,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY!,
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? 'noreply@vasutraders.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919893084993',
  whatsappBotUrl: process.env.WHATSAPP_BOT_URL,
  greenApiInstanceId: process.env.GREENAPI_INSTANCE_ID,
  greenApiToken: process.env.GREENAPI_TOKEN,
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Vasu Traders',
  adminUser: process.env.ADMIN_USER,
  adminPassword: process.env.ADMIN_PASSWORD,
}
