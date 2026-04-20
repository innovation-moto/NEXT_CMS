'use server'

import { cookies } from 'next/headers'
import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadImage(formData: FormData) {
  try {
    // クッキー直接確認（getSession はVercel本番で失敗するケースがあるため）
    const cookieStore = await cookies()
    const isLoggedIn = cookieStore.has('sb-ahukgtwnqscqdofsnwtx-auth-token')
    if (!isLoggedIn) return { error: '認証が必要です（再ログインしてください）' }

    // user.id はメディアテーブル記録用（取得失敗してもアップロード自体は続行）
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id ?? null

    const fileEntry = formData.get('file')
    if (!fileEntry || typeof fileEntry === 'string') return { error: 'ファイルが見つかりません' }

    // FormDataEntryValue を File として扱う
    const file = fileEntry as unknown as {
      type: string
      size: number
      name: string
      arrayBuffer: () => Promise<ArrayBuffer>
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type))
      return { error: '許可されていないファイル形式です (JPEG, PNG, WebP, GIF のみ)' }
    if (file.size > MAX_SIZE)
      return { error: 'ファイルサイズが大きすぎます (最大10MB)' }

    const ext = file.name.split('.').pop()
    const filename = `${crypto.randomUUID()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { data, error } = await adminSupabase.storage
      .from('media')
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (error) return { error: `Storage エラー: ${error.message}` }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from('media').getPublicUrl(data.path)

    // メディアテーブルに記録（失敗してもURLは返す）
    try {
      await adminSupabase.from('media').insert({
        filename: file.name,
        url: publicUrl,
        size: file.size,
        mime_type: file.type,
        uploaded_by: userId,
      })
    } catch { /* 記録失敗は無視 */ }

    return { url: publicUrl }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: `予期しないエラー: ${msg}` }
  }
}

export async function deleteMedia(id: string, filename: string) {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.has('sb-ahukgtwnqscqdofsnwtx-auth-token')
  if (!isLoggedIn) return { error: '認証が必要です' }

  await adminSupabase.storage.from('media').remove([filename])
  await adminSupabase.from('media').delete().eq('id', id)

  return { success: true }
}
