import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "John Khumalo Private Driver Services — Plettenberg Bay",
  description:
    "Your car. Your plans. John gets you home safely. Trusted private driver, wine farm, airport transfer, and family pickup service in Plettenberg Bay.",
  generator: "v0.app",
  keywords: [
    "Plettenberg Bay driver",
    "private driver",
    "drive me home",
    "wine farm driver",
    "airport transfer Plett",
    "George airport transfer",
    "chauffeur South Africa",
  ],
  openGraph: {
    title: "John Khumalo Private Driver Services",
    description:
      "Your car. Your plans. John gets you home safely. Private driver, wine farm, airport transfer and family pickup in Plettenberg Bay.",
    type: "website",
    locale: "en_ZA",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1b22" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
