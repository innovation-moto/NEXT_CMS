export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero skeleton */}
      <div className="bg-bg-card pb-12 pt-28">
        <div className="container">
          <div className="h-4 w-32 animate-pulse rounded bg-[#2a2a2a]" />
          <div className="mt-4 h-10 w-48 animate-pulse rounded bg-[#2a2a2a]" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-[#2a2a2a]" />
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="section">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-bg-card">
                <div className="aspect-[16/9] animate-pulse bg-[#2a2a2a]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#2a2a2a]" />
                  <div className="h-5 w-full animate-pulse rounded bg-[#2a2a2a]" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-[#2a2a2a]" />
                  <div className="h-4 w-3/5 animate-pulse rounded bg-[#2a2a2a]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
