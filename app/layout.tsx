import type React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ccdjewelry.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CCD Jewelry - Exquisite Jewelry for Every Occasion",
  description:
    "Discover exquisite jewelry pieces at CCD Jewelry. Shop our curated collection of rings, necklaces, bracelets, and earrings to find the perfect accessory for any occasion.",
  generator: "v0.app",
  keywords: [
    "accessories",
    "watches",
    "jewelry",
    "bags",
    "sunglasses",
    "luxury",
    "fashion",
  ],
  icons: {
    icon: [
      {
        url: "/icon-32x32.png",
        type: "image/png",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "CCD Jewelry - Exquisite Jewelry for Every Occasion",
    description:
      "Discover exquisite jewelry pieces at CCD Jewelry. Shop our curated collection of rings, necklaces, bracelets, and earrings to find the perfect accessory for any occasion.",
    url: siteUrl,
    siteName: "CCD Jewelry",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`, // Your new OG image
        width: 1200,
        height: 630,
        alt: "CCD Jewelry Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CCD Jewelry - Exquisite Jewelry for Every Occasion",
    description:
      "Discover exquisite jewelry pieces at CCD Jewelry. Shop our curated collection of rings, necklaces, bracelets, and earrings to find the perfect accessory for any occasion.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
