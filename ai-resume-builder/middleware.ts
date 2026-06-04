import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const signInUrl = new URL("/", request.url)
  signInUrl.searchParams.set("callbackUrl", request.url)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/resumes",
    "/api/resumes/:path*",
    "/api/applications",
    "/api/applications/:path*",
    "/api/coach/:path*",
    "/api/dashboard/:path*",
    "/api/ai/:path*",
    "/api/jobs/:path*",
    "/api/cover-letter",
  ],
}
