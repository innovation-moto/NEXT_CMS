import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminSupabase } from '@/lib/supabase/admin'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  // 認証チェック
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.has('sb-ahukgtwnqscqdofsnwtx-auth-token')
  if (!isLoggedIn) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '許可されていないファイル形式です (JPEG, PNG, WebP, GIF のみ)' },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます (最大10MB)' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()
    const filename = `${crypto.randomUUID()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { data, error } = await adminSupabase.storage
      .from('media')
      .upload(filename, Buffer.from(buffer), { contentType: file.type, upsert: false })

    if (error) {
      return NextResponse.json({ error: `Storage エラー: ${error.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = adminSupabase.storage
      .from('media')
      .getPublicUrl(data.path)

    // メディアテーブルに記録（失敗してもURLは返す）
    try {
      await adminSupabase.from('media').insert({
        filename: file.name,
        url: publicUrl,
        size: file.size,
        mime_type: file.type,
        uploaded_by: null,
      })
    } catch { /* 記録失敗は無視 */ }

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `予期しないエラー: ${msg}` }, { status: 500 })
  }
}
