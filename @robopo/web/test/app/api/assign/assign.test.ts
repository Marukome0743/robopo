import { beforeEach, describe, expect, mock, test } from "bun:test"
import {
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
} from "@/app/lib/db/schema"

type Operation = {
  type: "select" | "insert" | "delete"
  table: unknown
  whereArgs?: unknown[]
  values?: Record<string, unknown>
}

let operations: Operation[] = []
let mockSelectResult: unknown[] = []

// Chainable mock builder for db operations
function createChain(op: Operation) {
  const chain: Record<string, unknown> = {
    from: (table: unknown) => {
      op.table = table
      return chain
    },
    where: (condition: unknown) => {
      op.whereArgs = [condition]
      operations.push(op)
      return Promise.resolve(mockSelectResult)
    },
    values: (vals: Record<string, unknown>) => {
      op.values = vals
      operations.push(op)
      return Promise.resolve()
    },
  }
  return chain
}

mock.module("@/app/lib/db/db", () => ({
  db: {
    select: () => createChain({ type: "select", table: null }),
    insert: (table: unknown) => createChain({ type: "insert", table }),
    delete: (table: unknown) => createChain({ type: "delete", table }),
  },
}))

const { assignById, unassignById } = await import("@/app/api/assign/assign")

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  operations = []
  mockSelectResult = []
})

describe("assignById", () => {
  test("returns 400 for invalid input", async () => {
    const res = await assignById(makeRequest({}), "player")
    expect(res.status).toBe(400)
  })

  test("inserts into competitionPlayer for mode=player", async () => {
    mockSelectResult = [] // No existing assignment
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await assignById(req, "player")
    expect(res.status).toBe(200)

    const selectOp = operations.find((o) => o.type === "select")
    expect(selectOp?.table).toBe(competitionPlayer)

    const insertOp = operations.find((o) => o.type === "insert")
    expect(insertOp?.table).toBe(competitionPlayer)
    expect(insertOp?.values).toEqual({ competitionId: 1, playerId: 10 })
  })

  test("inserts into competitionCourse for mode=course", async () => {
    mockSelectResult = []
    const req = makeRequest({ ids: [20], competitionId: 2 })
    const res = await assignById(req, "course")
    expect(res.status).toBe(200)

    const insertOp = operations.find((o) => o.type === "insert")
    expect(insertOp?.table).toBe(competitionCourse)
    expect(insertOp?.values).toEqual({ competitionId: 2, courseId: 20 })
  })

  test("inserts into competitionUmpire for mode=umpire", async () => {
    mockSelectResult = []
    const req = makeRequest({ ids: [30], competitionId: 3 })
    const res = await assignById(req, "umpire")
    expect(res.status).toBe(200)

    const insertOp = operations.find((o) => o.type === "insert")
    expect(insertOp?.table).toBe(competitionUmpire)
    expect(insertOp?.values).toEqual({ competitionId: 3, umpireId: 30 })
  })

  test("skips insert when assignment already exists", async () => {
    mockSelectResult = [{ id: 1 }] // Already assigned
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await assignById(req, "player")
    expect(res.status).toBe(200)

    const insertOps = operations.filter((o) => o.type === "insert")
    expect(insertOps).toHaveLength(0)
  })

  test("returns 500 for invalid mode", async () => {
    const req = makeRequest({ ids: [1], competitionId: 1 })
    const res = await assignById(req, "invalid")
    expect(res.status).toBe(500)
  })
})

describe("unassignById", () => {
  test("returns 400 for invalid input", async () => {
    const res = await unassignById(makeRequest({}), "player")
    expect(res.status).toBe(400)
  })

  test("deletes from competitionPlayer for mode=player", async () => {
    mockSelectResult = [{ id: 1 }] // Exists
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await unassignById(req, "player")
    expect(res.status).toBe(200)

    const deleteOp = operations.find((o) => o.type === "delete")
    expect(deleteOp?.table).toBe(competitionPlayer)
  })

  test("deletes from competitionCourse for mode=course", async () => {
    mockSelectResult = [{ id: 1 }]
    const req = makeRequest({ ids: [20], competitionId: 2 })
    const res = await unassignById(req, "course")
    expect(res.status).toBe(200)

    const deleteOp = operations.find((o) => o.type === "delete")
    expect(deleteOp?.table).toBe(competitionCourse)
  })

  test("deletes from competitionUmpire for mode=umpire", async () => {
    mockSelectResult = [{ id: 1 }]
    const req = makeRequest({ ids: [30], competitionId: 3 })
    const res = await unassignById(req, "umpire")
    expect(res.status).toBe(200)

    const deleteOp = operations.find((o) => o.type === "delete")
    expect(deleteOp?.table).toBe(competitionUmpire)
  })

  test("skips delete when assignment does not exist", async () => {
    mockSelectResult = [] // Not assigned
    const req = makeRequest({ ids: [10], competitionId: 1 })
    const res = await unassignById(req, "player")
    expect(res.status).toBe(200)

    const deleteOps = operations.filter((o) => o.type === "delete")
    expect(deleteOps).toHaveLength(0)
  })

  test("returns 500 for invalid mode", async () => {
    const req = makeRequest({ ids: [1], competitionId: 1 })
    const res = await unassignById(req, "invalid")
    expect(res.status).toBe(500)
  })
})
