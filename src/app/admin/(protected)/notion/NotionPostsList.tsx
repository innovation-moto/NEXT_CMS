'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate, getStatusLabel } from '@/lib/utils'

export interface NotionPost {
  id: string
  title: string
  type: string
  status: string
  notion_page_id: string | null
  notion_database_id: string | null
  updated_at: string
}

export interface DatabaseSection {
  databaseId: string | null
  label: string
  posts: NotionPost[]
}

export default function NotionPostsList({ sections }: { sections: DatabaseSection[] }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  function toggle(id: string) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (sections.length === 0 || sections.every(s => s.posts.length === 0)) {
    return (
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] px-5 py-12 text-center">
        <p className="text-sm text-[#888]">インポートされた記事がありません。</p>
        <p className="mt-1 text-xs text-[#555]">上のパネルからデータベースを登録するか、ページを手動インポートしてください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const key = section.databaseId ?? '__other__'
        const isCollapsed = collapsed[key] ?? false

        return (
          <div key={key} className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111118]">
            {/* セクションヘッダー */}
            <button
              type="button"
              onClick={() => toggle(key)}
              className="flex w-full items-center justify-between gap-4 border-b border-[#2a2a2a] bg-[#1a1a28] px-5 py-3.5 transition-colors hover:bg-[#1e1e32] text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">{section.label}</span>
                <span className="rounded-full bg-[#2a2a3a] px-2.5 py-0.5 text-xs font-medium text-[#888]">
                  {section.posts.length}件
                </span>
                {section.databaseId && (
                  <span className="hidden font-mono text-xs text-[#444] sm:inline">
                    {section.databaseId.slice(0, 8)}…
                  </span>
                )}
              </div>
              <span className={`text-[#555] text-xs transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}>
                ▼
              </span>
            </button>

            {/* テーブル */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]">
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-[#555]">タイトル</th>
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-[#555]">種別</th>
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-[#555]">ステータス</th>
                      <th className="px-5 py-2.5 text-left text-xs font-medium text-[#555]">最終更新</th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium text-[#555]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1a]">
                    {section.posts.map((post) => (
                      <tr key={post.id} className="transition-colors hover:bg-[#151520]">
                        <td className="px-5 py-3">
                          <p className="max-w-xs truncate text-sm font-medium text-white">{post.title}</p>
                          <p className="font-mono text-xs text-[#444]">{post.notion_page_id}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-[#888]">{post.type}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            post.status === 'published'
                              ? 'bg-green-900/30 text-green-400'
                              : post.status === 'draft'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-[#2a2a2a] text-[#888]'
                          }`}>
                            {getStatusLabel(post.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#888]">
                          {formatDate(post.updated_at)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link href={`/admin/notion/${post.id}/edit`}
                              className="text-xs text-[#888] transition-colors hover:text-accent">
                              編集
                            </Link>
                            <Link
                              href={`https://www.notion.so/${post.notion_page_id?.replace(/-/g, '')}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-xs text-[#888] transition-colors hover:text-white">
                              Notionで開く ↗
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
