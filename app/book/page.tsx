import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BookingWizard } from "@/components/booking/booking-wizard"

export const metadata = {
  title: "Book a driver — John Khumalo Private Driver",
  description:
    "Book a private driver in Plettenberg Bay. Drive me home, wine farm driver, airport transfers and more.",
}

export default function BookPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Book a driver
          </p>
          <h1 className="mt-2 text-balance font-serif text-3xl font-semibold leading-tight md:text-4xl">
            A few details and we&apos;ll get you on your way.
          </h1>
        </div>
        <Suspense fallback={<BookingSkeleton />}>
          <BookingWizard />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}

function BookingSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_360px]">
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  )
}
