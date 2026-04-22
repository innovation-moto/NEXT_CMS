import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import DeletePageButton from './DeletePageButton'

export default async function AdminPagesPage() {
  const { data: pages } = await adminSupabase
    .from('pages')
    .select('id, title, slug, status, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">固定ページ</h1>
          <p className="text-sm text-[#888888]">全 {pages?.length ?? 0} 件</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80"
        >
          + 新規作成
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1a1a28]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a1a28] bg-[#0d0d14]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#555]">タイトル</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#555]">スラッグ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#555]">ステータス</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[#555]">作成日</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[#555]">操作</th>
            </tr>
          </thead>
          <tbody>
            {!pages?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555]">
                  固定ページがありません
                </td>
              </tr>
            )}
            {pages?.map((page) => (
              <tr key={page.id} className="border-b border-[#1a1a28] transition-colors hover:bg-[#0d0d14]">
                <td className="px-4 py-3 font-medium text-white">{page.title}</td>
                <td className="px-4 py-3 text-[#888]">
                  <a
                    href={`/pages/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    /pages/{page.slug}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    page.status === 'published'
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-[#1a1a2e] text-[#888]'
                  }`}>
                    {page.status === 'published' ? '公開中' : '下書き'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#888]">{formatDate(page.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="text-xs text-accent hover:underline"
                    >
                      編集
                    </Link>
                    <DeletePageButton id={page.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
