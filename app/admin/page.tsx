import Link from "next/link"
import { ArrowUpRight, Filter, Search, UserCog } from "lucide-react"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge"
import { mockBookings, mockDrivers } from "@/lib/mock-data"
import { getService } from "@/lib/services"
import { formatZAR } from "@/lib/pricing"

export default function AdminDashboard() {
  const revenue = mockBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((s, b) => s + (b.finalPrice ?? b.estimatedPrice), 0)
  const pendingPayments = mockBookings.filter(
    (b) => b.paymentStatus === "pending",
  ).length
  const upcoming = mockBookings.filter(
    (b) => new Date(b.dateTime) > new Date(),
  )

  return (
    <MobileShell>
      <AppTopBar title="Admin" />
      <main className="px-4 pt-2">
        <section>
          <p className="text-[12px] font-medium text-muted-foreground">
            Overview
          </p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Business at a glance
          </h1>
        </section>

        {/* Stats */}
        <section className="mt-4 grid grid-cols-2 gap-2">
          <StatCard label="Revenue (30d)" value={formatZAR(revenue)} trend="+12.4%" />
          <StatCard label="Bookings" value={String(mockBookings.length)} trend="+5" />
          <StatCard label="Upcoming" value={String(upcoming.length)} />
          <StatCard
            label="Awaiting payment"
            value={String(pendingPayments)}
            tone="accent"
          />
        </section>

        {/* Filter bar */}
        <section className="mt-5">
          <div className="flex items-center gap-2 rounded-2xl bg-secondary p-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card ring-1 ring-border">
              <Search className="h-4 w-4 text-muted-foreground" />
            </span>
            <input
              placeholder="Search reference, customer…"
              className="flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="button"
              className="tap inline-flex h-9 items-center gap-1 rounded-xl bg-card px-3 text-[12px] font-semibold ring-1 ring-border"
            >
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </section>

        {/* Bookings feed */}
        <section className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">
              Bookings
            </h2>
            <Link href="#" className="text-[12px] font-medium text-primary">
              Export CSV
            </Link>
          </div>
          <ul className="mt-3 flex flex-col gap-3">
            {mockBookings.map((b) => {
              const s = getService(b.serviceId)
              const Icon = s?.icon
              return (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-start gap-3 rounded-3xl border border-border bg-card p-4 active:bg-secondary/60"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {Icon && <Icon className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold">
                            {s?.shortName} · {b.reference}
                          </p>
                          <p className="truncate text-[12px] text-muted-foreground">
                            {b.customerName} ·{" "}
                            {new Date(b.dateTime).toLocaleString("en-ZA", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-semibold">
                            {formatZAR(b.finalPrice ?? b.estimatedPrice)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {b.driverName ?? "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <BookingStatusBadge status={b.status} />
                        <PaymentStatusBadge status={b.paymentStatus} />
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Revenue by service */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold tracking-tight">
              Revenue by service
            </h3>
            <span className="text-[11px] text-muted-foreground">last 30d</span>
          </div>
          <ul className="mt-3 flex flex-col gap-3">
            {serviceRevenue(mockBookings).map((row) => (
              <li key={row.id}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium">{row.name}</span>
                  <span className="text-muted-foreground">
                    {formatZAR(row.amount)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Drivers */}
        <section className="mt-4 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold tracking-tight">Drivers</h3>
            <Link
              href="#"
              className="tap inline-flex h-8 items-center gap-1 rounded-full bg-secondary px-3 text-[11px] font-semibold"
            >
              <UserCog className="h-3.5 w-3.5" /> Manage
            </Link>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {mockDrivers.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-2xl bg-secondary p-3"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
                  {d.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">
                    {d.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {d.trips} trips · {d.rating}★ ·{" "}
                    {d.verified ? "Verified" : "Pending"}
                  </p>
                </div>
                {d.female && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                    Lady driver
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </section>

        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function StatCard({
  label,
  value,
  trend,
  tone,
}: {
  label: string
  value: string
  trend?: string
  tone?: "accent"
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-[20px] font-semibold tracking-tight ${
          tone === "accent" ? "text-accent-foreground" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {trend && (
        <p className="mt-0.5 text-[11px] font-medium text-primary">{trend}</p>
      )}
    </div>
  )
}

function serviceRevenue(
  bookings: typeof mockBookings,
): Array<{ id: string; name: string; amount: number; pct: number }> {
  const totals = new Map<string, number>()
  for (const b of bookings) {
    if (b.paymentStatus !== "paid") continue
    totals.set(
      b.serviceId,
      (totals.get(b.serviceId) ?? 0) + (b.finalPrice ?? b.estimatedPrice),
    )
  }
  const rows = Array.from(totals.entries()).map(([id, amount]) => ({
    id,
    name: getService(id)?.name ?? id,
    amount,
    pct: 0,
  }))
  const max = Math.max(...rows.map((r) => r.amount), 1)
  return rows
    .map((r) => ({ ...r, pct: Math.round((r.amount / max) * 100) }))
    .sort((a, b) => b.amount - a.amount)
}
