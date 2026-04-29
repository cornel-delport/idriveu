"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Download,
  ToggleRight,
  ToggleLeft,
  Hash,
  Loader2,
  QrCode as QrIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IconButton, IconInput } from "@/components/ui-icon"
import { createQrCode, setQrCodeStatus } from "@/actions/restaurants"

export interface QrRow {
  id: string
  qrCodeUrl: string
  tableNumber: string | null
  status: string
  scanCount: number
  lastScannedAt: Date | string | null
  createdAt: Date | string
}

interface Props {
  restaurantId: string
  restaurantName: string
  restaurantCode: string
  qrCodes: QrRow[]
}

export function QrCodesClient({
  restaurantId,
  restaurantName,
  restaurantCode,
  qrCodes,
}: Props) {
  const router = useRouter()
  const [tableNumber, setTableNumber] = useState("")
  const [creating, startCreate] = useTransition()
  const [pending, startTx] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startCreate(async () => {
      const res = await createQrCode({
        restaurantId,
        tableNumber: tableNumber.trim() || undefined,
      })
      if ("error" in res) {
        toast.error(res.error)
        return
      }
      toast.success("QR code created")
      setTableNumber("")
      router.refresh()
    })
  }

  function handleToggle(id: string, current: string) {
    const next = current === "active" ? "inactive" : "active"
    startTx(async () => {
      const res = await setQrCodeStatus(id, next)
      if ("error" in res) toast.error(res.error)
      else {
        toast.success(`Marked ${next}`)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[12px] font-medium text-muted-foreground">
          {restaurantName} · <span className="font-mono">{restaurantCode}</span>
        </p>
        <h2 className="text-[22px] font-semibold tracking-tight">
          QR codes ({qrCodes.length})
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Generate one QR code per table. Each scan lets the customer book a
          driver in seconds with the pickup locked here.
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="flex gap-2 rounded-2xl border border-border bg-card p-3"
      >
        <div className="flex-1">
          <IconInput
            icon={Hash}
            label="Table number (optional)"
            placeholder="e.g. 12 or BAR"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="tap mt-auto inline-flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Generate
        </button>
      </form>

      {/* List */}
      {qrCodes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <QrIcon className="h-6 w-6" />
          </span>
          <p className="text-[14px] font-semibold">No QR codes yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Generate one above to get started. You can download it as a PNG and
            print it on a table tent.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {qrCodes.map((q) => (
            <li
              key={q.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4",
                pending && "opacity-90",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">
                    {q.tableNumber ? `Table ${q.tableNumber}` : "General QR"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {q.scanCount} scans
                  </p>
                </div>
                <StatusPill status={q.status} />
              </div>

              <QrPreview url={q.qrCodeUrl} />

              <p className="break-all text-[10px] font-mono text-muted-foreground">
                {q.qrCodeUrl}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadQrPng(
                      q.qrCodeUrl,
                      `${restaurantCode}${q.tableNumber ? "-T" + q.tableNumber : ""}.png`,
                    )
                  }
                  className="tap inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-[12px] font-semibold text-primary-foreground"
                >
                  <Download className="h-3.5 w-3.5" /> Download PNG
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleToggle(q.id, q.status)}
                  className="tap inline-flex h-9 items-center gap-1.5 rounded-xl bg-secondary px-3 text-[12px] font-semibold disabled:opacity-50"
                >
                  {q.status === "active" ? (
                    <>
                      <ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" /> Activate
                    </>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2">
        <IconButton
          icon={Download}
          variant="secondary"
          fullWidth
          onClick={() => exportAllAsCsv(qrCodes, restaurantCode)}
          disabled={qrCodes.length === 0}
        >
          Export all QR URLs as CSV
        </IconButton>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "bg-muted text-muted-foreground"
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        cls,
      )}
    >
      {status}
    </span>
  )
}

/**
 * Render a QR code as PNG using the `qrcode` library on the client.
 * The library is loaded lazily so it doesn't bloat the admin bundle.
 */
function QrPreview({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const QR = (await import("qrcode")).default
        if (cancelled || !canvasRef.current) return
        await QR.toCanvas(canvasRef.current, url, {
          width: 220,
          margin: 1,
          color: { dark: "#0A0F1C", light: "#FFFFFF" },
        })
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "QR render failed")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [url])

  if (error) {
    return (
      <div className="rounded-xl bg-destructive/10 p-3 text-[12px] text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="flex justify-center rounded-xl bg-white p-3">
      <canvas ref={canvasRef} className="h-auto w-full max-w-[220px]" />
    </div>
  )
}

async function downloadQrPng(url: string, filename: string) {
  try {
    const QR = (await import("qrcode")).default
    const dataUrl = await QR.toDataURL(url, {
      width: 800,
      margin: 2,
      color: { dark: "#0A0F1C", light: "#FFFFFF" },
    })
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (err) {
    toast.error("Failed to generate PNG")
    console.error(err)
  }
}

function exportAllAsCsv(rows: QrRow[], restaurantCode: string) {
  const header = "table_number,status,scan_count,qr_url"
  const body = rows
    .map(
      (r) =>
        `"${r.tableNumber ?? ""}","${r.status}","${r.scanCount}","${r.qrCodeUrl}"`,
    )
    .join("\n")
  const blob = new Blob([header + "\n" + body], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${restaurantCode}-qr-codes.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
