export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Frown, MapPin } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNavSpacer } from "@/components/bottom-nav"
import { RestaurantPickupQuickBook } from "@/components/restaurant/restaurant-pickup-quick-book"

interface Props {
  params: Promise<{ code: string }>
  searchParams: Promise<{ t?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return {
    title: `Pickup at ${code.toUpperCase()} — IDriveU`,
    description: "Book a private driver to take you home in your own car.",
  }
}

/**
 * /qr/restaurant/[code]
 * The page a customer lands on the moment they scan the QR — pickup is
 * locked to the restaurant; they only choose dropoff + time + pay.
 */
export default async function QrRestaurantPage({ params, searchParams }: Props) {
  const { code } = await params
  const { t: tableNumber } = await searchParams
  const upper = code.toUpperCase().trim()

  const restaurant = await db.restaurant.findUnique({
    where: { restaurantCode: upper },
    select: {
      id: true,
      name: true,
      address: true,
      lat: true,
      lng: true,
      restaurantCode: true,
      status: true,
      waiveCallOutFee: true,
    },
  })

  if (!restaurant) notFound()

  if (restaurant.status !== "active") {
    return <InactiveRestaurant code={upper} />
  }

  // Resolve QR code id (best-effort) so admin gets per-table booking analytics
  let qrCodeId: string | null = null
  if (tableNumber) {
    const qr = await db.restaurantQrCode.findFirst({
      where: { restaurantId: restaurant.id, tableNumber, status: "active" },
      select: { id: true },
    })
    qrCodeId = qr?.id ?? null
    if (qr) {
      // Best-effort scan tracking
      void db.restaurantQrCode
        .update({
          where: { id: qr.id },
          data: { scanCount: { increment: 1 }, lastScannedAt: new Date() },
        })
        .catch(() => undefined)
    }
  }

  const session = await auth()
  const isAuthenticated = !!session?.user?.id

  // Touch headers() to opt into the dynamic rendering signal
  await headers()

  return (
    <MobileShell>
      <AppTopBar title="Restaurant pickup" backHref="/" />
      <main className="px-4 pb-10 pt-4">
        <RestaurantPickupQuickBook
          restaurant={{
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            lat: restaurant.lat,
            lng: restaurant.lng,
            restaurantCode: restaurant.restaurantCode,
            waiveCallOutFee: restaurant.waiveCallOutFee,
          }}
          qrCodeId={qrCodeId}
          isAuthenticated={isAuthenticated}
        />
        <BottomNavSpacer />
      </main>
    </MobileShell>
  )
}

function InactiveRestaurant({ code }: { code: string }) {
  return (
    <MobileShell>
      <AppTopBar title="Restaurant pickup" backHref="/" />
      <main className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Frown className="h-8 w-8" />
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight">
          This restaurant isn&apos;t taking bookings right now
        </h1>
        <p className="max-w-sm text-[14px] text-muted-foreground">
          Code <span className="font-semibold text-foreground">{code}</span> is
          paused. Try again later, or book a regular ride home.
        </p>
        <Link
          href="/book"
          className="tap mt-3 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[14px] font-semibold text-primary-foreground"
        >
          <MapPin className="h-4 w-4" /> Book a regular ride
        </Link>
      </main>
    </MobileShell>
  )
}
