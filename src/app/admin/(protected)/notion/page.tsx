import { adminSupabase } from '@/lib/supabase/admin'
import { getNotionConfig } from '@/lib/actions/notion-config'
import NotionClient from './NotionClient'
import NotionPostsList, { type DatabaseSection } from './NotionPostsList'

export const dynamic = 'force-dynamic'

export default async function AdminNotionPage() {
  const [config, { data: posts }] = await Promise.all([
    getNotionConfig(),
    adminSupabase
      .from('posts')
      .select('id, title, type, status, notion_page_id, notion_database_id, updated_at')
      .not('notion_page_id', 'is', null)
      .order('updated_at', { ascending: false }),
  ])

  // データベースIDごとにグループ化
  const grouped = new Map<string, typeof posts>()
  for (const post of posts ?? []) {
    const key = post.notion_database_id ?? '__other__'
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(post)
  }

  // 登録済みデータベースのセクション
  const sections: DatabaseSection[] = config.databases.map(db => ({
    databaseId: db.id,
    label: db.label,
    posts: (grouped.get(db.id) ?? []) as DatabaseSection['posts'],
  }))

  // どのDBにも属さない記事（手動インポートや旧データ）
  const knownIds = new Set(config.databases.map(d => d.id))
  const otherPosts = (posts ?? []).filter(
    p => !p.notion_database_id || !knownIds.has(p.notion_database_id)
  ) as DatabaseSection['posts']

  if (otherPosts.length > 0) {
    sections.push({ databaseId: null, label: 'その他（手動インポート等）', posts: otherPosts })
  }

  const totalCount = (posts ?? []).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Notion連携</h1>
        <p className="text-sm text-[#888888]">NotionデータベースをCMSと連携して記事を管理します</p>
      </div>

      {/* 設定パネル */}
      <NotionClient config={config} />

      {/* 連携済み記事 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">
            連携済み記事
            {totalCount > 0 && (
              <span className="ml-2 text-xs font-normal text-[#555]">合計 {totalCount} 件</span>
            )}
          </h2>
        </div>
        <NotionPostsList sections={sections} />
      </div>
    </div>
  )
}
