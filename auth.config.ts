import bcrypt from "bcrypt"
import type { NextAuthConfig, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { getUserByName } from "@/app/lib/db/queries/queries"

export default {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text", placeholder: "name" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "*********",
        },
      },
      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({
              username: z.string().nonempty(),
              password: z.string().nonempty(),
            })
            .safeParse(credentials)

          if (parsedCredentials.success) {
            const { username, password } = parsedCredentials.data
            const user = await getUserByName(username)
            const passwordMatch = await bcrypt.compare(password, user.password)
            if (passwordMatch) {
              return {
                id: user.id.toString(),
                name: user.name,
                email: null,
                image: null,
              } as User
            }
          }
          return null
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
    authorized({ auth }) {
      return !!auth?.user
    },
  },
} satisfies NextAuthConfig
