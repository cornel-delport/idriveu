import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "IDriveU — Your car. Your plans. We get you home safely.",
  description:
    "Book a trusted private driver in Plettenberg Bay. IDriveU drives you home in your own car — airport transfers, wine farms, event pickups, and safe child transport.",
  generator: "v0.app",
  applicationName: "IDriveU",
  keywords: [
    "IDriveU",
    "Plettenberg Bay private driver",
    "drive me home",
    "wine farm driver",
    "airport transfer Plett",
    "George airport transfer",
    "private chauffeur Garden Route",
    "safe child pickup",
  ],
  openGraph: {
    title: "IDriveU — Private Driver App",
    description:
      "Your car. Your plans. IDriveU gets you home safely. Private driver, wine farm, airport transfer and family pickup in Plettenberg Bay.",
    type: "website",
    locale: "en_ZA",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1222" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased min-h-dvh">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
