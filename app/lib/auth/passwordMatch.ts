import bcrypt from "bcryptjs"
import type { User } from "next-auth"
import { getUserByName } from "@/app/lib/db/queries/queries"

export async function passwordMatch(
  name: string,
  password: string,
): Promise<User | null> {
  const result = await getUserByName(name)
  const passwordMatch = await bcrypt.compare(password, result.password)
  if (passwordMatch) {
    return {
      id: result.id.toString(),
      name: result.name,
      email: null,
      image: null,
    } as User
  }
  return null
}
