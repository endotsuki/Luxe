import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LuxeAccessories - Premium Watches, Jewelry & More",
  description:
    "Discover our curated collection of premium accessories including watches, jewelry, bags, and sunglasses. Shop the finest quality products with style.",
  generator: "v0.app",
  keywords: ["accessories", "watches", "jewelry", "bags", "sunglasses", "luxury", "fashion"],
  icons: {
    icon: [
      {
        url: "/icon-32x32.png",
        type: "image/png",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "LuxeAccessories - Premium Watches, Jewelry & More",
    description: "Discover our curated collection of premium accessories including watches, jewelry, bags, and sunglasses.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://luxe-roan-three.vercel.app",
    siteName: "LuxeAccessories",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 200,
        height: 200,
        alt: "LuxeAccessories Logo",
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
