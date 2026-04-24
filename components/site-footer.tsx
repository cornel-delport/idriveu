import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { BrandLogo } from "./brand-logo"

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <BrandLogo href={null} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Private driver, wine farm, airport transfer and family pickup
            service in Plettenberg Bay. Your car. Your plans. We get you home
            safely.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> Plettenberg Bay,
              Western Cape
            </span>
            <a
              href="tel:+27821234567"
              className="inline-flex items-center gap-2 hover:text-foreground"
            >
              <Phone className="size-4 text-accent" /> 082 123 4567
            </a>
            <a
              href="mailto:bookings@johnkhumalo.co.za"
              className="inline-flex items-center gap-2 hover:text-foreground"
            >
              <Mail className="size-4 text-accent" /> bookings@johnkhumalo.co.za
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold">Services</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/services#drive-me-home" className="hover:text-foreground">
                Drive Me Home
              </Link>
            </li>
            <li>
              <Link href="/services#wine-farm" className="hover:text-foreground">
                Wine Farm Driver
              </Link>
            </li>
            <li>
              <Link href="/services#airport" className="hover:text-foreground">
                Airport Transfers
              </Link>
            </li>
            <li>
              <Link href="/services#child-pickup" className="hover:text-foreground">
                Children Pickup
              </Link>
            </li>
            <li>
              <Link href="/services#tourist" className="hover:text-foreground">
                Tourist Day Driver
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/book" className="hover:text-foreground">
                Book a driver
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                Terms & safety
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:px-6">
          <p>
            &copy; {new Date().getFullYear()} John Khumalo Private Driver
            Services. All rights reserved.
          </p>
          <p>
            Private driver &amp; chauffeur booking service. Not a metered taxi
            service.
          </p>
        </div>
      </div>
    </footer>
  )
}
