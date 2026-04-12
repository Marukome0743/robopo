function Sk({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ""}`} />
}

const listRows = ["r0", "r1", "r2", "r3", "r4", "r5"]

export function PageLoadingShell({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-10 lg:px-16">
      <div className="mb-4 shrink-0">
        <h1 className="font-bold text-2xl text-base-content tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-base-content/60 text-sm">{description}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-base-300 bg-base-100 shadow-sm animate-[skeletonFadeIn_0.3s_ease-out]">
        {/* Action buttons skeleton */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Sk className="h-8 w-20 rounded-lg" />
            <Sk className="h-8 w-16 rounded-lg" />
            <Sk className="h-8 w-16 rounded-lg" />
          </div>
        </div>

        {/* Search bar skeleton */}
        <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
          <Sk className="h-10 w-full rounded-xl" />
          {/* Filter / sort bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Sk className="h-7 w-24 rounded-lg" />
            <Sk className="h-7 w-32 rounded-lg" />
          </div>
        </div>

        {/* List rows skeleton */}
        <div className="min-h-0 flex-1 space-y-0 px-4">
          {listRows.map((id, i) => (
            <div
              key={id}
              className="flex items-center gap-3 border-b border-base-200/60 py-3"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Sk className="size-5 shrink-0 rounded" />
              <Sk className="h-4 w-2/5" />
              <Sk className="ml-auto h-3 w-1/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
