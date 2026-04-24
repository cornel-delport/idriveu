import Link from "next/link"
import {
  BadgeDollarSign,
  BarChart3,
  CalendarRange,
  Car,
  Download,
  Filter,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockBookings, mockDrivers } from "@/lib/mock-data"
import { getService } from "@/lib/services"
import { formatZAR } from "@/lib/pricing"

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarRange },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/drivers", label: "Drivers", icon: Car },
  { href: "/admin/pricing", label: "Pricing", icon: BadgeDollarSign },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

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
    <DashboardShell
      role="admin"
      nav={nav}
      user={{ name: "John Khumalo", email: "admin@johnkhumalo.co.za" }}
      title="Business overview"
      description="Bookings, payments and drivers at a glance."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={formatZAR(revenue)}
          trend="+12.4%"
        />
        <StatCard
          label="Bookings"
          value={String(mockBookings.length)}
          trend="+5"
        />
        <StatCard
          label="Upcoming"
          value={String(upcoming.length)}
        />
        <StatCard
          label="Awaiting payment"
          value={String(pendingPayments)}
          tone="accent"
        />
      </div>

      <section className="mt-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">All bookings</h2>
            <p className="text-sm text-muted-foreground">
              Approve, assign drivers, and manage payments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search reference, customer..."
                className="h-9 w-56 rounded-full pl-3"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              <Filter className="size-4" /> Filters
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Driver</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="w-8 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockBookings.map((b) => {
                  const s = getService(b.serviceId)
                  return (
                    <tr key={b.id} className="hover:bg-secondary/30">
                      <td className="px-5 py-3 font-medium">{b.reference}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {s && (
                            <s.icon className="size-4 text-muted-foreground" />
                          )}
                          <span>{s?.shortName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">{b.customerName}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(b.dateTime).toLocaleString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {b.driverName ?? "—"}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatZAR(b.finalPrice ?? b.estimatedPrice)}
                      </td>
                      <td className="px-5 py-3">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-3">
                        <PaymentStatusBadge status={b.paymentStatus} />
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">
              Revenue by service
            </h3>
            <span className="text-xs text-muted-foreground">last 30 days</span>
          </div>
          <div className="mt-6 space-y-4">
            {serviceRevenue(mockBookings).map((row) => (
              <div key={row.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.name}</span>
                  <span className="text-muted-foreground">
                    {formatZAR(row.amount)}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold">Drivers</h3>
            <Button size="sm" variant="ghost" className="rounded-full">
              <UserCog className="size-4" /> Manage
            </Button>
          </div>
          <ul className="mt-4 space-y-3">
            {mockDrivers.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3"
              >
                <div className="flex size-10 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {d.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {d.trips} trips · {d.rating}★ ·{" "}
                    {d.verified ? "Verified" : "Pending"}
                  </p>
                </div>
                {d.female && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground ring-1 ring-accent/30">
                    Lady driver
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </DashboardShell>
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
  tone?: "primary" | "accent"
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 font-serif text-2xl font-semibold ${
          tone === "accent"
            ? "text-accent-foreground"
            : tone === "primary"
              ? "text-primary"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      {trend && (
        <p className="mt-1 text-xs font-medium text-primary">{trend}</p>
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
