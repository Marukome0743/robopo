import { sql } from "drizzle-orm"
import { calcPoint } from "@/app/components/challenge/utils"
import { deserializePoint } from "@/app/components/course/utils"
import type { CourseCompetitionSummary } from "@/app/components/summary/utils"
import { isCompletedCourse } from "@/app/components/summary/utils"
import { db } from "@/app/lib/db/db"
import {
  getCourseById,
  getCourseSummaryByCompetition,
} from "@/app/lib/db/queries/queries"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await params
  const competitionIdNum = Number(competitionId)

  const courseSummaryRaw = await getCourseSummaryByCompetition(competitionIdNum)

  const result: CourseCompetitionSummary[] = await Promise.all(
    courseSummaryRaw.map(async (row) => {
      const courseData = await getCourseById(row.courseId)
      const pointState = await deserializePoint(courseData?.point || "")

      // Calculate completion-related fields
      // Get per-player max results to check completion
      const playerMaxResults = await db.execute(sql`
        SELECT
          c.player_id AS "playerId",
          MAX(GREATEST(c.first_result, COALESCE(c.retry_result, 0)))::int AS "maxResult",
          TO_CHAR(
            MIN(
              CASE WHEN GREATEST(c.first_result, COALESCE(c.retry_result, 0)) = (
                SELECT MAX(GREATEST(c2.first_result, COALESCE(c2.retry_result, 0)))
                FROM challenge c2
                WHERE c2.player_id = c.player_id
                  AND c2.course_id = ${row.courseId}
                  AND c2.competition_id = ${competitionIdNum}
              ) THEN c.created_at ELSE NULL END
            ) AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo',
            'YYYY-MM-DD"T"HH24:MI:SS"+09:00"'
          ) AS "firstMaxTime"
        FROM challenge c
        WHERE c.course_id = ${row.courseId}
          AND c.competition_id = ${competitionIdNum}
        GROUP BY c.player_id
      `)

      let completionCount = 0
      let firstCompletionTime: string | null = null

      for (const pr of playerMaxResults.rows as {
        playerId: number
        maxResult: number
        firstMaxTime: string | null
      }[]) {
        if (isCompletedCourse(pointState, pr.maxResult)) {
          completionCount++
          if (
            pr.firstMaxTime &&
            (!firstCompletionTime || pr.firstMaxTime < firstCompletionTime)
          ) {
            firstCompletionTime = pr.firstMaxTime
          }
        }
      }

      const completionRate =
        row.challengerCount > 0
          ? Math.round((completionCount / row.challengerCount) * 1000) / 10
          : null

      const averageScore =
        row.averageRawScore !== null
          ? Math.round(
              calcPoint(pointState, Math.round(row.averageRawScore)) * 10,
            ) / 10
          : null

      const maxScore =
        row.maxRawScore !== null ? calcPoint(pointState, row.maxRawScore) : null

      return {
        courseId: row.courseId,
        courseName: row.courseName,
        firstChallengeTime: row.firstChallengeTime,
        firstCompletionTime,
        lastChallengeTime: row.lastChallengeTime,
        challengerCount: row.challengerCount,
        completionCount,
        completionRate,
        totalChallengeCount: row.totalChallengeCount,
        averageScore,
        maxScore,
        courseOutCount: row.courseOutCount,
        retryCount: row.retryCount,
      }
    }),
  )

  return Response.json(result)
}
