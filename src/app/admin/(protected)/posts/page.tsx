import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, getStatusLabel } from '@/lib/utils'
import DeletePostButton from './DeletePostButton'
import { getSections } from '@/lib/actions/sections'

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { type?: string; page?: string; search?: string }
}) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 20
  const type = searchParams.type ?? 'all'
  const search = searchParams.search

  let query = supabase
    .from('posts')
    .select('id, title, slug, type, status, created_at, published_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1)

  if (type !== 'all') query = query.eq('type', type)
  if (search) query = query.ilike('title', `%${search}%`)

  const [{ data: posts, count }, sections] = await Promise.all([query, getSections()])
  const totalPages = Math.ceil((count ?? 0) / perPage)

  const matchedSection = sections.find((s) => s.name === type)
  const pageTitle = matchedSection ? matchedSection.label : type !== 'all' ? type : '投稿管理'
  const newPostHref = type !== 'all' ? `/admin/posts/new?type=${type}` : '/admin/posts/new'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{pageTitle}</h1>
          <p className="text-sm text-[#888888]">全 {count ?? 0} 件</p>
        </div>
        <Link
          href={newPostHref}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80"
        >
          + 新規作成
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="flex-1">
          <input
            type="hidden"
            name="type"
            value={type}
          />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="タイトルで検索..."
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#111118] px-4 py-2 text-sm text-white placeholder-[#555] focus:border-accent focus:outline-none sm:max-w-xs"
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111118]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#1a1a28]">
                <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">タイトル</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">種別</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">ステータス</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">作成日</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-[#888888]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {posts?.map((post) => (
                <tr key={post.id} className="hover:bg-[#1a1a28] transition-colors">
                  <td className="px-5 py-3">
                    <p className="max-w-xs truncate text-sm font-medium text-white">
                      {post.title}
                    </p>
                    <p className="text-xs text-[#888888]">//{post.type}/{post.slug}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-[#888888]">
                      {sections.find((s) => s.name === post.type)?.label ?? post.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-900/30 text-green-400'
                          : post.status === 'draft'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-[#2a2a2a] text-[#888888]'
                      }`}
                    >
                      {getStatusLabel(post.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#888888]">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-xs text-[#888888] hover:text-accent transition-colors"
                      >
                        編集
                      </Link>
                      <DeletePostButton postId={post.id} postTitle={post.title} />
                    </div>
                  </td>
                </tr>
              )) ?? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#888888]">
                    投稿が見つかりませんでした。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/posts?type=${type}&page=${p}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm ${
                p === page
                  ? 'border-accent bg-accent text-white'
                  : 'border-[#2a2a2a] text-[#888888] hover:border-accent/40'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
