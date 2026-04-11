import { getCompetitionList } from "@/app/components/server/db"
import { updateCompetition } from "@/app/lib/db/queries/update"

export const revalidate = 0

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) {
    updateData.name = body.name
  }
  if (body.description !== undefined) {
    updateData.description = body.description || null
  }
  if (body.startDate !== undefined) {
    updateData.startDate = body.startDate ? new Date(body.startDate) : null
  }
  if (body.endDate !== undefined) {
    updateData.endDate = body.endDate ? new Date(body.endDate) : null
  }

  const start =
    updateData.startDate ?? (body.startDate === undefined ? null : undefined)
  const end =
    updateData.endDate ?? (body.endDate === undefined ? null : undefined)

  if (start && end && new Date(start as string) > new Date(end as string)) {
    return Response.json(
      { success: false, message: "開催日は終了日より前でなければなりません。" },
      { status: 400 },
    )
  }

  try {
    await updateCompetition(Number(id), updateData)
    const newList = await getCompetitionList()
    return Response.json({ success: true, newList }, { status: 200 })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred while updating the competition.",
        error: error,
      },
      { status: 500 },
    )
  }
}
