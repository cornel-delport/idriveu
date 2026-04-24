import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  Car,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { formatZAR } from "@/lib/pricing"

export const metadata = {
  title: "Booking confirmed — John Khumalo Private Driver",
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const ref = params.ref ?? "JK-0000"
  const service = params.service ?? "Private driver"
  const date = params.date ?? ""
  const time = params.time ?? ""
  const pickup = params.pickup ?? ""
  const dropoff = params.dropoff ?? ""
  const price = Number(params.price ?? "0")

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 md:px-6 md:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <CheckCircle2 className="size-8" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Booking received
          </p>
          <h1 className="mt-2 text-balance font-serif text-3xl font-semibold md:text-4xl">
            Thanks — we&apos;ll see you soon.
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
            John has received your request and will confirm shortly via
            WhatsApp. Your reference is{" "}
            <span className="font-semibold text-foreground">{ref}</span>.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {service}
              </p>
              <p className="mt-1 font-serif text-lg font-semibold">
                {formatDate(date)} · {time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="font-serif text-2xl font-semibold text-primary">
                {formatZAR(price)}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoRow
              icon={<MapPin className="size-4" />}
              label="Pickup"
              value={pickup}
            />
            <InfoRow
              icon={<MapPin className="size-4" />}
              label="Dropoff"
              value={dropoff}
            />
            <InfoRow
              icon={<CalendarClock className="size-4" />}
              label="When"
              value={`${formatDate(date)} · ${time}`}
            />
            <InfoRow
              icon={<Car className="size-4" />}
              label="Driver"
              value="John Khumalo (confirming)"
            />
          </dl>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full"
          >
            <a
              href={`https://wa.me/27821234567?text=Hi%20John%2C%20booking%20${ref}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-4" />
              Message on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <a href="tel:+27821234567">
              <Phone className="size-4" />
              Call 082 123 4567
            </a>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
          <Button asChild className="rounded-full">
            <Link href="/dashboard">
              View my trips <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium text-foreground">
          {value || "—"}
        </dd>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return value
  }
}
