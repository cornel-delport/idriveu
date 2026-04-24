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
 * Select mode:
 *   - Unselected → soft light-blue surface, dark text, subtle border
 *   - Selected   → dark navy gradient (card-dark), white text, cyan ring
 *   - Hover      → scale-up pop with elevated shadow
 * Link mode → always dark card-dark style.
 */
export function ServiceCard(props: ServiceCardProps) {
  const { service, className, compact } = props
  const Icon = service.icon

  const isSelect = props.as === "select"
  const active = isSelect && (props as SelectCardProps).active

  /* ── Body elements adapt colour based on active/inactive state ── */
  const body = (
    <>
      {/* Decorative corner glow — visible on dark (active/link) cards only */}
      {(!isSelect || active) && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#4FC3F7]/20 blur-3xl"
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            isSelect && !active
              ? "bg-[#DBEEFF] text-[#1565C0]"          // light card: tinted chip
              : "chip-glass text-[#4FC3F7]",             // dark card: frosted glass
          )}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </span>
        {service.badge && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
              isSelect && !active
                ? "bg-[#1565C0]/10 text-[#1565C0] ring-[#1565C0]/20"
                : "bg-white/10 text-white/90 ring-white/15",
            )}
          >
            {service.badge}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <h3
          className={cn(
            "text-[18px] font-semibold leading-tight tracking-tight",
            isSelect && !active ? "text-[#0D2857]" : "text-white",
          )}
        >
          {service.name}
        </h3>
        {!compact && (
          <p
            className={cn(
              "mt-2 line-clamp-3 text-[13px] leading-relaxed",
              isSelect && !active ? "text-[#3B6A9A]" : "text-white/65",
            )}
          >
            {service.description}
          </p>
        )}
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <span
          className={cn(
            "text-[14px] font-semibold",
            isSelect && !active ? "text-[#1565C0]" : "text-[#4FC3F7]",
          )}
        >
          {service.priceLabel}
        </span>
        <span
          aria-hidden
          className={cn(
            "tap flex h-10 w-10 items-center justify-center rounded-full",
            isSelect && !active
              ? "bg-[#1565C0] text-white shadow-[0_4px_12px_-4px_rgba(21,101,192,0.5)]"
              : "btn-glow",
          )}
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </>
  )

  if (isSelect) {
    const { onSelect } = props as SelectCardProps
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onSelect?.(service.id)}
        className={cn(
          // Base layout
          "tap group relative block overflow-hidden rounded-[26px] p-5 text-left transition-all duration-200",
          compact ? "min-h-[170px]" : "min-h-[220px]",
          // Hover pop
          "hover:scale-[1.03] hover:shadow-[0_24px_48px_-12px_rgba(13,71,161,0.35)]",
          active
            ? // Selected → dark navy gradient
              [
                "card-dark",
                "ring-2 ring-[#4FC3F7]",
                "shadow-[0_0_0_6px_rgba(79,195,247,0.15),0_22px_48px_-16px_rgba(25,118,210,0.55)]",
              ]
            : // Unselected → soft light blue
              [
                "bg-[#EEF6FF]",
                "ring-1 ring-[#BDDCF8]",
                "shadow-[0_4px_16px_-4px_rgba(21,101,192,0.12)]",
              ],
          className,
        )}
      >
        {body}
      </button>
    )
  }

  // Link card → always dark
  const href = props.href ?? `/book?service=${service.id}`
  return (
    <Link
      href={href}
      className={cn(
        "card-dark tap group relative block overflow-hidden rounded-[26px] p-5",
        "transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_24px_48px_-12px_rgba(13,71,161,0.45)]",
        compact ? "min-h-[170px]" : "min-h-[220px]",
        className,
      )}
      aria-label={`Book ${service.name}`}
    >
      {body}
    </Link>
  )
}
