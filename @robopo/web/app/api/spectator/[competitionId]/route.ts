import { maxCoursePoint } from "@/lib/summary/calculations"
import { getCompetitionCourseList, getCompetitionPlayerList } from "@/server/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId: rawId } = await params
  const competitionId = Number(rawId)

  const [{ competitionCourses }, { players }] = await Promise.all([
    getCompetitionCourseList(competitionId),
    getCompetitionPlayerList(competitionId),
  ])

  // Calculate total points for each player across all courses
  const playerScores = await Promise.all(
    players.map(async (player) => {
      let totalPoint = 0
      for (const course of competitionCourses) {
        totalPoint += await maxCoursePoint(competitionId, player.id, course.id)
      }
      return {
        playerId: player.id,
        playerName: player.name,
        bibNumber: player.bibNumber,
        totalPoint,
      }
    }),
  )

  // Filter out 0-point players and sort by score descending
  const ranked = playerScores
    .filter((p) => p.totalPoint > 0)
    .sort((a, b) => b.totalPoint - a.totalPoint)

  // Assign ranks (handle ties)
  let currentRank = 1
  const result = ranked.map((player, i) => {
    if (i > 0 && player.totalPoint < ranked[i - 1].totalPoint) {
      currentRank = i + 1
    }
    return { ...player, rank: currentRank }
  })

  return Response.json(result)
}
