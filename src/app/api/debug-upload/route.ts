import { NextResponse } from 'next/server'

export async function GET() {
  const results: Record<string, unknown> = {}

  // 環境変数チェック
  results.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? '✓ set'
    : '✗ MISSING'
  results.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? '✓ set'
    : '✗ MISSING'

  // adminSupabase 接続テスト
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // media バケット存在確認
    const { data: bucket, error: bucketError } = await admin.storage.getBucket('media')
    if (bucketError) {
      results.storage_bucket = `✗ ERROR: ${bucketError.message}`
    } else {
      results.storage_bucket = `✓ exists (public: ${bucket.public})`
    }
  } catch (err) {
    results.admin_client = `✗ EXCEPTION: ${String(err)}`
  }

  return NextResponse.json(results, { status: 200 })
}
