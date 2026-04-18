'use server'

import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// カテゴリ型（DBカラム: id, name, slug, type, sort_order）
export type Category = {
  id: string
  name: string
  slug: string
  type: string
  sort_order: number
}

// type別カテゴリ一覧を取得（RLSをバイパスするためadminクライアントを使用）
export async function getCategories(type: string): Promise<Category[]> {
  const { data, error } = await adminSupabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('getCategories error:', error)
    return []
  }
  return data ?? []
}

// カテゴリを新規作成
export async function createCategory(
  name: string,
  type: string
): Promise<{ data?: Category; error?: string }> {
  const supabase = await createClient()

  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // 重複チェック（adminクライアントでRLSバイパス）
  const { data: existing } = await adminSupabase
    .from('categories')
    .select('id')
    .eq('name', name.trim())
    .eq('type', type)
    .single()

  if (existing) return { error: '同じ名前のカテゴリが既に存在します' }

  // slug: 英数字以外はハイフン変換、空の場合はタイムスタンプ
  const slug = name.trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `category-${Date.now()}`

  const { data, error } = await adminSupabase
    .from('categories')
    .insert({ name: name.trim(), slug, type })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/posts')
  return { data }
}

// カテゴリを削除
export async function deleteCategory(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // このカテゴリを使用している投稿数を確認
  const { count } = await adminSupabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    // 投稿があってもカテゴリ削除は許可（投稿のcategory_idはON DELETE SET NULLで自動nullに）
  }

  const { error } = await adminSupabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/posts')
  return { success: true }
}
