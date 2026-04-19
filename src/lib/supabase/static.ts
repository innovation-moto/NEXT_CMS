// generateStaticParams など、リクエストスコープ外で使用するクライアント
// cookies() を使わないため、ビルド時・静的生成時に使用可能
import { createClient } from '@supabase/supabase-js'

export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
