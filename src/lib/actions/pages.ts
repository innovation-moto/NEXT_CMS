'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import type { Block } from '@/types/blocks'

async function requireAuth() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )
  if (!isLoggedIn) redirect('/admin/login')
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/admin/login')
  return { supabase }
}

export async function createPage(formData: FormData) {
  await requireAuth()

  const title = (formData.get('title') as string) || 'タイトルなし'
  const slug = (formData.get('slug') as string).trim()
  const status = (formData.get('status') as string) || 'draft'
  const blocksJson = (formData.get('blocks') as string) || '[]'

  if (!slug) return { error: 'スラッグは必須です' }

  let blocks: Block[] = []
  try {
    blocks = JSON.parse(blocksJson)
  } catch {
    return { error: 'ブロックデータが不正です' }
  }

  const { data, error } = await adminSupabase
    .from('pages')
    .insert({ title, slug, status, blocks })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'このスラッグはすでに使用されています' }
    return { error: error.message }
  }

  revalidatePath('/admin/pages')
  revalidatePath(`/pages/${slug}`)
  redirect(`/admin/pages/${data.id}/edit`)
}

export async function updatePage(id: string, formData: FormData) {
  await requireAuth()

  const title = (formData.get('title') as string) || 'タイトルなし'
  const slug = (formData.get('slug') as string).trim()
  const status = (formData.get('status') as string) || 'draft'
  const blocksJson = (formData.get('blocks') as string) || '[]'

  if (!slug) return { error: 'スラッグは必須です' }

  let blocks: Block[] = []
  try {
    blocks = JSON.parse(blocksJson)
  } catch {
    return { error: 'ブロックデータが不正です' }
  }

  const { error } = await adminSupabase
    .from('pages')
    .update({ title, slug, status, blocks })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'このスラッグはすでに使用されています' }
    return { error: error.message }
  }

  revalidatePath('/admin/pages')
  revalidatePath(`/pages/${slug}`)
  return { success: true }
}

export async function deletePage(id: string) {
  await requireAuth()
  const { error } = await adminSupabase.from('pages').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/pages')
  return { success: true }
}
