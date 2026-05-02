import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/client'

function isAdmin(req: NextRequest) {
  return req.cookies.get('vt_admin')?.value === '1'
}

// POST /api/admin/setup-analytics — create the analytics table
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminSupabase()

  // Check if table already exists
  const { error: checkError } = await db.from('analytics').select('id').limit(1)
  if (!checkError) {
    return NextResponse.json({ ok: true, message: 'Table already exists' })
  }

  // We can't run DDL through PostgREST, so we'll provide the SQL
  // But we can try a workaround: create via insert with conflict handling
  // Unfortunately, we need the user to create it manually or via the dashboard

  return NextResponse.json({
    ok: false,
    message: 'Table does not exist yet. Please create it in the Supabase SQL Editor.',
    sql: `CREATE TABLE public.analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  page text NOT NULL,
  product_id text,
  product_name text,
  category text,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX idx_analytics_product_id ON public.analytics(product_id);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert" ON public.analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON public.analytics FOR ALL USING (true);`
  })
}
