import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { adminSupabase } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RichTextRenderer from '@/components/common/RichTextRenderer'
import PostCard from '@/components/common/PostCard'
import { formatDate } from '@/lib/utils'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { type: string; slug: string }
}): Promise<Metadata> {
  const { data: post } = await adminSupabase
    .from('posts')
    .select('title, excerpt, thumbnail')
    .eq('slug', params.slug)
    .eq('type', params.type)
    .maybeSingle()

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.thumbnail ? [{ url: post.thumbnail }] : [],
    },
  }
}

export default async function DynamicTypeDetailPage({
  params,
}: {
  params: { type: string; slug: string }
}) {
  const { data: section } = await adminSupabase
    .from('sections')
    .select('name, label')
    .eq('name', params.type)
    .maybeSingle()

  if (!section) notFound()

  const { data: post } = await adminSupabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('type', params.type)
    .eq('status', 'published')
    .maybeSingle()

  if (!post) notFound()

  let categoryName: string | null = null
  if ((post as any).category_id) {
    const { data: cat } = await adminSupabase
      .from('categories')
      .select('name')
      .eq('id', (post as any).category_id)
      .maybeSingle()
    categoryName = cat?.name ?? null
  }

  const { data: relatedPosts } = await adminSupabase
    .from('posts')
    .select('id, title, slug, excerpt, thumbnail, published_at, type')
    .eq('type', params.type)
    .eq('status', 'published')
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3)

  return (
    <>
      <Header />
      <main>
        <div className="relative bg-bg pb-0 pt-28">
          <div className="container relative z-10 max-w-3xl">
            <Link
              href={`/${params.type}`}
              className="mb-6 inline-flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-accent"
            >
              ← {section.label}一覧に戻る
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                {section.label}
              </span>
              {categoryName && (
                <span className="rounded-full border border-accent/40 px-3 py-1 text-xs font-medium text-accent">
                  {categoryName}
                </span>
              )}
              <time className="text-xs text-[#888888]" dateTime={post.published_at ?? ''}>
                {formatDate(post.published_at)}
              </time>
            </div>

            <h1 className="mb-8 font-display text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
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
        </article>

        {relatedPosts && relatedPosts.length > 0 && (
          <section className="border-t border-border bg-bg-card py-16">
            <div className="container">
              <h2 className="section-title mb-8">関連記事</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedPosts.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
