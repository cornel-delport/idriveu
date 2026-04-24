import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowUpRight, Filter, Search, UserCog } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { MobileShell } from '@/components/mobile-shell'
import { AppTopBar } from '@/components/app-top-bar'
import { BottomNav, BottomNavSpacer } from '@/components/bottom-nav'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import { getService } from '@/lib/services'
import { formatZAR } from '@/lib/pricing'
import { AdminActions } from './admin-actions'
import type { BookingStatus, PaymentStatus } from '@/lib/types'

export default async function AdminDashboard() {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/')

  const [bookings, drivers, revenueAgg] = await Promise.all([
    db.booking.findMany({
      include: {
        customer: { select: { name: true, phone: true } },
        driver: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.user.findMany({
      where: { role: 'driver' },
      include: { driverProfile: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.booking.aggregate({
      where: { paymentStatus: 'admin_confirmed' },
      _sum: { finalPrice: true },
    }),
  ])

  const revenue = revenueAgg._sum.finalPrice ?? 0
  const pendingPayments = bookings.filter((b) => b.paymentStatus === 'pending').length
  const upcomingCount = bookings.filter((b) => new Date(b.dateTime) > new Date()).length

  // Serialize for safe client consumption
  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    reference: b.reference,
    serviceId: b.serviceId,
    status: b.status as string,
    paymentStatus: b.paymentStatus as string,
    dateTime: b.dateTime.toISOString(),
    estimatedPrice: b.estimatedPrice,
    finalPrice: b.finalPrice,
    driverId: b.driverId,
    customerName: b.customer.name,
    driverName: b.driver?.name ?? null,
  }))

  const driverOptions = drivers.map((d) => ({ id: d.id, name: d.name }))

  return (
    <MobileShell>
      <AppTopBar title="Admin" />
      <main className="px-4 pt-2">
        <section>
          <p className="text-[12px] font-medium text-muted-foreground">Overview</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Business at a glance
          </h1>
        </section>

        {/* Stats */}
        <section className="mt-4 grid grid-cols-2 gap-2">
          <StatCard label="Revenue (confirmed)" value={formatZAR(revenue)} />
          <StatCard label="Bookings" value={String(bookings.length)} />
          <StatCard label="Upcoming" value={String(upcomingCount)} />
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
            <h2 className="text-[17px] font-semibold tracking-tight">Bookings</h2>
            <Link href="#" className="text-[12px] font-medium text-primary">
              Export CSV
            </Link>
          </div>
          <ul className="mt-3 flex flex-col gap-3">
            {serializedBookings.map((b) => {
              const s = getService(b.serviceId)
              const Icon = s?.icon
              return (
                <li key={b.id}>
                  <div className="rounded-3xl border border-border bg-card p-4">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="flex items-start gap-3 active:bg-secondary/60"
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
                              {b.customerName} ·{' '}
                              {new Date(b.dateTime).toLocaleString('en-ZA', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[14px] font-semibold">
                              {formatZAR(b.finalPrice ?? b.estimatedPrice)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {b.driverName ?? 'Unassigned'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <BookingStatusBadge status={b.status as BookingStatus} />
                          <PaymentStatusBadge status={b.paymentStatus as PaymentStatus} />
                        </div>
                      </div>
                    </Link>

                    {/* Admin action buttons */}
                    <AdminActions
                      bookingId={b.id}
                      status={b.status}
                      paymentStatus={b.paymentStatus}
                      driverId={b.driverId}
                      drivers={driverOptions}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Revenue by service */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold tracking-tight">Revenue by service</h3>
            <span className="text-[11px] text-muted-foreground">confirmed payments</span>
          </div>
          <ul className="mt-3 flex flex-col gap-3">
            {serviceRevenue(bookings).map((row) => (
              <li key={row.id}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium">{row.name}</span>
                  <span className="text-muted-foreground">{formatZAR(row.amount)}</span>
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
            {drivers.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-2xl bg-secondary p-3"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
                  {(d.name ?? '?')
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{d.name ?? 'Unknown'}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {d.driverProfile?.totalTrips ?? 0} trips ·{' '}
                    {d.driverProfile?.rating?.toFixed(1) ?? '5.0'}★ ·{' '}
                    {d.driverProfile?.verified ? 'Verified' : 'Pending'}
                  </p>
                </div>
                {d.driverProfile?.female && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                    Lady driver
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
            {drivers.length === 0 && (
              <li className="py-4 text-center text-[12px] text-muted-foreground">
                No drivers registered yet.
              </li>
            )}
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
  tone?: 'accent'
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-[20px] font-semibold tracking-tight ${
          tone === 'accent' ? 'text-accent-foreground' : 'text-foreground'
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

type BookingRow = {
  serviceId: string
  paymentStatus: string
  finalPrice: number | null
  estimatedPrice: number
}

function serviceRevenue(
  bookings: BookingRow[],
): Array<{ id: string; name: string; amount: number; pct: number }> {
  const totals = new Map<string, number>()
  for (const b of bookings) {
    if (b.paymentStatus !== 'admin_confirmed') continue
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
