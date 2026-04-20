import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: draftPosts },
    { count: unreadContacts },
    { data: recentPosts },
    { data: recentContacts },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft'),
    supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false),
    supabase
      .from('posts')
      .select('id, title, type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('contact_messages')
      .select('id, name, email, subject, created_at, is_read')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const stats = [
    { label: '総投稿数', value: totalPosts ?? 0, icon: '📝', color: 'text-white' },
    { label: '公開中', value: publishedPosts ?? 0, icon: '✅', color: 'text-green-400' },
    { label: '下書き', value: draftPosts ?? 0, icon: '📋', color: 'text-yellow-400' },
    { label: '未読お問い合わせ', value: unreadContacts ?? 0, icon: '📧', color: 'text-accent' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">ダッシュボード</h1>
        <p className="text-sm text-[#888888]">Innovation Music CMS の管理画面</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-[#888888]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent posts */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111118]">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4">
            <h2 className="font-medium text-white">最近の投稿</h2>
            <Link
              href="/admin/posts"
              className="text-xs text-[#888888] hover:text-accent transition-colors"
            >
              すべて見る →
            </Link>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {recentPosts?.map((post) => (
              <div key={post.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{post.title}</p>
                  <p className="text-xs text-[#888888]">{formatDate(post.created_at)}</p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-900/30 text-green-400'
                        : post.status === 'draft'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-[#2a2a2a] text-[#888888]'
                    }`}
                  >
                    {post.status === 'published'
                      ? '公開'
                      : post.status === 'draft'
                      ? '下書き'
                      : 'アーカイブ'}
                  </span>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-xs text-[#888888] hover:text-accent"
                  >
                    編集
                  </Link>
                </div>
              </div>
            )) ?? (
              <p className="px-5 py-4 text-sm text-[#888888]">投稿はまだありません。</p>
            )}
          </div>
        </div>

        {/* Recent contacts */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111118]">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] px-5 py-4">
            <h2 className="font-medium text-white">お問い合わせ</h2>
            <Link
              href="/admin/contact"
              className="text-xs text-[#888888] hover:text-accent transition-colors"
            >
              すべて見る →
            </Link>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {recentContacts?.map((msg) => (
              <div key={msg.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{msg.name}</p>
                    <p className="text-xs text-[#888888]">{msg.email}</p>
                    {msg.subject && (
                      <p className="mt-0.5 text-xs text-[#888888] truncate max-w-xs">
                        {msg.subject}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!msg.is_read && (
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    )}
                    <span className="text-xs text-[#888888]">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )) ?? (
              <p className="px-5 py-4 text-sm text-[#888888]">お問い合わせはありません。</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/posts/new?type=news"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/80"
        >
          + ニュースを作成
        </Link>
        <Link
          href="/admin/posts/new?type=blog"
          className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#111118] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-accent/40"
        >
          + ブログを作成
        </Link>
        <Link
          href="/admin/media"
          className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#111118] px-4 py-2.5 text-sm font-medium text-[#888888] transition-all hover:border-accent/40 hover:text-white"
        >
          メディアをアップロード
        </Link>
      </div>
    </div>
  )
}
