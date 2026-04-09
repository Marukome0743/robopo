import { View } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/view"
import { getCourseById, getPlayerById } from "@/app/lib/db/queries/queries"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export default async function Challenge({
  params,
  searchParams,
}: {
  params: Promise<{ competitionId: number; courseId: number; playerId: number }>
  searchParams: Promise<{ umpireId?: string }>
}) {
  const { competitionId, courseId, playerId } = await params
  const { umpireId } = await searchParams

  // Get courseData from courseId
  const courseData: SelectCourse | null = await getCourseById(courseId)
  // Get playerData from playerId
  const playerData: SelectPlayer | null = await getPlayerById(playerId)

  return courseData && playerData ? (
    <View
      courseData={courseData}
      playerData={playerData}
      competitionId={competitionId}
      courseId={courseId}
      umpireId={umpireId ? Number(umpireId) : 1}
    />
  ) : (
    <div className="flex w-full flex-col items-center justify-center overflow-y-auto">
      <h2>コースを割り当てられていません。</h2>
    </div>
  )
}
