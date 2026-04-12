"use client"

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import type { JudgeSummary } from "@/app/components/summary/utils"

type JudgeSortKey =
  | "judgeName"
  | "scoredPlayerCount"
  | "firstScoringTime"
  | "lastScoringTime"
  | "totalScoringCount"
  | "courseCount"
  | "averageScore"
  | "courseOutCount"

type SortCondition = {
  key: JudgeSortKey
  order: "asc" | "desc"
}

const SORT_OPTIONS: { value: JudgeSortKey; label: string }[] = [
  { value: "judgeName", label: "採点者名" },
  { value: "scoredPlayerCount", label: "採点人数" },
  { value: "firstScoringTime", label: "初採点時刻" },
  { value: "lastScoringTime", label: "最終採点時刻" },
  { value: "totalScoringCount", label: "採点回数" },
  { value: "courseCount", label: "担当コース数" },
  { value: "averageScore", label: "平均スコア" },
  { value: "courseOutCount", label: "コースアウト判定数" },
]

const TIME_SORT_KEYS = new Set<JudgeSortKey>([
  "firstScoringTime",
  "lastScoringTime",
])

function getSortLabel(key: JudgeSortKey): string {
  return SORT_OPTIONS.find((o) => o.value === key)?.label ?? key
}

function getOrderLabel(key: JudgeSortKey, order: "asc" | "desc"): string {
  if (key === "judgeName") {
    return order === "desc" ? "Z→A" : "A→Z"
  }
  if (TIME_SORT_KEYS.has(key)) {
    return order === "desc" ? "新しい順" : "古い順"
  }
  return order === "desc" ? "大きい順" : "小さい順"
}

function compareBySortKey(
  a: JudgeSummary,
  b: JudgeSummary,
  key: JudgeSortKey,
): number {
  switch (key) {
    case "judgeName":
      return (a.judgeName ?? "").localeCompare(b.judgeName ?? "", "ja")
    case "firstScoringTime":
    case "lastScoringTime": {
      const aTime = a[key] ? Date.parse(a[key] as string) : Infinity
      const bTime = b[key] ? Date.parse(b[key] as string) : Infinity
      return aTime - bTime
    }
    default: {
      const aV = (a[key] as number) ?? 0
      const bV = (b[key] as number) ?? 0
      return aV - bV
    }
  }
}

function formatTimestamp(iso: string | null): string {
  if (!iso) {
    return "-"
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return "-"
  }
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

type Props = {
  competitionId: number
}

export function JudgeSummaryTable({ competitionId }: Props) {
  const [rawData, setRawData] = useState<JudgeSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [playerDetailNames, setPlayerDetailNames] = useState<string[] | null>(
    null,
  )
  const [sortConditions, setSortConditions] = useState<SortCondition[]>([
    { key: "totalScoringCount", order: "desc" },
  ])

  const availableKeys = SORT_OPTIONS.filter(
    (opt) => !sortConditions.some((sc) => sc.key === opt.value),
  )

  const addSort = (key: JudgeSortKey) => {
    if (sortConditions.some((sc) => sc.key === key)) {
      return
    }
    setSortConditions((prev) => [...prev, { key, order: "desc" }])
  }

  const removeSort = (index: number) => {
    setSortConditions((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleOrder = (index: number) => {
    setSortConditions((prev) =>
      prev.map((sc, i) =>
        i === index
          ? { ...sc, order: sc.order === "asc" ? "desc" : "asc" }
          : sc,
      ),
    )
  }

  useEffect(() => {
    if (!competitionId) {
      setRawData([])
      return
    }
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/summary/judge/${competitionId}`, {
          cache: "no-store",
        })
        const data = await res.json()
        setRawData(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [competitionId])

  const filteredAndSorted = (() => {
    let list = rawData

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((j) => j.judgeName?.toLowerCase().includes(q) ?? false)
    }

    return [...list].sort((a, b) => {
      for (const { key, order } of sortConditions) {
        const cmp = compareBySortKey(a, b, key)
        if (cmp !== 0) {
          return order === "asc" ? cmp : -cmp
        }
      }
      return 0
    })
  })()

  const columns = [
    "ID",
    "採点者名",
    "採点人数",
    "初採点時刻",
    "最終採点時刻",
    "採点回数",
    "担当コース数",
    "担当コース",
    "平均スコア",
    "コースアウト判定数",
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Search & Multi-sort bar */}
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
        <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-base-content/40" />
          <input
            type="text"
            placeholder="採点者名で検索"
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>

        {/* Sort chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-base-content/40 text-xs">ソート:</span>
          {sortConditions.map((sc, index) => (
            <div
              key={sc.key}
              className="flex items-center gap-1 rounded-lg border border-base-300 bg-base-100 px-2 py-1 shadow-sm"
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                {index + 1}
              </span>
              <span className="font-medium text-xs">
                {getSortLabel(sc.key)}
              </span>
              <button
                type="button"
                className="flex items-center gap-0.5 rounded-md bg-base-200/60 px-1.5 py-0.5 text-xs transition-colors hover:bg-base-300/60"
                onClick={() => toggleOrder(index)}
              >
                {sc.order === "desc" ? (
                  <BarsArrowDownIcon className="size-3" />
                ) : (
                  <BarsArrowUpIcon className="size-3" />
                )}
                {getOrderLabel(sc.key, sc.order)}
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-full p-0.5 text-base-content/40 transition-colors hover:bg-error/10 hover:text-error"
                onClick={() => removeSort(index)}
                aria-label={`${getSortLabel(sc.key)}のソートを削除`}
              >
                <XMarkIcon className="size-3.5" />
              </button>
            </div>
          ))}

          {availableKeys.length > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-base-200/50 px-1.5 py-1">
              <PlusIcon className="size-3.5 shrink-0 text-base-content/40" />
              <select
                className="select select-ghost select-xs bg-transparent font-medium text-base-content/60 focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addSort(e.target.value as JudgeSortKey)
                    e.target.value = ""
                  }
                }}
              >
                <option value="" disabled>
                  追加
                </option>
                {availableKeys.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sortConditions.length > 1 && (
            <button
              type="button"
              className="text-base-content/40 text-xs transition-colors hover:text-error"
              onClick={() =>
                setSortConditions([{ key: "totalScoringCount", order: "desc" }])
              }
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        {searchQuery && filteredAndSorted.length === 0 ? (
          <div className="py-8 text-center text-base-content/40">
            条件に一致する採点者が見つかりません
          </div>
        ) : (
          <div className="m-3 min-h-0 overflow-x-auto overflow-y-auto rounded-xl border border-base-300/50">
            <table className="table-pin-rows table-zebra table">
              <thead>
                <tr className="border-base-300/50 border-b bg-base-200/60">
                  {columns.map((label) => (
                    <th
                      key={label}
                      className="whitespace-nowrap py-3 font-semibold text-base-content/50 text-xs uppercase tracking-wider"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  ["sk0", "sk1", "sk2", "sk3", "sk4"].map((id, i) => (
                    <tr key={id}>
                      {columns.map((col) => (
                        <td key={col} className="py-3">
                          <div
                            className="skeleton-shimmer h-4 w-full rounded"
                            style={{ animationDelay: `${i * 60}ms` }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((judge) => (
                    <tr
                      key={judge.judgeId}
                      className="transition-colors duration-150 hover:bg-primary/5"
                    >
                      <td className="py-3">{judge.judgeId}</td>
                      <td className="whitespace-nowrap py-3 font-medium">
                        {judge.judgeName}
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="badge badge-primary badge-outline cursor-pointer transition-colors hover:bg-primary hover:text-primary-content"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPlayerDetailNames(judge.scoredPlayerNames ?? [])
                          }}
                        >
                          {judge.scoredPlayerCount}
                        </button>
                      </td>
                      <td className="whitespace-nowrap py-3">
                        {formatTimestamp(judge.firstScoringTime)}
                      </td>
                      <td className="whitespace-nowrap py-3">
                        {formatTimestamp(judge.lastScoringTime)}
                      </td>
                      <td className="py-3">{judge.totalScoringCount}</td>
                      <td className="py-3">{judge.courseCount}</td>
                      <td className="max-w-[200px] py-3">
                        <div className="line-clamp-2 text-xs">
                          {judge.courseNames?.join(", ") || "-"}
                        </div>
                      </td>
                      <td className="py-3">{judge.averageScore ?? "-"}</td>
                      <td className="py-3">{judge.courseOutCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-12 text-center text-base-content/40"
                    >
                      データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Player detail modal */}
      {playerDetailNames !== null && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">採点選手一覧</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setPlayerDetailNames(null)}
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {playerDetailNames.length > 0 ? (
                <ul className="space-y-1.5">
                  {playerDetailNames.map((name) => (
                    <li
                      key={name}
                      className="rounded-lg bg-base-200/50 px-3 py-2.5 text-sm"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-base-content/40 text-sm">
                  採点した選手はいません
                </p>
              )}
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn rounded-lg"
                onClick={() => setPlayerDetailNames(null)}
              >
                閉じる
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setPlayerDetailNames(null)}
            onKeyDown={(e) => e.key === "Escape" && setPlayerDetailNames(null)}
          >
            <button type="button" className="cursor-default">
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  )
}
