import { NextRequest, NextResponse } from 'next/server'
import { importNotionPage } from '@/lib/notion-import'
import { adminSupabase } from '@/lib/supabase/admin'
import { getApiKey } from '@/lib/notion'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let apiKey: string
  try {
    apiKey = await getApiKey()
  } catch {
    return NextResponse.json({ error: 'NOTION_API_KEY が設定されていません' }, { status: 500 })
  }

  // DB登録済みのデータベース + 環境変数のデータベースを統合
  const { data: configRow } = await adminSupabase
    .from('notion_config')
    .select('databases')
    .limit(1)
    .maybeSingle()

  type DbEntry = { id: string }
  const dbDatabases = ((configRow?.databases as DbEntry[] | null) ?? []).map(d => d.id)
  const envDb = process.env.NOTION_DATABASE_ID
  const allDatabases = Array.from(new Set(dbDatabases.concat(envDb ? [envDb] : [])))

  if (allDatabases.length === 0) {
    return NextResponse.json({ error: 'データベースが設定されていません。管理画面のNotion連携からデータベースを追加してください。' }, { status: 400 })
  }

  const since = new Date(Date.now() - 120 * 60 * 1000).toISOString()

  let totalSynced = 0
  let totalFailed = 0
  const dbResults: Record<string, { synced: number; failed: number }> = {}

  for (const databaseId of allDatabases) {
    try {
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

      if (!res.ok) continue

      const data = await res.json()
      const pageIds: string[] = (data.results as Array<{ id: string }>).map(p => p.id)

      let synced = 0, failed = 0
      for (const pageId of pageIds) {
        const result = await importNotionPage(pageId)
        if (result.success) synced++
        else failed++
      }

      dbResults[databaseId] = { synced, failed }
      totalSynced += synced
      totalFailed += failed
    } catch {
      dbResults[databaseId] = { synced: 0, failed: 1 }
      totalFailed++
    }
  }

  return NextResponse.json({
    synced: totalSynced,
    failed: totalFailed,
    databases: dbResults,
  })
}
