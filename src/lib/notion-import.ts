import { revalidatePath } from 'next/cache'
import { fetchNotionPage } from '@/lib/notion'
import { adminSupabase } from '@/lib/supabase/admin'

export type ImportResult =
  | { success: true; action: 'created' | 'updated'; title: string; slug: string; type: string; status: string; postId: string }
  | { success: false; error: string }

export async function importNotionPage(pageId: string): Promise<ImportResult> {
  let notionData
  try {
    notionData = await fetchNotionPage(pageId)
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Notion取得エラー' }
  }

  const baseSlug = notionData.slug || pageId

  // スラッグ重複を回避（-1, -2 ... を付与）
  async function resolveSlug(base: string, excludeId?: string): Promise<string> {
    let candidate = base
    let suffix = 0
    while (true) {
      let query = adminSupabase
        .from('posts')
        .select('id')
        .eq('slug', candidate)
      if (excludeId) query = query.neq('id', excludeId)
      const { data } = await query.maybeSingle()
      if (!data) return candidate
      suffix++
      candidate = `${base}-${suffix}`
    }
  }

  const { data: existing } = await adminSupabase
    .from('posts')
    .select('id')
    .eq('notion_page_id', pageId)
    .maybeSingle()

  if (existing) {
    // 既存投稿の更新：自分自身のslugは除外して重複チェック
    const slug = await resolveSlug(baseSlug, existing.id)
    const { data, error } = await adminSupabase
      .from('posts')
      .update({
        title: notionData.title,
        slug,
        body: notionData.body,
        excerpt: notionData.excerpt,
        type: notionData.type,
        status: notionData.status,
        thumbnail: notionData.thumbnail,
        published_at: notionData.published_at,
        meta: Object.keys(notionData.meta).length ? notionData.meta : null,
        updated_at: new Date().toISOString(),
      })
      .eq('notion_page_id', pageId)
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/'); revalidatePath('/news'); revalidatePath('/blog')
    return { success: true, action: 'updated', title: notionData.title, slug, type: notionData.type, status: notionData.status, postId: data.id }
  } else {
    // 新規作成：重複しないslugを確定
    const slug = await resolveSlug(baseSlug)
    const { data, error } = await adminSupabase
      .from('posts')
      .insert({
        title: notionData.title,
        slug,
        body: notionData.body,
        excerpt: notionData.excerpt,
        type: notionData.type,
        status: notionData.status,
        thumbnail: notionData.thumbnail,
        published_at: notionData.published_at,
        meta: Object.keys(notionData.meta).length ? notionData.meta : null,
        notion_page_id: pageId,
      })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/'); revalidatePath('/news'); revalidatePath('/blog')
    return { success: true, action: 'created', title: notionData.title, slug, type: notionData.type, status: notionData.status, postId: data.id }
  }
}
