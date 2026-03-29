import { and, eq } from "drizzle-orm"
import { db } from "@/app/lib/db/db"
import {
  competitionCourse,
  competitionPlayer,
  competitionUmpire,
} from "@/app/lib/db/schema"

const tableMap = {
  player: {
    table: competitionPlayer,
    idCol: competitionPlayer.playerId,
    compCol: competitionPlayer.competitionId,
    idKey: "playerId" as const,
  },
  course: {
    table: competitionCourse,
    idCol: competitionCourse.courseId,
    compCol: competitionCourse.competitionId,
    idKey: "courseId" as const,
  },
  umpire: {
    table: competitionUmpire,
    idCol: competitionUmpire.umpireId,
    compCol: competitionUmpire.competitionId,
    idKey: "umpireId" as const,
  },
} as const

type AssignMode = keyof typeof tableMap

function getMapping(mode: string) {
  if (!(mode in tableMap)) {
    throw new Error(`Invalid mode: ${mode}`)
  }
  return tableMap[mode as AssignMode]
}

// Assign items to a competition by their IDs if not already assigned
export async function assignById(req: Request, mode: string) {
  try {
    const { ids, competitionId } = await req.json()
    if (!(competitionId && Array.isArray(ids))) {
      return Response.json({ error: "Invalid input" }, { status: 400 })
    }

    const { table, idCol, compCol, idKey } = getMapping(mode)

    for (const id of ids) {
      const existing = await db
        .select()
        .from(table)
        .where(and(eq(compCol, competitionId), eq(idCol, id)))

      if (existing.length === 0) {
        await db.insert(table).values({ competitionId, [idKey]: id })
      }
    }
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while assigning.",
        error,
      },
      { status: 500 },
    )
  }
}

// Unassign items from a competition by their IDs
export async function unassignById(req: Request, mode: string) {
  try {
    const { ids, competitionId } = await req.json()
    if (!(competitionId && Array.isArray(ids))) {
      return Response.json({ error: "Invalid input" }, { status: 400 })
    }

    const { table, idCol, compCol } = getMapping(mode)

    for (const id of ids) {
      const existing = await db
        .select()
        .from(table)
        .where(and(eq(compCol, competitionId), eq(idCol, id)))

      if (existing.length > 0) {
        await db
          .delete(table)
          .where(and(eq(compCol, competitionId), eq(idCol, id)))
      }
    }
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while unassigning.",
        error,
      },
      { status: 500 },
    )
  }
}
