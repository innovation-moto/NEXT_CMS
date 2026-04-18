export default function AboutLoading() {
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
        <div className="container space-y-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-[#2a2a2a]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#2a2a2a]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#2a2a2a]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#2a2a2a]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#2a2a2a]" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[#2a2a2a]" />
            </div>
            <div className="aspect-video animate-pulse rounded-xl bg-[#2a2a2a]" />
          </div>
        </div>
      </div>
    </div>
  )
}
