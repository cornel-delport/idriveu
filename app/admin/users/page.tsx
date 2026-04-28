export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { SignedInAs } from "@/components/role-banner"
import { UsersClient, type UserRow } from "./users-client"

export const metadata = {
  title: "Manage users — IDriveU Admin",
}

export default async function AdminUsersPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user) redirect("/login")
  if (role !== "admin" && role !== "super_admin") redirect("/")

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      driverProfile: {
        select: { driverStatus: true, rating: true, totalTrips: true },
      },
    },
  })

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    driverProfile: u.driverProfile
      ? {
          driverStatus: u.driverProfile.driverStatus,
          rating: u.driverProfile.rating,
          totalTrips: u.driverProfile.totalTrips,
        }
      : null,
  }))

  return (
    <MobileShell>
      <AppTopBar title="Manage users" backHref="/admin" />
      <main className="px-4 pb-6 pt-3">
        <SignedInAs
          role={role as "admin" | "super_admin"}
          name={session.user.name}
          className="mb-4"
        />

        <header className="mb-4">
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight">
            Users
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {users.length} total · search, filter, change roles, suspend
          </p>
        </header>

        <UsersClient
          users={rows}
          isSuperAdmin={role === "super_admin"}
          currentUserId={session.user.id as string}
        />

        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
