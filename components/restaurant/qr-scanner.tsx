"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CameraOff, Loader2, ScanLine, Hash } from "lucide-react"
import { IconButton } from "@/components/ui-icon"

const READER_ID = "qr-reader"

interface Props {
  /** Called once we've extracted a restaurant code from any scanned URL */
  onCode?: (code: string) => void
}

/**
 * Mobile camera QR scanner using html5-qrcode.
 *
 * The library is loaded lazily on the client only — it pulls in
 * a non-trivial JS bundle that we don't want on every page load.
 *
 * Recognised QR payloads:
 *   1. Full IDriveU URL: https://<host>/qr/restaurant/PLETT-001?t=12
 *   2. Bare path: /qr/restaurant/PLETT-001
 *   3. Just the code: PLETT-001
 */
export function QrScanner({ onCode }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "scanning" | "denied" | "error">(
    "loading",
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(
    null,
  )
  const handledRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null

    async function start() {
      try {
        // Lazy import — keeps html5-qrcode out of the main bundle
        const mod = await import("html5-qrcode")
        const Html5Qrcode = mod.Html5Qrcode
        if (cancelled) return

        const inst = new Html5Qrcode(READER_ID)
        scanner = inst as unknown as {
          stop: () => Promise<void>
          clear: () => void
        }
        scannerRef.current = scanner

        await inst.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            if (handledRef.current) return
            const code = extractRestaurantCode(decodedText)
            if (!code) return
            handledRef.current = true
            // Fire-and-forget: stop the camera, then route
            inst
              .stop()
              .catch(() => undefined)
              .finally(() => {
                if (onCode) onCode(code)
                else router.push(`/qr/restaurant/${code}`)
              })
          },
          () => {
            // Per-frame "no QR" — ignore
          },
        )

        if (cancelled) {
          await inst.stop().catch(() => undefined)
          return
        }
        setStatus("scanning")
      } catch (err: unknown) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : "Camera unavailable"
        // NotAllowedError → permission denied; everything else → generic
        if (
          /permission|denied|notAllowed/i.test(msg) ||
          (err as { name?: string })?.name === "NotAllowedError"
        ) {
          setStatus("denied")
        } else {
          setStatus("error")
          setErrorMessage(msg)
        }
      }
    }

    start()
    return () => {
      cancelled = true
      const s = scannerRef.current
      if (s) {
        s.stop()
          .catch(() => undefined)
          .finally(() => {
            try {
              s.clear()
            } catch {
              /* noop */
            }
          })
      }
    }
  }, [router, onCode])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Camera view target */}
      <div
        id={READER_ID}
        className="absolute inset-0 [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover"
      />

      {/* Scan frame overlay */}
      {status === "scanning" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-64 w-64">
            <CornerBracket position="tl" />
            <CornerBracket position="tr" />
            <CornerBracket position="bl" />
            <CornerBracket position="br" />
            {/* Animated scan line */}
            <div className="absolute inset-x-3 top-3 bottom-3 overflow-hidden rounded-md">
              <div
                className="absolute left-0 right-0 h-[2px] bg-[#4FC3F7] shadow-[0_0_18px_rgba(79,195,247,0.9)]"
                style={{ animation: "scan 2.4s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      {status === "scanning" && (
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(env(safe-area-inset-bottom,0px),24px)] pt-6">
          <div className="glass-dark flex items-center gap-2 rounded-2xl px-4 py-3 ring-1 ring-white/10">
            <ScanLine className="h-4 w-4 text-[#4FC3F7]" />
            <p className="text-[13px] font-medium text-white/90">
              Point your camera at the QR code on your table
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/?manual=1")}
            className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-3 text-[13px] font-semibold text-white ring-1 ring-white/15"
          >
            <Hash className="h-4 w-4" />
            Enter code manually instead
          </button>
        </div>
      )}

      {/* Loading */}
      {status === "loading" && (
        <Centered>
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="mt-3 text-[14px] text-white/80">Starting camera…</p>
        </Centered>
      )}

      {/* Permission denied */}
      {status === "denied" && (
        <Centered>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <CameraOff className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-[18px] font-semibold text-white">
            Camera access denied
          </h2>
          <p className="mt-2 max-w-[280px] text-center text-[13px] text-white/75">
            Allow camera access in your browser settings to scan QR codes — or
            type your restaurant code manually.
          </p>
          <IconButton
            icon={Hash}
            variant="glow"
            size="md"
            href="/?manual=1"
            className="mt-5"
          >
            Enter code manually
          </IconButton>
        </Centered>
      )}

      {/* Generic error */}
      {status === "error" && (
        <Centered>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <CameraOff className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-[18px] font-semibold text-white">
            Couldn&apos;t start the scanner
          </h2>
          <p className="mt-2 max-w-[280px] text-center text-[13px] text-white/75">
            {errorMessage ?? "Something went wrong with your camera."}
          </p>
          <IconButton
            icon={Hash}
            variant="glow"
            size="md"
            href="/?manual=1"
            className="mt-5"
          >
            Enter code manually
          </IconButton>
        </Centered>
      )}

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: calc(100% - 2px);
          }
          100% {
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  )
}

function CornerBracket({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br"
}) {
  const cls: Record<typeof position, string> = {
    tl: "top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl",
    tr: "top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl",
    bl: "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl",
    br: "bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl",
  }
  return <span className={`absolute h-7 w-7 border-[#4FC3F7] ${cls[position]}`} />
}

/**
 * Extract a restaurant code from any QR payload we recognise.
 * Returns null for anything that doesn't look like an IDriveU QR.
 */
function extractRestaurantCode(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Try to parse as URL
  try {
    const url = new URL(trimmed)
    const m = url.pathname.match(/\/qr\/restaurant\/([A-Z0-9-]+)/i)
    if (m?.[1]) return m[1].toUpperCase()
  } catch {
    /* not a URL */
  }

  // Bare path
  const pathMatch = trimmed.match(/\/qr\/restaurant\/([A-Z0-9-]+)/i)
  if (pathMatch?.[1]) return pathMatch[1].toUpperCase()

  // Naked code
  if (/^[A-Z0-9-]{3,20}$/i.test(trimmed)) return trimmed.toUpperCase()

  return null
}
