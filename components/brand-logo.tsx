import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  tone?: "dark" | "light"
  showWordmark?: boolean
  size?: "sm" | "md" | "lg"
}

/**
 * IDriveU brand identity:
 *   - Glyph: a protective "U" cradle around a simplified person (head + body)
 *   - Wordmark: "IDriveU" — bold, modern sans
 *   - Tone "dark" = for light surfaces (navy glyph, navy text)
 *   - Tone "light" = for dark surfaces (cyan glyph, white text)
 */
export function BrandLogo({
  className,
  tone = "dark",
  showWordmark = true,
  size = "md",
}: BrandLogoProps) {
  const textCls =
    tone === "light" ? "text-white" : "text-[#0A0F1C]"
  const sizeGlyph =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
  const sizeText =
    size === "sm"
      ? "text-[15px]"
      : size === "lg"
        ? "text-[22px]"
        : "text-[18px]"
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark tone={tone} className={sizeGlyph} />
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight leading-none",
            sizeText,
            textCls,
          )}
        >
          IDriveU
        </span>
      )}
    </div>
  )
}

/**
 * Stand-alone glyph. Uses a linear gradient (cyan → blue → navy)
 * for the "U" cradle and a solid blue dot+body for the person figure.
 */
export function LogoMark({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light"
  className?: string
}) {
  // On light tone (dark surfaces) we render the glyph in cyan/white.
  const isLight = tone === "light"
  const gradientId = isLight ? "idu-grad-light" : "idu-grad-dark"
  const innerFill = isLight ? "#FFFFFF" : "#1976D2"

  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("block", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="idu-grad-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="55%" stopColor="#1976D2" />
          <stop offset="100%" stopColor="#0D47A1" />
        </linearGradient>
        <linearGradient id="idu-grad-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BEE4FB" />
          <stop offset="60%" stopColor="#4FC3F7" />
          <stop offset="100%" stopColor="#1976D2" />
        </linearGradient>
      </defs>

      {/* Outer "U" cradle — a thick stroked path */}
      <path
        d="M10 8 V 26 A 14 14 0 0 0 38 26 V 8"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Inner figure — head */}
      <circle cx="24" cy="13" r="3.1" fill={innerFill} />
      {/* Inner figure — body */}
      <rect
        x="20.6"
        y="18"
        width="6.8"
        height="15"
        rx="3.4"
        fill={innerFill}
      />
    </svg>
  )
}
