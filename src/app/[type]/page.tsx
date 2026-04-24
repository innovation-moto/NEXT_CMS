import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/common/PageHero'
import PostCard from '@/components/common/PostCard'
import Pagination from '@/components/common/Pagination'
import ScrollAnimWrapper from '@/components/common/ScrollAnimWrapper'

export const revalidate = 60

const PER_PAGE = 12

async function getSection(type: string) {
  const { data } = await adminSupabase
    .from('sections')
    .select('*')
    .eq('name', type)
    .maybeSingle()
  return data
}

export async function generateMetadata({
  params,
}: {
  params: { type: string }
}): Promise<Metadata> {
  const section = await getSection(params.type)
  if (!section) return {}
  return {
    title: section.label,
    description: `${section.label}の記事一覧`,
  }
}

export default async function DynamicTypePage({
  params,
  searchParams,
}: {
  params: { type: string }
  searchParams: { page?: string }
}) {
  const section = await getSection(params.type)
  if (!section) notFound()

  const page = parseInt(searchParams.page ?? '1')

  const { data: posts, count } = await adminSupabase
    .from('posts')
    .select('id, title, slug, excerpt, thumbnail, published_at, type, category_id', { count: 'exact' })
    .eq('type', params.type)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  const categoryIds = Array.from(
    new Set((posts ?? []).map((p: any) => p.category_id).filter(Boolean))
  )
  let categoryMap: Record<string, string> = {}
  if (categoryIds.length > 0) {
    const { data: cats } = await adminSupabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)
    cats?.forEach((c: any) => { categoryMap[c.id] = c.name })
  }

  const postsWithCategory = (posts ?? []).map((p: any) => ({
    ...p,
    categories: p.category_id ? { name: categoryMap[p.category_id] ?? null } : null,
  }))

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE)

  return (
    <>
      <Header />
      <main>
        <PageHero
          title={section.label}
          subtitle={`${section.label}の記事一覧`}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: section.label }]}
        />

        <section className="section bg-bg">
          <div className="container">
            {postsWithCategory.length > 0 ? (
              <>
                <ScrollAnimWrapper animation="stagger" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {postsWithCategory.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </ScrollAnimWrapper>

                {totalPages > 1 && (
                  <ScrollAnimWrapper animation="fadeUp" className="mt-12">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      basePath={`/${params.type}`}
                    />
                  </ScrollAnimWrapper>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg text-[#888888]">現在公開中の記事はありません。</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
