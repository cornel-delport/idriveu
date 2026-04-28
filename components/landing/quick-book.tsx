"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  MapPin,
  CircleDot,
  CalendarDays,
  Clock,
  ArrowRight,
  CarFront,
  Sparkles,
} from "lucide-react"
import { services } from "@/lib/services"
import { cn } from "@/lib/utils"
import { IconInput, IconButton } from "@/components/ui-icon"

export function QuickBook() {
  const router = useRouter()
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [serviceId, setServiceId] = useState<string>("drive-me-home")

  const defaults = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 60)
    const pad = (n: number) => String(n).padStart(2, "0")
    return {
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    }
  }, [])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set("service", serviceId)
    if (pickup) params.set("pickup", pickup)
    if (dropoff) params.set("dropoff", dropoff)
    params.set("date", date || defaults.date)
    params.set("time", time || defaults.time)
    router.push(`/book?${params.toString()}`)
  }

  return (
    <section id="quick-book" className="px-4 pt-6">
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-border bg-card p-4 shadow-[0_8px_30px_-12px_rgba(13,71,161,0.25)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold tracking-tight text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            Quick booking
          </h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            ~30 sec
          </span>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <IconInput
            icon={CircleDot}
            label="Pickup"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Current location or address"
            tone="primary"
          />
          <IconInput
            icon={MapPin}
            label="Dropoff"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="Where are you going?"
            tone="accent"
          />

          <div className="grid grid-cols-2 gap-3">
            <IconInput
              icon={CalendarDays}
              label="Date"
              type="date"
              value={date || defaults.date}
              onChange={(e) => setDate(e.target.value)}
              tone="primary"
            />
            <IconInput
              icon={Clock}
              label="Time"
              type="time"
              value={time || defaults.time}
              onChange={(e) => setTime(e.target.value)}
              tone="primary"
            />
          </div>
        </div>

        {/* Service pills */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Service
            </span>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {services.slice(0, 6).map((s) => {
              const active = serviceId === s.id
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className={cn(
                    "tap inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_rgba(13,71,161,0.5)]"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {s.shortName}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5">
          <IconButton
            type="submit"
            icon={CarFront}
            iconRight={ArrowRight}
            variant="glow"
            size="lg"
            fullWidth
          >
            Book now
          </IconButton>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          You&apos;re booking a private driver who can drive your own car.
        </p>
      </form>
    </section>
  )
}
