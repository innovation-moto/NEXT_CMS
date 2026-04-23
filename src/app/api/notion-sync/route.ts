import { NextRequest, NextResponse } from 'next/server'
import { importNotionPage } from '@/lib/notion-import'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const databaseId = process.env.NOTION_DATABASE_ID
  const apiKey = process.env.NOTION_API_KEY
  if (!databaseId) {
    return NextResponse.json({ error: 'NOTION_DATABASE_ID is not set' }, { status: 500 })
  }
  if (!apiKey) {
    return NextResponse.json({ error: 'NOTION_API_KEY is not set' }, { status: 500 })
  }

  try {
    // 直近10分以内に更新・追加されたページのみ取得（REST APIを直接使用）
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          timestamp: 'last_edited_time',
          last_edited_time: { after: since },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Notion API error: ${err}` }, { status: 502 })
    }

    const data = await res.json()
    const pageIds: string[] = data.results.map((page: { id: string }) => page.id)

    if (pageIds.length === 0) {
      return NextResponse.json({ synced: 0, message: '変更なし' })
    }

    // 直列処理（Notion APIのレート制限対策）
    let succeeded = 0
    let failed = 0
    for (const pageId of pageIds) {
      const result = await importNotionPage(pageId)
      if (result.success) succeeded++
      else failed++
    }

    return NextResponse.json({ synced: succeeded, failed, total: pageIds.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '同期エラー' },
      { status: 500 }
    )
  }
}
