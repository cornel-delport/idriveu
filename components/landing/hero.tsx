import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-primary/8 via-accent/5 to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-10 md:grid-cols-[1.1fr_1fr] md:gap-14 md:px-6 md:pb-24 md:pt-16 lg:gap-20">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <MapPin className="size-3.5 text-accent" />
            Plettenberg Bay · Garden Route
          </div>

          <h1 className="mt-6 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Enjoy your night.{" "}
            <span className="text-primary">John gets you</span> and your car{" "}
            <span className="relative inline-block">
              home safely
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-accent/40"
              />
            </span>
            .
          </h1>

          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            A trusted private driver in Plett. We drive you in{" "}
            <strong className="text-foreground">your own car</strong> after
            dinner, weddings or a day at the wine farms — plus airport
            transfers, errands and safe children pickup.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/book">
                Book a driver
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-6"
            >
              <Link href="/services">View services</Link>
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Trips</dt>
              <dd className="font-serif text-2xl font-semibold text-foreground">
                1 700+
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="flex items-center gap-1.5 font-serif text-2xl font-semibold text-foreground">
                4.9
                <Star className="size-4 fill-accent text-accent" />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Years</dt>
              <dd className="font-serif text-2xl font-semibold text-foreground">
                8+
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted shadow-2xl shadow-primary/10 ring-1 ring-border">
            <Image
              src="/images/driver-portrait.jpg"
              alt="John Khumalo, private driver in Plettenberg Bay"
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-background/90 p-4 shadow-lg backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex size-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Verified local driver
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    John &amp; Junior are vetted, insured and know every corner
                    of Plett.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-full bg-accent/30 blur-2xl md:block"
          />
          <div
            aria-hidden
            className="absolute -bottom-6 -left-6 hidden h-28 w-28 rounded-full bg-primary/15 blur-2xl md:block"
          />
        </div>
      </div>
    </section>
  )
}
