import Link from 'next/link'
import Image from 'next/image'
import { formatDate, truncate } from '@/lib/utils'
import type { Post } from '@/types/supabase'

interface Props {
  post: Pick<Post, 'title' | 'slug' | 'excerpt' | 'thumbnail' | 'published_at' | 'type'> & {
    categories?: { name: string } | null
  }
}

function isNew(publishedAt: string | null): boolean {
  if (!publishedAt) return false
  return Date.now() - new Date(publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

export default function PostCard({ post }: Props) {
  const href = `/${post.type}/${post.slug}`
  const showNew = isNew(post.published_at)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Thumbnail */}
      <Link href={href} className="relative block aspect-[16/9] overflow-hidden bg-bg-elevated">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <span className="text-xl text-accent">♪</span>
            </div>
          </div>
        )}
        {/* New badge */}
        {showNew && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            New
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Date + Category */}
        <div className="mb-2 flex items-center gap-2">
          <time className="text-xs text-[#888888]" dateTime={post.published_at ?? ''}>
            {formatDate(post.published_at)}
          </time>
          {post.categories?.name && (
            <span className="rounded-full border border-accent/30 px-2 py-0.5 text-xs text-accent">
              {post.categories.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="mb-2 font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-accent">
          <Link href={href}>
            {truncate(post.title, 60)}
          </Link>
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-4 text-sm leading-relaxed text-[#888888]">
            {truncate(post.excerpt, 100)}
          </p>
        )}

        {/* Read more */}
        <div className="mt-auto">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-gap hover:gap-3"
          >
            Read more
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
