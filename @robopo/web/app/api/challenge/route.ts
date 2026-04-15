import { createChallenge } from "@/lib/db/queries/insert"
import { deleteChallengeById } from "@/lib/db/queries/queries"
import { updateChallenge } from "@/lib/db/queries/update"

export async function POST(req: Request) {
  const {
    firstResult,
    retryResult,
    competitionId,
    courseId,
    playerId,
    judgeId,
    detail,
  } = await req.json()
  const challengeData = {
    firstResult: firstResult,
    retryResult: retryResult,
    detail: detail ?? null,
    competitionId: competitionId,
    courseId: courseId,
    playerId: playerId,
    judgeId: judgeId,
  }
  try {
    const result = await createChallenge(challengeData)
    return Response.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while creating the challenge.",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(req: Request) {
  const { id, firstResult, retryResult, detail } = await req.json()
  if (!id) {
    return Response.json(
      { success: false, message: "Challenge ID is required." },
      { status: 400 },
    )
  }
  try {
    await updateChallenge(id, { firstResult, retryResult, detail })
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while updating the challenge.",
        error: error,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) {
    return Response.json(
      { success: false, message: "Challenge ID is required." },
      { status: 400 },
    )
  }
  try {
    await deleteChallengeById(id)
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while deleting the challenge.",
        error: error,
      },
      { status: 500 },
    )
  }
}
