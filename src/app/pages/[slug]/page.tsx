import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createStaticClient } from '@/lib/supabase/static'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import type { Block } from '@/types/blocks'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('pages')
    .select('title')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  return data ? { title: data.title } : {}
}

export default async function StaticPageView({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createStaticClient()
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!page) notFound()

  const blocks: Block[] = Array.isArray(page.blocks) ? page.blocks : []

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg">
        {/* Page Hero */}
        <div className="border-b border-border bg-bg pt-28 pb-12">
          <div className="container max-w-3xl">
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
              {page.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-3xl py-12">
          <BlockRenderer blocks={blocks} />
        </div>
      </main>
      <Footer />
    </>
  )
}
