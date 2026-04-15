import { PrintScoreSheet } from "@/components/summary/printScoreSheet"
import { deserializeMission, missionStatePair } from "@/lib/course/mission"
import { deserializePoint } from "@/lib/course/point"
import {
  getChallengeCount,
  getCompetitionById,
  getCourseById,
  getCourseSummaryByPlayerId,
  getFirstCount,
  getMaxResult,
  getPlayerById,
} from "@/lib/db/queries/queries"
import { maxCoursePoint } from "@/lib/summary/calculations"
import { getCompetitionCourseList } from "@/server/db"

export default async function PrintSummaryPlayer({
  params,
}: {
  params: Promise<{ ids: number[] }>
}) {
  const { ids } = await params
  const competitionId = ids[0]
  const playerId = ids[2]

  const [player, competitionData] = await Promise.all([
    getPlayerById(playerId),
    getCompetitionById(competitionId),
  ])
  if (!player) {
    return <div className="p-8 text-center">選手が見つかりません</div>
  }
  const competitionName = competitionData?.name ?? ""

  const { competitionCourses } = await getCompetitionCourseList(competitionId)

  const courses = await Promise.all(
    competitionCourses.map(async (c) => {
      const course = await getCourseById(c.id)
      const missionPair = missionStatePair(
        deserializeMission(course?.mission || ""),
      )
      const pointState = deserializePoint(course?.point || "")
      const resultArray = await getCourseSummaryByPlayerId(
        competitionId,
        c.id,
        playerId,
      )
      const firstCountResult = await getFirstCount(
        competitionId,
        c.id,
        playerId,
      )
      const maxResultData = await getMaxResult(competitionId, c.id, playerId)
      const maxPt = await maxCoursePoint(competitionId, playerId, c.id)
      const challengeCountResult = await getChallengeCount(
        competitionId,
        c.id,
        playerId,
      )

      return {
        id: c.id,
        name: c.name,
        missionPair,
        point: pointState,
        resultArray,
        firstCount:
          firstCountResult.length > 0 ? firstCountResult[0].firstCount : null,
        maxResult: maxResultData.length > 0 ? maxResultData[0].maxResult : null,
        maxPt,
        challengeCount: Number(challengeCountResult[0]?.challengeCount ?? 0),
      }
    }),
  )

  const totalPoint = courses.reduce((sum, c) => sum + c.maxPt, 0)
  const totalChallengeCount = courses.reduce(
    (sum, c) => sum + c.challengeCount,
    0,
  )

  return (
    <PrintScoreSheet
      player={{
        name: player.name,
        furigana: player.furigana,
        bibNumber: player.bibNumber,
      }}
      competitionName={competitionName}
      courses={courses}
      totalPoint={totalPoint}
      totalChallengeCount={totalChallengeCount}
    />
  )
}
