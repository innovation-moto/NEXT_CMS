import { adminSupabase } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import RichTextRenderer from '@/components/common/RichTextRenderer'

export const dynamic = 'force-dynamic'

export default async function AdminPreviewPage({ params }: { params: { id: string } }) {
  const { data: post } = await adminSupabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!post) notFound()

  const { data: section } = await adminSupabase
    .from('sections')
    .select('name, label')
    .eq('name', post.type)
    .maybeSingle()

  let categoryName: string | null = null
  if (post.category_id) {
    const { data: cat } = await adminSupabase
      .from('categories')
      .select('name')
      .eq('id', post.category_id)
      .maybeSingle()
    categoryName = cat?.name ?? null
  }

  const backHref = post.notion_page_id
    ? `/admin/notion/${post.id}/edit`
    : `/admin/posts/${post.id}/edit`

  return (
    <div>
      {/* プレビューバー */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-yellow-800/50 bg-yellow-900/20 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">プレビュー</span>
          <span className="text-xs text-yellow-400/70">
            ステータス: {post.status === 'published' ? '公開' : post.status === 'draft' ? '下書き' : 'アーカイブ'}
          </span>
        </div>
        <Link
          href={backHref}
          className="rounded-lg border border-yellow-800/50 px-3 py-1.5 text-xs text-yellow-400 hover:border-yellow-600"
        >
          ← 編集に戻る
        </Link>
      </div>

      {/* コンテンツ */}
      <div className="bg-bg pb-0 pt-12">
        <div className="container relative z-10 max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {section && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                {section.label}
              </span>
            )}
            {categoryName && (
              <span className="rounded-full border border-accent/40 px-3 py-1 text-xs font-medium text-accent">
                {categoryName}
              </span>
            )}
            {post.published_at && (
              <time className="text-xs text-[#888888]" dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            )}
          </div>

          <h1 className="mb-8 font-display text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mb-8 text-lg text-[#888888]">{post.excerpt}</p>
          )}
        </div>
      </div>

      {post.thumbnail && (
        <div className="relative mx-auto mb-8 max-w-4xl overflow-hidden">
          <Image
            src={post.thumbnail}
            alt={post.title}
            width={1200}
            height={630}
            className="h-[400px] w-full object-cover"
          />
        </div>
      )}

      <article className="container max-w-3xl pb-16">
        <RichTextRenderer content={post.body} />

        {/* Notionプロパティ表示 */}
        {post.meta && typeof post.meta === 'object' && !Array.isArray(post.meta) && Object.keys(post.meta).length > 0 && (
          <div className="mt-12 rounded-xl border border-[#2a2a2a] bg-[#111118] p-6">
            <h2 className="mb-4 text-sm font-medium text-[#888888]">追加情報</h2>
            <div className="space-y-4">
              {Object.entries(post.meta as Record<string, unknown>).map(([key, value]) => {
                const isImages = Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && (value[0] as string).includes('/storage/v1/object/')
                return (
                  <div key={key}>
                    <p className="mb-2 text-xs font-medium text-[#888888]">{key}</p>
                    {isImages ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {(value as string[]).map((url, i) => (
                          <div key={i} className="relative aspect-video overflow-hidden rounded-lg">
                            <img src={url} alt={`${key} ${i + 1}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#aaa]">
                        {Array.isArray(value) ? (value as unknown[]).join(', ') : String(value ?? '')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
