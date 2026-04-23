import { NextRequest, NextResponse } from 'next/server'
import { getNotionClient } from '@/lib/notion'
import { importNotionPage } from '@/lib/notion-import'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) {
    return NextResponse.json({ error: 'NOTION_DATABASE_ID is not set' }, { status: 500 })
  }

  try {
    const notion = getNotionClient()

    // 直近10分以内に更新・追加されたページのみ取得
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        timestamp: 'last_edited_time',
        last_edited_time: { after: since },
      },
    })

    const pageIds = response.results.map((page) => page.id)

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
