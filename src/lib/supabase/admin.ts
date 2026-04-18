import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// !! NEVER expose SUPABASE_SERVICE_ROLE_KEY to client !!
// This module must only be imported in server-side code
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
