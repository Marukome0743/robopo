import { SaveModal } from "@/app/components/course/modals"

export default async function SavePage({
  params,
}: {
  params: Promise<{ courseId: number }>
}) {
  const courseId = (await params).courseId
  return <SaveModal courseId={courseId} />
}
