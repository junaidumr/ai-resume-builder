import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "AI Resume Builder | Career Operating System",
  description:
    "AI-powered resume builder, ATS intelligence, job tracker, recruiter portal, and career coach.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
