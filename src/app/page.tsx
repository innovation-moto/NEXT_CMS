import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSlider from '@/components/home/HeroSlider'
import NewsSection from '@/components/home/NewsSection'
import BlogSection from '@/components/home/BlogSection'
import ScrollAnimWrapper from '@/components/common/ScrollAnimWrapper'
import Link from 'next/link'

export const revalidate = 60

const services = [
  {
    icon: '🎵',
    title: '音楽プロダクション',
    description: 'プロフェッショナルな音楽制作から編曲、マスタリングまでをワンストップで提供します。',
  },
  {
    icon: '🎛️',
    title: 'サウンドデザイン',
    description: 'ゲーム、映像、インスタレーションのための独創的なサウンドデザインを手がけます。',
  },
  {
    icon: '🌐',
    title: 'デジタル配信支援',
    description: '音楽ストリーミングサービスへの配信から戦略立案まで、デジタル展開をサポートします。',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: newsPosts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, thumbnail, published_at, type, category_id')
    .eq('type', 'news')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  const { data: blogPosts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, thumbnail, published_at, type, category_id')
    .eq('type', 'blog')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  // カテゴリ名をまとめて取得
  const allPosts = [...(newsPosts ?? []), ...(blogPosts ?? [])]
  const categoryIds = [...new Set(allPosts.map((p: any) => p.category_id).filter(Boolean))]
  let categoryMap: Record<string, string> = {}
  if (categoryIds.length > 0) {
    const { data: cats } = await adminSupabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)
    cats?.forEach((c: any) => { categoryMap[c.id] = c.name })
  }

  const withCategory = (posts: any[]) =>
    posts.map((p) => ({
      ...p,
      categories: p.category_id ? { name: categoryMap[p.category_id] ?? null } : null,
    }))

  return (
    <>
      <Header />
      <main>
        {/* Hero Slider */}
        <HeroSlider />

        {/* News Section */}
        <NewsSection posts={withCategory(newsPosts ?? [])} />

        {/* Blog Section */}
        <BlogSection posts={withCategory(blogPosts ?? [])} />

        {/* Services Teaser */}
        <section className="section bg-bg">
          <div className="container">
            <ScrollAnimWrapper animation="fadeIn" className="mb-12 text-center">
              <p className="section-label">What We Do</p>
              <h2 className="section-title">Our Services</h2>
              <p className="mx-auto mt-4 max-w-xl text-[#888888]">
                音楽とテクノロジーを融合させた、革新的なサービスを提供します。
              </p>
            </ScrollAnimWrapper>

            <ScrollAnimWrapper animation="stagger" className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-xl border border-border bg-bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                    {service.icon}
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-white">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#888888]">
                    {service.description}
                  </p>
                </div>
              ))}
            </ScrollAnimWrapper>

            <div className="mt-10 text-center">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 text-sm text-[#888888] transition-all hover:border-accent hover:text-accent"
              >
                サービス詳細を見る →
              </Link>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="section bg-bg-card">
          <div className="container">
            <ScrollAnimWrapper animation="fadeUp">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-bg p-10 text-center md:p-16">
                {/* Glow effects */}
                <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

                <p className="section-label relative z-10 mb-4 text-center">Get In Touch</p>
                <h2 className="section-title relative z-10 mx-auto mb-4">
                  プロジェクトを一緒に
                  <br />
                  <span className="gradient-text">始めましょう</span>
                </h2>
                <p className="relative z-10 mx-auto mb-8 max-w-md text-[#888888]">
                  音楽プロジェクト、コラボレーション、その他どんなご相談もお気軽にどうぞ。
                </p>
                <Link
                  href="/contact"
                  className="relative z-10 inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 font-medium text-white transition-all hover:bg-accent/80 hover:shadow-[0_0_32px_rgba(229,62,62,0.4)]"
                >
                  お問い合わせはこちら →
                </Link>
              </div>
            </ScrollAnimWrapper>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
