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

  const slug = notionData.slug || pageId

  const { data: existing } = await adminSupabase
    .from('posts')
    .select('id')
    .eq('notion_page_id', pageId)
    .maybeSingle()

  if (existing) {
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
        updated_at: new Date().toISOString(),
      })
      .eq('notion_page_id', pageId)
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/'); revalidatePath('/news'); revalidatePath('/blog')
    return { success: true, action: 'updated', title: notionData.title, slug, type: notionData.type, status: notionData.status, postId: data.id }
  } else {
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
        notion_page_id: pageId,
      })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/'); revalidatePath('/news'); revalidatePath('/blog')
    return { success: true, action: 'created', title: notionData.title, slug, type: notionData.type, status: notionData.status, postId: data.id }
  }
}
