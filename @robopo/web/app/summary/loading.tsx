function Sk({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className ?? ""}`} />
}

const tableRows = ["t0", "t1", "t2", "t3", "t4", "t5"]
const tableCols = ["c0", "c1", "c2", "c3", "c4", "c5", "c6"]

export default function Loading() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 py-6 sm:px-10 lg:px-16">
      <div className="mb-4 shrink-0">
        <h1 className="font-bold text-2xl text-base-content tracking-tight">
          集計結果
        </h1>
        <p className="mt-1 text-base-content/60 text-sm">
          大会を選択して集計結果を確認します
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-base-300 bg-base-100 shadow-sm animate-[skeletonFadeIn_0.3s_ease-out]">
        {/* Competition & Course selectors skeleton */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1">
              <Sk className="mb-1.5 h-3 w-10" />
              <Sk className="h-10 w-full rounded-lg" />
            </div>
            <div className="min-w-[200px] flex-1">
              <Sk className="mb-1.5 h-3 w-12" />
              <Sk className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Search bar skeleton */}
        <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
          <Sk className="h-10 w-full rounded-xl" />
          <div className="flex flex-wrap items-center gap-2">
            <Sk className="h-7 w-28 rounded-lg" />
            <Sk className="h-7 w-20 rounded-full" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="min-h-0 flex-1 overflow-hidden px-4">
          {/* Header row */}
          <div className="flex items-center gap-3 border-b border-base-300 py-2.5">
            {tableCols.map((id) => (
              <Sk key={id} className="h-3 flex-1" />
            ))}
          </div>
          {/* Data rows */}
          {tableRows.map((id, i) => (
            <div
              key={id}
              className="flex items-center gap-3 border-b border-base-200/60 py-3"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {tableCols.map((cid) => (
                <Sk key={cid} className="h-3.5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
