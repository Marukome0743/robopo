function Sk({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ""}`} />
}

const courseCards = ["cc0", "cc1", "cc2", "cc3"]
const manageItems = ["m0", "m1", "m2", "m3", "m4"]

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 animate-[skeletonFadeIn_0.3s_ease-out]">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Scoring card skeleton */}
        <div className="md:col-span-2">
          <div className="rounded-box border border-primary/20 bg-base-100 p-5 shadow-sm ring-1 ring-primary/10">
            {/* Card header */}
            <div className="mb-4 flex items-center gap-2">
              <Sk className="h-9 w-9 rounded-lg" />
              <Sk className="h-5 w-14" />
            </div>
            {/* Competition selector */}
            <div className="space-y-4">
              <div>
                <Sk className="mb-1 h-3.5 w-20" />
                <Sk className="h-10 w-full rounded-lg" />
              </div>
              {/* Judge selector */}
              <div>
                <Sk className="mb-1 h-3.5 w-24" />
                <Sk className="h-10 w-full rounded-lg" />
              </div>
              {/* Course cards grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {courseCards.map((id, i) => (
                  <div
                    key={id}
                    className="flex min-h-[72px] items-center gap-3 rounded-xl border border-base-300 px-4 py-3"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <Sk className="h-10 w-10 shrink-0 rounded-lg" />
                    <Sk className="h-4 w-3/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Management card skeleton */}
        <div className="md:col-span-2">
          <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
            {/* Card header */}
            <div className="mb-4 flex items-center gap-2">
              <Sk className="h-9 w-9 rounded-lg" />
              <Sk className="h-5 w-20" />
            </div>
            {/* Nav links */}
            <div className="grid gap-2">
              {manageItems.map((id, i) => (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-base-300 px-4 py-3"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Sk className="h-6 w-6 shrink-0 rounded" />
                  <Sk className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
