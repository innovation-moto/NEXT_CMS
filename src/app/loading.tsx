export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-accent" />
        </div>
        <p className="text-sm text-[#555]">Loading...</p>
      </div>
    </div>
  )
}
