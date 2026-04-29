export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  Building2,
  MapPin,
  Hash,
  PhoneCall,
  QrCode,
  ChevronRight,
  Receipt,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { IconCard } from "@/components/ui-icon"
import { formatZAR } from "@/lib/pricing"

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== "admin" && role !== "super_admin") redirect("/")

  const { id } = await params

  const [restaurant, bookingAgg, recentBookings] = await Promise.all([
    db.restaurant.findUnique({
      where: { id },
      include: { _count: { select: { qrCodes: true, bookings: true } } },
    }),
    db.booking.aggregate({
      where: { restaurantId: id, paymentStatus: "paid" },
      _sum: { finalPrice: true },
    }),
    db.booking.findMany({
      where: { restaurantId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { customer: { select: { name: true } } },
    }),
  ])

  if (!restaurant) notFound()
  const revenue = bookingAgg._sum.finalPrice ?? 0

  return (
    <MobileShell>
      <AppTopBar title={restaurant.name} backHref="/admin/restaurants" />
      <main className="px-4 pb-6 pt-3">
        <section className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[18px] font-semibold tracking-tight">
                {restaurant.name}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span className="font-mono font-semibold text-foreground">
                  {restaurant.restaurantCode}
                </span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {restaurant.address}
              </p>
              {restaurant.contactPhone && (
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <PhoneCall className="h-3 w-3" /> {restaurant.contactPhone}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="QR codes" value={String(restaurant._count.qrCodes)} />
            <Stat label="Bookings" value={String(restaurant._count.bookings)} />
            <Stat label="Revenue" value={formatZAR(revenue)} />
          </div>
        </section>

        <h2 className="mb-2 mt-6 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Manage
        </h2>
        <div className="flex flex-col gap-2">
          <IconCard
            icon={QrCode}
            title="QR codes"
            description="Generate, download, deactivate"
            href={`/admin/restaurants/${restaurant.id}/qr-codes`}
            showChevron
            tone="primary"
          />
        </div>

        <h2 className="mb-2 mt-6 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Recent QR bookings
        </h2>
        {recentBookings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-[13px] text-muted-foreground">
            No bookings yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentBookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/trip/${b.id}`}
                  className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                      {b.reference} · {b.customer.name ?? "Anonymous"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {b.status} · {formatZAR(b.finalPrice ?? b.estimatedPrice)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary px-2 py-2">
      <p className="text-[15px] font-bold text-foreground">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
