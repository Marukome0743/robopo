import bcrypt from "bcryptjs"
import type { User } from "next-auth"
import { z } from "zod"
import { BASE_URL } from "@/app/lib/const"
import { getUserByName } from "@/app/lib/db/queries/queries"

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
): Promise<User> {
  try {
    console.log("[fetchUser] Start", {
      username,
      password: password ? "••••" : password,
    })
    const result = await getUserByName(username)
    console.log("[fetchUser] DB result", result)
    const passwordMatch = await bcrypt.compare(password, result.password)
    console.log("[fetchUser] Password match result", passwordMatch)
    if (passwordMatch) {
      return {
        id: result.id.toString(),
        name: result.name,
        email: null,
        image: null,
      } as User
    }
  } catch (error) {
    console.error("[fetchUser] Error retrieving user", error)
  }
  return {
    id: "",
    name: "",
    email: null,
    image: null,
  } as User
}
