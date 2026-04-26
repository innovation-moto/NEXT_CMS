import { adminSupabase } from '@/lib/supabase/admin'
import { getNotionConfig } from '@/lib/actions/notion-config'
import { formatDate, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import NotionClient from './NotionClient'

export const dynamic = 'force-dynamic'

export default async function AdminNotionPage() {
  const [config, { data: posts, count, error }] = await Promise.all([
    getNotionConfig(),
    adminSupabase
      .from('posts')
      .select('id, title, slug, type, status, notion_page_id, updated_at', { count: 'exact' })
      .not('notion_page_id', 'is', null)
      .order('updated_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Notion連携</h1>
        <p className="text-sm text-[#888888]">NotionデータベースをCMSと連携して記事を管理します</p>
      </div>

      {/* 設定パネル */}
      <NotionClient config={config} />

      {/* 連携済み記事一覧 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">連携済み記事 {count != null ? `(${count}件)` : ''}</h2>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-5">
            <p className="text-sm text-red-400">取得エラー: {error.message}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111118]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a] bg-[#1a1a28]">
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">タイトル</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">種別</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">ステータス</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">最終更新</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-[#888888]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {posts && posts.length > 0 ? posts.map((post) => (
                    <tr key={post.id} className="transition-colors hover:bg-[#1a1a28]">
                      <td className="px-5 py-3">
                        <p className="max-w-xs truncate text-sm font-medium text-white">{post.title}</p>
                        <p className="font-mono text-xs text-[#555]">{post.notion_page_id}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-[#888888]">{post.type}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-900/30 text-green-400'
                            : post.status === 'draft'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-[#2a2a2a] text-[#888888]'
                        }`}>
                          {getStatusLabel(post.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#888888]">
                        {formatDate(post.updated_at)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/notion/${post.id}/edit`}
                            className="text-xs text-[#888888] transition-colors hover:text-accent">
                            編集
                          </Link>
                          <Link
                            href={`https://www.notion.so/${post.notion_page_id?.replace(/-/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#888888] transition-colors hover:text-white">
                            Notionで開く
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <p className="text-sm text-[#888888]">インポートされた記事がありません。</p>
                        <p className="mt-1 text-xs text-[#555]">上のパネルからデータベースを登録するか、ページを手動インポートしてください。</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
