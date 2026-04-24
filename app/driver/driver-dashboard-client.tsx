'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { MobileShell } from '@/components/mobile-shell'
import { AppTopBar } from '@/components/app-top-bar'
import { BottomNav, BottomNavSpacer } from '@/components/bottom-nav'
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/status-badge'
import type { BookingStatus, PaymentStatus } from '@/lib/types'
import { updateBookingStatus } from '@/actions/bookings'
import { timeAgo, formatDateTime } from '@/lib/time'
import { getService } from '@/lib/services'
import { formatZAR } from '@/lib/pricing'

// Serialized booking type (Date fields as ISO strings)
interface SerializedBooking {
  id: string
  reference: string
  serviceId: string
  status: string
  paymentStatus: string
  paymentMethod: string
  pickupAddress: string
  pickupLat: number | null
  pickupLng: number | null
  dropoffAddress: string
  dropoffLat: number | null
  dropoffLng: number | null
  stops: unknown
  dateTime: string
  returnTrip: boolean
  returnDateTime: string | null
  passengerCount: number
  usesCustomerVehicle: boolean
  requiresFemaleDriver: boolean
  childPickup: boolean
  distanceKm: number
  durationMinutes: number
  estimatedPrice: number
  finalPrice: number | null
  notes: string | null
  statusUpdatedAt: string
  createdAt: string
  customer: { name: string | null; phone: string | null }
  childDetail: {
    childName: string
    school: string
    authorisedAdult: string
    emergencyContact: string
    instructions: string | null
  } | null
}

interface Props {
  bookings: SerializedBooking[]
  driverName: string
  driverRating: number
  driverTotalTrips: number
}

const TRIP_STEPS = [
  { status: 'driver_assigned', label: 'Booking accepted' },
  { status: 'driver_on_the_way', label: 'On the way to pickup' },
  { status: 'arrived', label: 'Arrived at pickup' },
  { status: 'in_progress', label: 'Passenger collected' },
  { status: 'completed', label: 'Trip completed' },
] as const

type ActiveStatus = 'driver_assigned' | 'driver_on_the_way' | 'arrived' | 'in_progress'

function getNextStatus(current: string): string | null {
  const map: Record<string, string> = {
    driver_assigned: 'driver_on_the_way',
    driver_on_the_way: 'arrived',
    arrived: 'in_progress',
    in_progress: 'completed',
  }
  return map[current] ?? null
}

function getActionLabel(status: string): string {
  const map: Record<string, string> = {
    driver_assigned: 'On the way',
    driver_on_the_way: 'Arrived',
    arrived: 'Start trip',
    in_progress: 'Complete trip',
  }
  return map[status] ?? ''
}

export function DriverDashboardClient({ bookings, driverName, driverRating, driverTotalTrips }: Props) {
  const now = new Date()

  const assignedBookings = bookings.filter(
    (b) => !['cancelled', 'refunded', 'refund_requested'].includes(b.status),
  )

  const nextTrip = assignedBookings.find(
    (b) => b.status !== 'completed' && new Date(b.dateTime) > now,
  ) ?? assignedBookings.find((b) => b.status === 'in_progress' || b.status === 'arrived' || b.status === 'driver_on_the_way')

  const upcoming = assignedBookings.filter(
    (b) => b.id !== nextTrip?.id && new Date(b.dateTime) > now && b.status !== 'completed',
  )

  // Today's bookings
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const todayBookings = assignedBookings.filter((b) => {
    const d = new Date(b.dateTime)
    return d >= today && d < tomorrow
  })
  const payToday = todayBookings.reduce((s, b) => s + (b.finalPrice ?? b.estimatedPrice), 0)

  return (
    <MobileShell>
      <AppTopBar title="Driver" />
      <main className="px-4 pt-2">
        <section>
          <p className="text-[12px] font-medium text-muted-foreground">Sawubona,</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            {driverName}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Here&apos;s what&apos;s next for you today.
          </p>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Today" value={String(todayBookings.length)} />
          <Stat
            label="Rating"
            value={
              <span className="flex items-center gap-1">
                {driverRating.toFixed(1)}
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              </span>
            }
          />
          <Stat label="Pay today" value={formatZAR(payToday)} />
        </section>

        {nextTrip && (
          <section className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              Next trip
            </p>

            <article className="mt-2 overflow-hidden rounded-3xl border border-border bg-card">
              <header className="flex items-start justify-between gap-3 p-4">
                <div>
                  <h2 className="text-[16px] font-semibold tracking-tight">
                    {getService(nextTrip.serviceId)?.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Ref {nextTrip.reference} · {formatDateTime(nextTrip.dateTime)}
                  </p>
                </div>
                <BookingStatusBadge status={nextTrip.status as BookingStatus} />
              </header>

              <div className="border-t border-border px-4 py-3">
                <Leg index="A" tone="primary" label="Pickup" value={nextTrip.pickupAddress} />
                <Leg index="B" tone="accent" label="Drop off" value={nextTrip.dropoffAddress} />
              </div>

              {nextTrip.notes && (
                <div className="mx-4 mb-3 rounded-2xl bg-secondary p-3 text-[12px]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer note
                  </p>
                  <p className="mt-0.5 text-foreground/90">{nextTrip.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="text-[13px]">
                  <span className="font-semibold">
                    {formatZAR(nextTrip.estimatedPrice)}
                  </span>
                  <span className="ml-2">
                    <PaymentStatusBadge status={nextTrip.paymentStatus as PaymentStatus} />
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {nextTrip.customer.name}
                </div>
              </div>
            </article>

            {/* Action buttons */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(nextTrip.pickupAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="tap flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary text-[12px] font-semibold text-primary-foreground"
              >
                <Navigation className="h-4 w-4" /> Navigate
              </a>
              <a
                href={`tel:${nextTrip.customer.phone ?? ''}`}
                className="tap flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-secondary text-[12px] font-semibold text-foreground"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={`https://wa.me/${(nextTrip.customer.phone ?? '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="tap flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-secondary text-[12px] font-semibold text-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </a>
            </div>

            {(['driver_assigned', 'driver_on_the_way', 'arrived', 'in_progress'] as ActiveStatus[]).includes(nextTrip.status as ActiveStatus) && (
              <Link
                href={`/driver/trip/${nextTrip.id}`}
                className="tap mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[13px] font-semibold text-accent-foreground"
              >
                <MapPin className="h-4 w-4" /> Open trip map
              </Link>
            )}

            {/* Trip progress */}
            <TripProgress booking={nextTrip} />
          </section>
        )}

        {/* Upcoming list */}
        <section className="mt-6 pb-6">
          <h2 className="text-[17px] font-semibold tracking-tight">Upcoming</h2>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {upcoming.length === 0 && (
              <li className="p-6 text-center text-[12px] text-muted-foreground">
                Nothing else scheduled.
              </li>
            )}
            {upcoming.map((b) => {
              const s = getService(b.serviceId)
              const Icon = s?.icon
              return (
                <li key={b.id}>
                  <Link
                    href={`/driver/trips/${b.id}`}
                    className="flex items-center justify-between gap-3 p-4 active:bg-secondary/60"
                  >
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">
                          {s?.name} · {b.reference}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {formatDateTime(b.dateTime)} · {b.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold">
                        {formatZAR(b.estimatedPrice)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function TripProgress({ booking }: { booking: SerializedBooking }) {
  const [, forceUpdate] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Tick every second so active step shows live counter
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const currentStepIndex = TRIP_STEPS.findIndex((s) => s.status === booking.status)
  const nextStatus = getNextStatus(booking.status)
  const actionLabel = getActionLabel(booking.status)

  async function handleAction() {
    if (!nextStatus) return
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, nextStatus as Parameters<typeof updateBookingStatus>[1])
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Status updated')
      }
    })
  }

  return (
    <div className="mt-3 rounded-3xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Trip progress
      </p>
      <ol className="mt-2 flex flex-col gap-2 text-[13px]">
        {TRIP_STEPS.map((step, i) => {
          const isDone = i < currentStepIndex || booking.status === 'completed'
          const isActive = step.status === booking.status && booking.status !== 'completed'

          return (
            <li key={step.status} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'bg-accent text-accent-foreground ring-2 ring-accent/40'
                      : 'bg-secondary text-muted-foreground ring-1 ring-border'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </span>
              <span
                className={
                  isDone
                    ? 'font-medium text-foreground'
                    : isActive
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                }
              >
                {step.label}
                {isDone && booking.statusUpdatedAt && i === currentStepIndex - 1 && (
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    {timeAgo(booking.statusUpdatedAt)}
                  </span>
                )}
                {isActive && booking.statusUpdatedAt && (
                  <span className="ml-2 text-[11px] text-accent">
                    {timeAgo(booking.statusUpdatedAt)}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>

      {nextStatus && actionLabel && (
        <button
          onClick={handleAction}
          disabled={isPending}
          className="tap mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[14px] font-semibold text-accent-foreground disabled:opacity-60"
        >
          {isPending ? 'Updating…' : actionLabel}
        </button>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[16px] font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function Leg({
  index,
  tone,
  label,
  value,
}: {
  index: string
  tone: 'primary' | 'accent' | 'muted'
  label: string
  value: string
}) {
  const toneClasses =
    tone === 'primary'
      ? 'bg-primary text-primary-foreground'
      : tone === 'accent'
        ? 'bg-accent text-accent-foreground'
        : 'bg-secondary text-muted-foreground ring-1 ring-border'
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span
        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold ${toneClasses}`}
      >
        {index}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-[13px] font-medium text-foreground">
          <MapPin className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
          {value}
        </p>
      </div>
    </div>
  )
}
