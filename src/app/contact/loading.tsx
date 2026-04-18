export default function ContactLoading() {
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
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-6">
              <div className="h-4 w-24 animate-pulse rounded bg-[#2a2a2a]" />
              <div className="h-6 w-40 animate-pulse rounded bg-[#2a2a2a]" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-[#2a2a2a]" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 animate-pulse rounded bg-[#2a2a2a]" />
                    <div className="h-4 w-40 animate-pulse rounded bg-[#2a2a2a]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-bg-card p-8 space-y-4">
                <div className="h-6 w-40 animate-pulse rounded bg-[#2a2a2a]" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 animate-pulse rounded-lg bg-[#2a2a2a]" />
                  <div className="h-12 animate-pulse rounded-lg bg-[#2a2a2a]" />
                </div>
                <div className="h-12 animate-pulse rounded-lg bg-[#2a2a2a]" />
                <div className="h-36 animate-pulse rounded-lg bg-[#2a2a2a]" />
                <div className="h-12 animate-pulse rounded-full bg-[#2a2a2a]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
