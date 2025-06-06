import type { Metadata } from "next"
import { Suspense } from "react"
import "@/app/globals.css"
import { PageLoading } from "@/app/components/parts/pageLoading"
import type React from "react"

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense> // modal
}
