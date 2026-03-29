import { describe, expect, mock, test } from "bun:test"

// Track which table each select().from() call targets
let lastFromTable: string | null = null
const tableNameSymbol = Symbol.for("drizzle:Name")

mock.module("@/app/lib/db/db", () => ({
  db: {
    select: () => ({
      from: (table: Record<symbol, string>) => {
        lastFromTable = table[tableNameSymbol] ?? null
        return Promise.resolve([])
      },
    }),
  },
}))

const courseRoute = await import("@/app/api/assign/course/route")
const playerRoute = await import("@/app/api/assign/player/route")
const umpireRoute = await import("@/app/api/assign/umpire/route")

describe("assign route GET handlers", () => {
  test("assign/course GET queries competition_course table", async () => {
    lastFromTable = null
    const res = await courseRoute.GET()
    const body = await res.json()

    expect(lastFromTable).toBe("competition_course")
    expect(body).toHaveProperty("assigns")
  })

  test("assign/player GET queries competition_player table", async () => {
    lastFromTable = null
    const res = await playerRoute.GET()
    const body = await res.json()

    expect(lastFromTable).toBe("competition_player")
    expect(body).toHaveProperty("assigns")
  })

  test("assign/umpire GET queries competition_umpire table", async () => {
    lastFromTable = null
    const res = await umpireRoute.GET()
    const body = await res.json()

    expect(lastFromTable).toBe("competition_umpire")
    expect(body).toHaveProperty("assigns")
  })
})
