import type { User } from "next-auth"
import { z } from "zod"
import { passwordMatch } from "@/app/lib/auth/passwordMatch"

const credentialsSchema: z.ZodSchema<{ username: string; password: string }> =
  z.object({
    username: z.string().nonempty(),
    password: z.string().nonempty(),
  })

export function parsedCredentials(input: unknown): {
  username: string
  password: string
} {
  const result = credentialsSchema.safeParse(input)
  if (!result.success) {
    throw new Error("Invalid credentials")
  }
  return result.data
}

export async function fetchUser(
  username: string,
  password: string,
): Promise<User | null> {
  try {
    const user = await passwordMatch(username, password)
    if (user) {
      return user
    }
  } catch (error) {
    console.error("[fetchUser] ", error)
  }
  return null
}
