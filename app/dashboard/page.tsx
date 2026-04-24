import Link from "next/link"
import { ArrowRight, MapPin, Plus, Star } from "lucide-react"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { BookingItem } from "@/components/dashboard/booking-item"
import { mockBookings } from "@/lib/mock-data"
import { formatZAR } from "@/lib/pricing"

const user = { name: "Thandi Mokoena", email: "thandi@example.com" }

export default function CustomerDashboard() {
  const myBookings = mockBookings.filter((b) => b.customerId === "cust_01")
  const upcoming = myBookings.filter(
    (b) => new Date(b.dateTime) > new Date() && b.status !== "cancelled",
  )
  const past = myBookings.filter((b) => b.status === "completed")

  const totalSpent = myBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.finalPrice ?? b.estimatedPrice), 0)

  const firstName = user.name.split(" ")[0]

  return (
    <MobileShell>
      <AppTopBar />
      <main className="px-4 pt-2">
        {/* Greeting */}
        <section>
          <p className="text-[12px] font-medium text-muted-foreground">
            Kunjani,
          </p>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
            {firstName}.
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Here&apos;s a quick look at your trips.
          </p>
        </section>

        {/* Stats */}
        <section className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Upcoming" value={String(upcoming.length)} />
          <Stat label="All trips" value={String(myBookings.length)} />
          <Stat
            label="Your rating"
            value={
              <span className="flex items-center gap-1">
                4.9{" "}
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              </span>
            }
          />
        </section>

        {/* Quick booking CTA */}
        <Link
          href="/book"
          className="tap mt-4 flex items-center justify-between rounded-2xl bg-primary p-4 text-primary-foreground shadow-md"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              Quick action
            </p>
            <p className="mt-0.5 text-[15px] font-semibold">
              Book a driver now
            </p>
            <p className="mt-0.5 text-[12px] text-primary-foreground/80">
              Spent with IDriveU:{" "}
              <span className="font-semibold">{formatZAR(totalSpent)}</span>
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Plus className="h-5 w-5" />
          </span>
        </Link>

        {/* Upcoming */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">
              Upcoming trips
            </h2>
            <Link
              href="/bookings"
              className="text-[12px] font-medium text-primary"
            >
              See all
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <Empty
                title="No upcoming trips"
                body="Book a ride and it'll appear here."
              />
            ) : (
              upcoming.map((b) => (
                <BookingItem key={b.id} booking={b} href="/bookings" />
              ))
            )}
          </div>
        </section>

        {/* Saved locations */}
        <section className="mt-6">
          <h2 className="text-[17px] font-semibold tracking-tight">
            Saved places
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Quick taps for places you visit often.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {[
              { label: "Home", address: "14 Cormorant Drive, Plett" },
              { label: "Office", address: "Main Road, Plett" },
              { label: "Favourite restaurant", address: "The Lookout Deck" },
            ].map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-3 rounded-2xl bg-secondary p-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{p.label}</p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {p.address}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </section>

        {/* Past */}
        <section className="mt-6 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold tracking-tight">
              Recent trips
            </h2>
            <Link
              href="/bookings"
              className="text-[12px] font-medium text-primary"
            >
              History
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {past.length === 0 ? (
              <Empty
                title="No past trips yet"
                body="Finished rides appear here so you can repeat them in one tap."
              />
            ) : (
              past.map((b) => (
                <BookingItem
                  key={b.id}
                  booking={b}
                  cta="Repeat"
                  href={`/book?service=${b.serviceId}`}
                />
              ))
            )}
          </div>
        </section>
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[18px] font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  )
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 p-6 text-center">
      <p className="text-[14px] font-semibold">{title}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{body}</p>
      <Link
        href="/book"
        className="tap mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[12px] font-semibold text-primary-foreground"
      >
        Book a driver <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
