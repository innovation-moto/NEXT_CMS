import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get('page_id')
  if (!pageId) return NextResponse.json({ error: 'page_id required' }, { status: 400 })

  const apiKey = process.env.NOTION_API_KEY

  // ページプロパティ取得
  const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
    },
  })
  const pageData = await pageRes.json()

  // ブロック取得
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
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

  return NextResponse.json({
    page_status: pageRes.status,
    blocks_status: blocksRes.status,
    blocks_count: blocksData.results?.length ?? 0,
    properties,
    blocks: blocksData.results?.map((b: any) => ({
      type: b.type,
      content: b[b.type],
    })),
    page_error: pageData.code ?? null,
    blocks_error: blocksData.code ?? null,
  })
}
