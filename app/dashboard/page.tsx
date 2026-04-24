import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Heart,
  History,
  LayoutDashboard,
  MapPin,
  Plus,
  Settings,
  Star,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BookingCard } from "@/components/dashboard/booking-card"
import { Button } from "@/components/ui/button"
import { mockBookings } from "@/lib/mock-data"
import { formatZAR } from "@/lib/pricing"

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/trips", label: "My Trips", icon: CalendarDays },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/favourites", label: "Favourite Spots", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

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

  return (
    <DashboardShell
      role="customer"
      nav={nav}
      user={user}
      title={`Kunjani, ${user.name.split(" ")[0]}`}
      description="Here's a quick look at your upcoming trips and recent rides."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Upcoming trips"
          value={String(upcoming.length)}
          accent="primary"
        />
        <StatCard
          label="Total trips"
          value={String(myBookings.length)}
          accent="accent"
        />
        <StatCard label="Spent with us" value={formatZAR(totalSpent)} />
        <StatCard label="Average rating given" value="4.9" icon={<Star className="size-4 fill-accent text-accent" />} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">
              Upcoming trips
            </h2>
            <p className="text-sm text-muted-foreground">
              Your next ride{upcoming.length === 1 ? "" : "s"} with John &amp; the team.
            </p>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/book">
              <Plus className="size-4" /> New booking
            </Link>
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming trips"
            description="Book a drive home, wine farm day or airport transfer and it'll show up here."
            cta={
              <Button asChild className="rounded-full">
                <Link href="/book">Book a driver</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-xl font-semibold">Recent trips</h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full"
          >
            <Link href="/dashboard/history">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        {past.length === 0 ? (
          <EmptyState
            title="No past trips yet"
            description="Completed rides will appear here so you can repeat them in one tap."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} action="repeat" />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-semibold">Saved locations</h2>
        <p className="text-sm text-muted-foreground">
          Quick places we&apos;ll remember for next time.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Home", "Office", "Favourite restaurant"].map((label, i) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                <MapPin className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {
                    [
                      "14 Cormorant Drive, Plett",
                      "Main Road, Plett",
                      "The Lookout Deck",
                    ][i]
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  )
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent?: "primary" | "accent"
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 flex items-center gap-2 font-serif text-2xl font-semibold ${
          accent === "primary"
            ? "text-primary"
            : accent === "accent"
              ? "text-accent-foreground"
              : "text-foreground"
        }`}
      >
        {value}
        {icon}
      </p>
    </div>
  )
}

function EmptyState({
  title,
  description,
  cta,
}: {
  title: string
  description: string
  cta?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
      <p className="font-serif text-lg font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  )
}
