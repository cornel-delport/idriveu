export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { SignedInAs } from "@/components/role-banner"
import { DriversClient, type DriverRow } from "./drivers-client"

export const metadata = {
  title: "Manage drivers — IDriveU Admin",
}

export default async function AdminDriversPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user) redirect("/login")
  if (role !== "admin" && role !== "super_admin") redirect("/")

  const drivers = await db.user.findMany({
    where: { role: "driver" },
    orderBy: { createdAt: "desc" },
    include: {
      driverProfile: {
        include: { availability: true },
      },
    },
  })

  // Filter out users who lost their driverProfile somehow
  const rows: DriverRow[] = drivers
    .filter((d) => d.driverProfile != null)
    .map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      status: d.status,
      driverProfile: {
        id: d.driverProfile!.id,
        driverStatus: d.driverProfile!.driverStatus,
        rating: d.driverProfile!.rating,
        totalTrips: d.driverProfile!.totalTrips,
        isOnline: d.driverProfile!.isOnline,
        displayName: d.driverProfile!.displayName,
      },
      availability: d.driverProfile!.availability
        ? {
            status: d.driverProfile!.availability.status,
            currentBookingId: d.driverProfile!.availability.currentBookingId,
          }
        : null,
    }))

  const pendingCount = rows.filter((r) => r.driverProfile.driverStatus === "pending")
    .length

  return (
    <MobileShell>
      <AppTopBar title="Manage drivers" backHref="/admin" />
      <main className="px-4 pb-6 pt-3">
        <SignedInAs
          role={role as "admin" | "super_admin"}
          name={session.user.name}
          className="mb-4"
        />

        <header className="mb-4">
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight">
            Drivers
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {rows.length} total
            {pendingCount > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {pendingCount} pending approval
                </span>
              </>
            )}
          </p>
        </header>

        <DriversClient drivers={rows} />

        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
