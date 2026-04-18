export default function ServicesLoading() {
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-bg-card p-6 space-y-4">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-[#2a2a2a]" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-[#2a2a2a]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#2a2a2a]" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-[#2a2a2a]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
