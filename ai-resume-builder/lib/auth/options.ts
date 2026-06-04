import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import type { Provider } from "next-auth/providers"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"

import { prisma } from "@/lib/db/prisma"

const useSecureCookies =
  process.env.NEXTAUTH_URL?.startsWith("https://") ?? false

const providers: Provider[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  }),
]

if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  providers.push(
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  useSecureCookies,
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          })
          token.role = dbUser?.role ?? "JOB_SEEKER"
        } catch {
          token.role = "JOB_SEEKER"
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }

      return session
    },
  },
  pages: {
    signIn: "/",
  },
}
