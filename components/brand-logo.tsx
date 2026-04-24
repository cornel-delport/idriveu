import Link from "next/link"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  mono?: boolean
  href?: string | null
}

export function BrandLogo({ className, mono, href = "/" }: BrandLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full",
          mono
            ? "bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20"
            : "bg-primary text-primary-foreground ring-1 ring-primary/20",
        )}
      >
        <span className="font-serif text-base font-semibold">JK</span>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2",
            mono ? "bg-accent ring-primary" : "bg-accent ring-background",
          )}
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-serif text-base font-semibold tracking-tight">
          John Khumalo
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.18em]",
            mono ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          Private Driver · Plett
        </span>
      </span>
    </span>
  )
  if (!href) return content
  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  )
}
