import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  tone?: "dark" | "light"
  showWordmark?: boolean
}

export function BrandLogo({
  className,
  tone = "dark",
  showWordmark = true,
}: BrandLogoProps) {
  const text =
    tone === "light" ? "text-primary-foreground" : "text-foreground"
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark tone={tone} />
      {showWordmark && (
        <span
          className={cn(
            "text-[17px] font-semibold tracking-tight leading-none",
            text,
          )}
        >
          <span>iDrive</span>
          <span className="text-accent">U</span>
        </span>
      )}
    </div>
  )
}

export function LogoMark({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light"
  className?: string
}) {
  const bg =
    tone === "light"
      ? "bg-primary-foreground/15 ring-1 ring-primary-foreground/30"
      : "bg-primary"
  const fg = "text-primary-foreground"
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl shadow-sm",
        bg,
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("h-[18px] w-[18px]", fg)}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 20c2-6 5-9 7-9s3 2 3 5" />
        <circle cx="17" cy="8" r="2.3" className="fill-accent stroke-accent" />
        <path d="M5 20h14" />
      </svg>
    </div>
  )
}
