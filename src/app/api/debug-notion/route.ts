import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get('page_id')
  if (!pageId) return NextResponse.json({ error: 'page_id required' }, { status: 400 })

  const apiKey = process.env.NOTION_API_KEY

  // ページプロパティ取得
  const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  const pageData = await pageRes.json()

  // ブロック取得
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  const blocksData = await blocksRes.json()

  const properties: Record<string, { type: string; value: unknown }> = {}
  for (const [key, val] of Object.entries(pageData.properties ?? {})) {
    const v = val as Record<string, unknown>
    properties[key] = { type: v.type as string, value: v[v.type as string] }
  }

  // Supabaseに保存されているmetaを確認
  const { data: dbPost } = await adminSupabase
    .from('posts')
    .select('id, title, meta')
    .eq('notion_page_id', pageId)
    .maybeSingle()

  return NextResponse.json({
    page_status: pageRes.status,
    blocks_status: blocksRes.status,
    blocks_count: blocksData.results?.length ?? 0,
    properties,
    db_post: dbPost ? { id: dbPost.id, title: dbPost.title, meta: dbPost.meta } : null,
    page_error: pageData.code ?? null,
    blocks_error: blocksData.code ?? null,
  })
}
