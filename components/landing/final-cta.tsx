import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground">
        <Image
          src="/images/plett-coast-evening.jpg"
          alt=""
          fill
          sizes="(min-width: 768px) 80vw, 100vw"
          className="object-cover opacity-20"
          aria-hidden
        />
        <div className="relative grid gap-6 p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Your car. Your plans.
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-semibold leading-tight md:text-4xl">
              John gets you home safely.
            </h2>
            <p className="mt-3 max-w-lg text-primary-foreground/80">
              Book online in under a minute, or give us a call — we answer from
              early morning to late night.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full rounded-full md:w-auto"
            >
              <Link href="/book">
                Book a driver <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground md:w-auto"
            >
              <a href="tel:+27821234567">
                <Phone className="size-4" /> 082 123 4567
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
