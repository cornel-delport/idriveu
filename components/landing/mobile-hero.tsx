import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export function MobileHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="relative h-[78vh] min-h-[560px] w-full">
        <Image
          src="/images/hero-night-road.jpg"
          alt="Coastal road in Plettenberg Bay at dusk"
          fill
          priority
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover"
        />
        {/* Top bar floating over hero */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-3">
          <BrandLogo tone="light" />
          <Link
            href="/login"
            className="tap rounded-full bg-primary-foreground/15 px-3.5 py-1.5 text-xs font-medium text-primary-foreground ring-1 ring-primary-foreground/25 backdrop-blur"
          >
            Sign in
          </Link>
        </div>

        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/75 to-primary" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-8">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground ring-1 ring-primary-foreground/20 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Plettenberg Bay · trusted locally
          </div>
          <h1 className="text-balance text-[38px] font-semibold leading-[1.05] tracking-tight text-primary-foreground sm:text-5xl">
            Your car. Your plans.{" "}
            <span className="text-accent">IDriveU</span> gets you home safely.
          </h1>
          <p className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-primary-foreground/80">
            Book a trusted private driver in Plettenberg Bay — we drive you
            home in your own car, on your schedule.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/book"
              className="tap group inline-flex h-14 items-center justify-between rounded-2xl bg-accent px-5 text-[15px] font-semibold text-accent-foreground shadow-lg shadow-primary/30"
            >
              <span>Book a driver</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-foreground/10 transition-transform group-active:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="#quick-book"
              className="tap inline-flex h-12 items-center justify-center rounded-2xl bg-primary-foreground/10 text-[14px] font-medium text-primary-foreground ring-1 ring-primary-foreground/20 backdrop-blur"
            >
              Get an estimate in 30 seconds
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
