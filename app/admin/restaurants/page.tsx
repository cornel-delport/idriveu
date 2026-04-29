export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { RestaurantsClient } from "./restaurants-client"

export const metadata = { title: "Restaurants — IDriveU Admin" }

export default async function AdminRestaurantsPage() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "admin" && role !== "super_admin") redirect("/")

  const restaurants = await db.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { qrCodes: true, bookings: true } },
    },
  })

  const rows = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    restaurantCode: r.restaurantCode,
    status: r.status,
    lat: r.lat,
    lng: r.lng,
    contactName: r.contactName,
    contactPhone: r.contactPhone,
    waiveCallOutFee: r.waiveCallOutFee,
    qrCodeCount: r._count.qrCodes,
    bookingCount: r._count.bookings,
  }))

  return (
    <MobileShell>
      <AppTopBar title="Restaurants" backHref="/admin" />
      <main className="px-4 pb-6 pt-3">
        <RestaurantsClient restaurants={rows} />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
