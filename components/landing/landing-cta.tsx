import Link from "next/link"
import { MessageCircle, Phone } from "lucide-react"

export function LandingCta() {
  return (
    <section className="px-4 pb-8 pt-10">
      <div className="card-dark relative overflow-hidden rounded-[28px] p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#4FC3F7]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <h2 className="relative text-[24px] font-semibold leading-tight tracking-tight text-white">
          Ready to get home safely?
        </h2>
        <p className="relative mt-2 text-[14px] leading-relaxed text-white/75">
          Book in under a minute, or send us a quick message and we&apos;ll
          sort it out.
        </p>
        <div className="relative mt-5 flex flex-col gap-2.5">
          <Link
            href="/book"
            className="tap btn-glow-strong inline-flex h-12 items-center justify-center rounded-2xl text-[14px] font-semibold"
          >
            Book a driver
          </Link>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="https://wa.me/27821234567"
              className="tap inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/10 text-[13px] font-medium text-white ring-1 ring-white/15"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href="tel:+27821234567"
              className="tap inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/10 text-[13px] font-medium text-white ring-1 ring-white/15"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
