export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-bg-card pb-12 pt-28">
        <div className="container">
          <div className="h-4 w-32 animate-pulse rounded bg-[#2a2a2a]" />
          <div className="mt-4 h-10 w-48 animate-pulse rounded bg-[#2a2a2a]" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-[#2a2a2a]" />
        </div>
      </div>
      <div className="section">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-bg-card overflow-hidden">
                <div className="aspect-square animate-pulse bg-[#2a2a2a]" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#2a2a2a]" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#2a2a2a]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
