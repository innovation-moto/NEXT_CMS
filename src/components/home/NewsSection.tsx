import Link from 'next/link'
import PostCard from '@/components/common/PostCard'
import ScrollAnimWrapper from '@/components/common/ScrollAnimWrapper'
import type { Post } from '@/types/supabase'

interface Props {
  posts: (Pick<Post, 'title' | 'slug' | 'excerpt' | 'thumbnail' | 'published_at' | 'type'> & { categories?: { name: string } | null })[]
}

export default function NewsSection({ posts }: Props) {
  if (posts.length === 0) return null

  return (
    <section className="section bg-bg">
      <div className="container">
        {/* Header */}
        <ScrollAnimWrapper animation="fadeIn" className="mb-12 flex items-end justify-between">
          <div>
            <p className="section-label">Latest</p>
            <h2 className="section-title">News</h2>
          </div>
          <Link
            href="/news"
            className="hidden items-center gap-2 text-sm text-[#888888] transition-colors hover:text-accent md:flex"
          >
            すべて見る →
          </Link>
        </ScrollAnimWrapper>

        {/* Grid */}
        <ScrollAnimWrapper animation="stagger" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ScrollAnimWrapper>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm text-[#888888] transition-colors hover:border-accent hover:text-accent"
          >
            すべてのニュースを見る →
          </Link>
        </div>
      </div>
    </section>
  )
}
