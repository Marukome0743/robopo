"use server"

import { auth } from "@/lib/auth"

// Form state for signIn
type FormState =
  | {
      message?: string
      success?: boolean
    }
  | undefined

// Server action for sign-in
export async function signInAction(_state: FormState, formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  try {
    await auth.api.signInUsername({
      body: { username, password },
    })
    return {
      success: true,
      message: "ログインに成功しました",
    }
  } catch (error) {
    console.error("signInAction error:", error)
    return {
      success: false,
      message: "ログインに失敗しました",
    }
  }
}
