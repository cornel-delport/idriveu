export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { MapPin, ArrowRight, Star, Heart, Car } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Trip history — IDriveU Driver",
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const weekday = d.toLocaleDateString("en-ZA", { weekday: "short" })
  const day = d.getDate()
  const month = d.toLocaleDateString("en-ZA", { month: "short" })
  const time = d.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  return `${weekday} ${day} ${month} · ${time}`
}

export default async function DriverHistoryPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as { role?: string }).role
  if (role !== "driver" && role !== "admin" && role !== "super_admin") redirect("/")

  const bookings = await db.booking.findMany({
    where: {
      driverId: session.user.id,
      status: "completed",
    },
    include: {
      customer: { select: { name: true } },
      review: { select: { rating: true, comment: true, feedbackTags: true } },
      tip: { select: { amountCents: true } },
      receipt: { select: { totalCents: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 50,
  })

  const totalEarnings = bookings.reduce((sum, b) => {
    return sum + (b.finalPrice ?? b.estimatedPrice)
  }, 0)

  const totalTips = bookings.reduce((sum, b) => {
    return sum + (b.tip?.amountCents ?? 0)
  }, 0)

  const avgRating =
    bookings.filter((b) => b.review).length > 0
      ? bookings.filter((b) => b.review).reduce((sum, b) => sum + (b.review?.rating ?? 0), 0) /
        bookings.filter((b) => b.review).length
      : null

  return (
    <MobileShell>
      <AppTopBar title="Trip history" backHref="/driver" />
      <main className="px-4 pt-2">
        {/* Header */}
        <section className="mb-5">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Your history
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {bookings.length} completed {bookings.length === 1 ? "trip" : "trips"}
          </p>
        </section>

        {/* Summary stats */}
        {bookings.length > 0 && (
          <section className="mb-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-border bg-card p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Trips
              </p>
              <p className="mt-1 text-[20px] font-bold text-foreground">{bookings.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Rating
              </p>
              <p className="mt-1 text-[20px] font-bold text-foreground">
                {avgRating != null ? avgRating.toFixed(1) : "—"}
                {avgRating != null && (
                  <span className="ml-0.5 text-[14px] text-amber-400">★</span>
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tips
              </p>
              <p className="mt-1 text-[20px] font-bold text-foreground">
                R{(totalTips / 100).toFixed(0)}
              </p>
            </div>
          </section>
        )}

        {bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {bookings.map((b) => (
              <li key={b.id}>
                <div className="rounded-2xl border border-border bg-card p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        {formatDate(b.dateTime)}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {b.customer.name ?? "Unknown customer"} · {b.reference}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-xl bg-secondary px-3 py-1 text-[13px] font-semibold text-foreground">
                      R{(b.finalPrice ?? b.estimatedPrice).toFixed(2)}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{b.pickupAddress}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{b.dropoffAddress}</span>
                  </div>

                  {/* Rating + tip badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {b.review && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        {b.review.rating}/5
                      </span>
                    )}
                    {b.tip && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-semibold text-primary">
                        <Heart className="h-3 w-3 fill-current" />
                        R{(b.tip.amountCents / 100).toFixed(2)} tip
                      </span>
                    )}
                    {b.review?.feedbackTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Comment */}
                  {b.review?.comment && (
                    <p className="mt-2 text-[12px] italic text-muted-foreground">
                      "{b.review.comment}"
                    </p>
                  )}

                  {/* Receipt link */}
                  <Link
                    href={`/trip/${b.id}/receipt`}
                    className="tap mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary text-[12px] font-medium text-foreground"
                  >
                    View receipt
                  </Link>
                </div>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <Car className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-[18px] font-semibold text-foreground">No trips yet</h2>
      <p className="max-w-[260px] text-[14px] text-muted-foreground">
        Completed trips will appear here with ratings and tips.
      </p>
      <Link
        href="/driver/available"
        className="tap mt-2 inline-flex h-12 items-center rounded-2xl bg-primary px-8 text-[14px] font-semibold text-primary-foreground"
      >
        Find available jobs
      </Link>
    </div>
  )
}
