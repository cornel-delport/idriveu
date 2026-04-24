import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Service } from "@/lib/services"
import { cn } from "@/lib/utils"

interface BaseProps {
  service: Service
  className?: string
  /** Compact omits the description (useful inside tight grids) */
  compact?: boolean
}

interface LinkCardProps extends BaseProps {
  as?: "link"
  href?: string
}

interface SelectCardProps extends BaseProps {
  as: "select"
  active?: boolean
  onSelect?: (id: Service["id"]) => void
}

type ServiceCardProps = LinkCardProps | SelectCardProps

/**
 * IDriveU signature service card.
 * - Dark navy → blue gradient with soft cyan glow
 * - Frosted glass circular icon chip
 * - Bold white title, muted description
 * - Blue price text bottom-left, glowing arrow button bottom-right
 */
export function ServiceCard(props: ServiceCardProps) {
  const { service, className, compact } = props
  const Icon = service.icon

  const body = (
    <>
      {/* Decorative corner glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#4FC3F7]/20 blur-3xl"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="chip-glass flex h-12 w-12 items-center justify-center rounded-2xl text-[#4FC3F7]">
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </span>
        {service.badge && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/15">
            {service.badge}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <h3 className="text-[18px] font-semibold leading-tight tracking-tight text-white">
          {service.name}
        </h3>
        {!compact && (
          <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/65">
            {service.description}
          </p>
        )}
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <span className="text-[14px] font-semibold text-[#4FC3F7]">
          {service.priceLabel}
        </span>
        <span
          aria-hidden
          className="btn-glow tap flex h-10 w-10 items-center justify-center rounded-full"
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </>
  )

  const baseCls = cn(
    "card-dark tap group relative block overflow-hidden rounded-[26px] p-5",
    compact ? "min-h-[170px]" : "min-h-[220px]",
    className,
  )

  if (props.as === "select") {
    const { active, onSelect } = props
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onSelect?.(service.id)}
        className={cn(
          baseCls,
          "text-left",
          active &&
            "ring-2 ring-[#4FC3F7] shadow-[0_0_0_6px_rgba(79,195,247,0.15),0_22px_48px_-16px_rgba(25,118,210,0.55)]",
        )}
      >
        {body}
      </button>
    )
  }

  const href = props.href ?? `/book?service=${service.id}`
  return (
    <Link href={href} className={baseCls} aria-label={`Book ${service.name}`}>
      {body}
    </Link>
  )
}
