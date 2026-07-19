import { createClient } from '@supabase/supabase-js'

// 이 클라이언트는 서버(API route)에서만 import 할 것.
// SUPABASE_SERVICE_ROLE_KEY는 NEXT_PUBLIC_ 접두사가 없어서 브라우저 번들에 절대 포함되지 않는다.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
