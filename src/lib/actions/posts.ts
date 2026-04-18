'use server'

import { createClient } from '@/lib/supabase/server'
import { createPostSchema } from '@/lib/validations/post'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 認証チェックヘルパー
async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect('/admin/login')
  return { supabase, user }
}

export async function createPost(formData: FormData) {
  const { supabase, user } = await requireAuth()

  const status = formData.get('status') as string
  const publishedAtRaw = (formData.get('published_at') as string) || null
  // 公開ステータスで日時が未入力の場合は現在時刻を自動セット
  const publishedAt =
    status === 'published' && !publishedAtRaw
      ? new Date().toISOString()
      : publishedAtRaw

  const categoryIdRaw = formData.get('category_id') as string | null
  const categoryId = categoryIdRaw && categoryIdRaw !== '' ? categoryIdRaw : null

  const rawData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    body: formData.get('body') as string | undefined,
    excerpt: formData.get('excerpt') as string | undefined,
    type: formData.get('type') as string,
    status,
    thumbnail: formData.get('thumbnail') as string | undefined,
    published_at: publishedAt,
  }

  const parsed = createPostSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({ ...parsed.data, author_id: user.id, category_id: categoryId })
    .select()
    .single()

  if (error) {
    return { error: { formErrors: [error.message], fieldErrors: {} } }
  }

  revalidatePath('/news')
  revalidatePath('/blog')
  revalidatePath('/')
  revalidatePath('/admin/posts')
  redirect(`/admin/posts/${data.id}/edit`)
}

export async function updatePost(id: string, formData: FormData) {
  const { supabase } = await requireAuth()

  const status = formData.get('status') as string
  const publishedAtRaw = (formData.get('published_at') as string) || null
  // 公開ステータスで日時が未入力の場合は現在時刻を自動セット
  const publishedAt =
    status === 'published' && !publishedAtRaw
      ? new Date().toISOString()
      : publishedAtRaw

  const categoryIdRaw = formData.get('category_id') as string | null
  const categoryId = categoryIdRaw && categoryIdRaw !== '' ? categoryIdRaw : null

  const rawData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    body: formData.get('body') as string | undefined,
    excerpt: formData.get('excerpt') as string | undefined,
    type: formData.get('type') as string,
    status,
    thumbnail: formData.get('thumbnail') as string | undefined,
    published_at: publishedAt,
  }

  const parsed = createPostSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  const { error } = await supabase
    .from('posts')
    .update({ ...parsed.data, category_id: categoryId })
    .eq('id', id)

  if (error) {
    return { error: { formErrors: [error.message], fieldErrors: {} } }
  }

  revalidatePath('/news')
  revalidatePath('/blog')
  revalidatePath('/')
  revalidatePath('/admin/posts')

  return { success: true }
}

export async function deletePost(id: string) {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/posts')
  revalidatePath('/news')
  revalidatePath('/blog')
  revalidatePath('/')

  return { success: true }
}
