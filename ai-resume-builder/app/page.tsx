import { LandingPage } from "@/components/marketing/landing-page"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const params = await searchParams
  const error = params.error ?? null
  // NextAuth mis-parses GET /api/auth/signin/google as error=google when pages.signIn is set.
  const authErrorCode =
    error === "google" ? null : error

  return <LandingPage authErrorCode={authErrorCode} />
}
