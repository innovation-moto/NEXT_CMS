// generateStaticParams など、リクエストスコープ外で使用するクライアント
// cookies() を使わないため、ビルド時・静的生成時に使用可能
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export function createStaticClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
