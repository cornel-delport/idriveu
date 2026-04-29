export const dynamic = "force-dynamic"

import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { QrCodesClient } from "./qr-client"

export default async function QrCodesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "admin" && role !== "super_admin") redirect("/")

  const { id } = await params
  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: { qrCodes: { orderBy: { createdAt: "desc" } } },
  })
  if (!restaurant) notFound()

  return (
    <MobileShell>
      <AppTopBar title="QR codes" backHref={`/admin/restaurants/${id}`} />
      <main className="px-4 pb-6 pt-3">
        <QrCodesClient
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          restaurantCode={restaurant.restaurantCode}
          qrCodes={restaurant.qrCodes.map((q) => ({
            id: q.id,
            qrCodeUrl: q.qrCodeUrl,
            tableNumber: q.tableNumber,
            status: q.status,
            scanCount: q.scanCount,
            lastScannedAt: q.lastScannedAt,
            createdAt: q.createdAt,
          }))}
        />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
