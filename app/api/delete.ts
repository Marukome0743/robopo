import {
  deleteCourseById,
  deletePlayerById,
  deleteUmpireById,
} from "@/app/lib/db/queries/queries"

export async function deleteById(req: Request, mode: string) {
  // modeは"player"か"umpire"か"course"のいずれか
  const reqbody = await req.json()
  const { id } = reqbody
  try {
    if (Array.isArray(id)) {
      // idが配列の場合、全てのidを削除
      await Promise.all(
        id.map(async (cid) => {
          if (mode === "player") {
            const result = await deletePlayerById(cid)
            return result
          }
          if (mode === "umpire") {
            const result = await deleteUmpireById(cid)
            return result
          }
          if (mode === "course") {
            const result = await deleteCourseById(cid)
            return result
          }
        }),
      )
      return Response.json(
        { success: true, message: `${mode} deleted successfully.` },
        { status: 200 },
      )
    }
    if (mode === "player") {
      const result = await deletePlayerById(id)
      return Response.json({ success: true, data: result }, { status: 200 })
    }
    if (mode === "umpire") {
      const result = await deleteUmpireById(id)
      return Response.json({ success: true, data: result }, { status: 200 })
    }
    if (mode === "course") {
      const result = await deleteCourseById(id)
      return Response.json({ success: true, data: result }, { status: 200 })
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the player.",
        error: error,
      },
      { status: 500 },
    )
  }
}
