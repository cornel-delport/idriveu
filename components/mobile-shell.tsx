import { cn } from "@/lib/utils"

interface MobileShellProps {
  children: React.ReactNode
  className?: string
  /** Set to false to remove the default mx-auto max-w container */
  contained?: boolean
}

/**
 * Vertical mobile-first container. On desktop the content is centered
 * inside a phone-width column so the app always feels like a native app.
 */
export function MobileShell({
  children,
  className,
  contained = true,
}: MobileShellProps) {
  return (
    <div className={cn("relative min-h-dvh bg-background", className)}>
      {contained ? (
        <div className="mx-auto w-full max-w-xl">{children}</div>
      ) : (
        children
      )}
    </div>
  )
}
