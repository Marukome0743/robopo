import type { PointState } from "@/app/lib/course/types"
import { calcPoint } from "@/app/lib/scoring/scoring"

// Format ISO timestamp for display
export function formatTimestamp(iso: string | null): string {
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

// Course completion check function
export function isCompletedCourse(
  pointData: PointState,
  result: number | null,
): boolean {
  const resultPoint = calcPoint(pointData, result)
  let totalPoint = 0
  for (let i = 0; i < pointData.length; i++) {
    const entry = pointData[i]
    if (Array.isArray(entry)) {
      totalPoint += entry[0] ?? 0
    } else {
      totalPoint += Number(entry)
    }
  }
  if (totalPoint === resultPoint) {
    return true
  }
  return false
}
