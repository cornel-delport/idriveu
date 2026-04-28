import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ShieldCheck,
  CarFront,
  Clock,
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { IconButton } from "@/components/ui-icon"

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
            className="tap inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Sign in
          </Link>
        </div>

        {/* Blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/75 to-[#0A0F1C]" />

        {/* Glow accents */}
        <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-[#4FC3F7]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-8">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/25 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4FC3F7]" />
            Plettenberg Bay · trusted locally
          </div>
          <h1 className="text-balance text-[40px] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
            Your car. Your plans.{" "}
            <span className="text-glow">IDriveU</span> gets you home safely.
          </h1>
          <p className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-white/75">
            Book a trusted private driver in Plettenberg Bay — we drive you home
            in your own car, on your schedule.
          </p>

          {/* Quick stats row — icon-first */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <HeroStat icon={CarFront} value="200+" label="Trips/mo" />
            <HeroStat icon={ShieldCheck} value="100%" label="Verified" />
            <HeroStat icon={Clock} value="24/7" label="Available" />
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <IconButton
              icon={CarFront}
              iconRight={ArrowRight}
              variant="glow"
              size="lg"
              href="/book"
              fullWidth
            >
              Book a driver
            </IconButton>
            <Link
              href="#quick-book"
              className="tap inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 text-[14px] font-semibold text-white ring-1 ring-white/20 backdrop-blur"
            >
              <Clock className="h-4 w-4" />
              Get an estimate in 30s
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-2 py-2.5 text-white ring-1 ring-white/15 backdrop-blur">
      <Icon className="h-4 w-4 text-[#4FC3F7]" />
      <span className="text-[15px] font-semibold leading-none">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">
        {label}
      </span>
    </div>
  )
}
