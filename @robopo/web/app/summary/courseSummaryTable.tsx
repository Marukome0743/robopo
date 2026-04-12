"use client"

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import type { CourseCompetitionSummary } from "@/app/components/summary/utils"

type CourseSortKey =
  | "courseName"
  | "firstChallengeTime"
  | "firstCompletionTime"
  | "lastChallengeTime"
  | "challengerCount"
  | "completionCount"
  | "completionRate"
  | "totalChallengeCount"
  | "averageScore"
  | "maxScore"
  | "courseOutCount"
  | "retryCount"

type SortCondition = {
  key: CourseSortKey
  order: "asc" | "desc"
}

const SORT_OPTIONS: { value: CourseSortKey; label: string }[] = [
  { value: "courseName", label: "コース名" },
  { value: "firstChallengeTime", label: "初挑戦時刻" },
  { value: "firstCompletionTime", label: "初完走時刻" },
  { value: "lastChallengeTime", label: "最終挑戦時刻" },
  { value: "challengerCount", label: "挑戦者数" },
  { value: "completionCount", label: "完走者数" },
  { value: "completionRate", label: "完走率" },
  { value: "totalChallengeCount", label: "総挑戦回数" },
  { value: "averageScore", label: "平均スコア" },
  { value: "maxScore", label: "最高スコア" },
  { value: "courseOutCount", label: "コースアウト数" },
  { value: "retryCount", label: "リトライ数" },
]

const TIME_SORT_KEYS = new Set<CourseSortKey>([
  "firstChallengeTime",
  "firstCompletionTime",
  "lastChallengeTime",
])

function getSortLabel(key: CourseSortKey): string {
  return SORT_OPTIONS.find((o) => o.value === key)?.label ?? key
}

function getOrderLabel(key: CourseSortKey, order: "asc" | "desc"): string {
  if (key === "courseName") {
    return order === "desc" ? "Z→A" : "A→Z"
  }
  if (TIME_SORT_KEYS.has(key)) {
    return order === "desc" ? "新しい順" : "古い順"
  }
  return order === "desc" ? "大きい順" : "小さい順"
}

function compareBySortKey(
  a: CourseCompetitionSummary,
  b: CourseCompetitionSummary,
  key: CourseSortKey,
): number {
  switch (key) {
    case "courseName":
      return (a.courseName ?? "").localeCompare(b.courseName ?? "", "ja")
    case "firstChallengeTime":
    case "firstCompletionTime":
    case "lastChallengeTime": {
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

export function CourseSummaryTable({ competitionId }: Props) {
  const [rawData, setRawData] = useState<CourseCompetitionSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConditions, setSortConditions] = useState<SortCondition[]>([
    { key: "challengerCount", order: "desc" },
  ])

  const availableKeys = SORT_OPTIONS.filter(
    (opt) => !sortConditions.some((sc) => sc.key === opt.value),
  )

  const addSort = (key: CourseSortKey) => {
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
        const res = await fetch(`/api/summary/course-list/${competitionId}`, {
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
      list = list.filter(
        (c) => c.courseName?.toLowerCase().includes(q) ?? false,
      )
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
    "コース名",
    "初挑戦時刻",
    "初完走時刻",
    "最終挑戦時刻",
    "挑戦者数",
    "完走者数",
    "完走率",
    "総挑戦回数",
    "平均スコア",
    "最高スコア",
    "コースアウト数",
    "リトライ数",
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Search & Multi-sort bar */}
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-4">
        <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-base-content/40" />
          <input
            type="text"
            placeholder="コース名で検索"
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
                    addSort(e.target.value as CourseSortKey)
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
                setSortConditions([{ key: "challengerCount", order: "desc" }])
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
            条件に一致するコースが見つかりません
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
                  filteredAndSorted.map((course) => (
                    <tr
                      key={course.courseId}
                      className="transition-colors duration-150 hover:bg-primary/5"
                    >
                      <td className="py-3">{course.courseId}</td>
                      <td className="whitespace-nowrap py-3 font-medium">
                        {course.courseName}
                      </td>
                      <td className="whitespace-nowrap py-3">
                        {formatTimestamp(course.firstChallengeTime)}
                      </td>
                      <td className="whitespace-nowrap py-3">
                        {formatTimestamp(course.firstCompletionTime)}
                      </td>
                      <td className="whitespace-nowrap py-3">
                        {formatTimestamp(course.lastChallengeTime)}
                      </td>
                      <td className="py-3">{course.challengerCount}</td>
                      <td className="py-3">{course.completionCount}</td>
                      <td className="py-3">
                        {course.completionRate !== null
                          ? `${course.completionRate}%`
                          : "-"}
                      </td>
                      <td className="py-3">{course.totalChallengeCount}</td>
                      <td className="py-3">{course.averageScore ?? "-"}</td>
                      <td className="py-3">{course.maxScore ?? "-"}</td>
                      <td className="py-3">{course.courseOutCount}</td>
                      <td className="py-3">{course.retryCount}</td>
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
    </div>
  )
}
