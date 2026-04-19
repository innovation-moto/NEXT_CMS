'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadImage(formData: FormData) {
  // 認証チェック
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { error: '認証が必要です' }
  const user = session.user

  const file = formData.get('file') as File | null
  if (!file) return { error: 'ファイルが見つかりません' }
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

  if (error) return { error: error.message }

  const {
    data: { publicUrl },
  } = adminSupabase.storage.from('media').getPublicUrl(data.path)

  // メディアテーブルに記録
  await adminSupabase.from('media').insert({
    filename: file.name,
    url: publicUrl,
    size: file.size,
    mime_type: file.type,
    uploaded_by: user.id,
  })

  return { url: publicUrl }
}

export async function deleteMedia(id: string, filename: string) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { error: '認証が必要です' }

  await adminSupabase.storage.from('media').remove([filename])
  await adminSupabase.from('media').delete().eq('id', id)

  return { success: true }
}
