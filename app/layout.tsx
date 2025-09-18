import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ijtema Management System - Majlis Ansarullah Kenya",
  description: "Comprehensive management system for Ijtema events, participants, academics, and contributions",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/ansar-logo.jpeg",
    shortcut: "/ansar-logo.jpeg",
    apple: "/ansar-logo.jpeg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
