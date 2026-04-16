import { afterAll, describe, expect, mock, test } from "bun:test"

// Preserve original modules before mocking
const originalInsert = await import("@/lib/db/queries/insert")
const originalQueries = await import("@/lib/db/queries/queries")
const originalUpdate = await import("@/lib/db/queries/update")

const mockCreateChallenge = mock(() => Promise.resolve([{ id: 1 }]))
const mockUpdateChallenge = mock(() => Promise.resolve())
const mockDeleteChallenge = mock(() => Promise.resolve([{ deletedId: 1 }]))

mock.module("@/lib/db/queries/insert", () => ({
  ...originalInsert,
  createChallenge: mockCreateChallenge,
}))

mock.module("@/lib/db/queries/queries", () => ({
  ...originalQueries,
  deleteChallengeById: mockDeleteChallenge,
}))

mock.module("@/lib/db/queries/update", () => ({
  ...originalUpdate,
  updateChallenge: mockUpdateChallenge,
}))

const { POST, PATCH, DELETE } = await import("@/app/api/challenge/route")

function jsonRequest(method: string, body: unknown) {
  return new Request("http://localhost/api/challenge", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

afterAll(() => {
  mockCreateChallenge.mockRestore()
  mockUpdateChallenge.mockRestore()
  mockDeleteChallenge.mockRestore()
})

describe("POST /api/challenge", () => {
  test("creates a challenge successfully", async () => {
    const res = await POST(
      jsonRequest("POST", {
        firstResult: 2,
        retryResult: null,
        competitionId: 1,
        courseId: 1,
        playerId: 1,
        judgeId: 1,
      }),
    )
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})

describe("PATCH /api/challenge", () => {
  test("updates a challenge successfully", async () => {
    const res = await PATCH(jsonRequest("PATCH", { id: 1, firstResult: 3 }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  test("returns 400 when id is missing", async () => {
    const res = await PATCH(jsonRequest("PATCH", { firstResult: 3 }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  test("only includes present fields in update", async () => {
    mockUpdateChallenge.mockClear()
    await PATCH(jsonRequest("PATCH", { id: 5, firstResult: 10 }))
    expect(mockUpdateChallenge).toHaveBeenCalledWith(5, { firstResult: 10 })
  })
})

describe("DELETE /api/challenge", () => {
  test("deletes a challenge successfully", async () => {
    const res = await DELETE(jsonRequest("DELETE", { id: 1 }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  test("returns 400 when id is missing", async () => {
    const res = await DELETE(jsonRequest("DELETE", {}))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  test("returns 500 when delete throws", async () => {
    mockDeleteChallenge.mockImplementationOnce(() =>
      Promise.reject(new Error("DB error")),
    )
    const res = await DELETE(jsonRequest("DELETE", { id: 99 }))
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBeUndefined()
  })
})
