import Link from 'next/link'

interface Props {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="ページネーション"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-card text-sm text-[#888888] transition-colors hover:border-accent hover:text-accent"
          aria-label="前のページ"
        >
          ←
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-card text-sm text-[#888888]/40 cursor-not-allowed">
          ←
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page) => {
        const isActive = page === currentPage
        return (
          <Link
            key={page}
            href={`${basePath}?page=${page}`}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              isActive
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-bg-card text-[#888888] hover:border-accent hover:text-accent'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      })}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-card text-sm text-[#888888] transition-colors hover:border-accent hover:text-accent"
          aria-label="次のページ"
        >
          →
        </Link>
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-card text-sm text-[#888888]/40 cursor-not-allowed">
          →
        </span>
      )}
    </nav>
  )
}
