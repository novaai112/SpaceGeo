import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-context"

export const metadata: Metadata = {
  title: "SpaceGeo AI — CAD Automation with AI",
  description:
    "Create SolidWorks, CATIA, Inventor, Fusion 360, NX, Creo, SpaceClaim, Onshape & Solid Edge 3D models instantly from text prompts or images. Powered by Gemini, GPT-4o, and Claude.",
  generator: "SpaceGeo.ai",
  keywords: ["CAD AI", "SolidWorks AI", "CAD automation", "3D modeling AI", "SpaceGeo"],
  icons: {
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
}

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
