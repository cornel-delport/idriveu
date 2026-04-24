"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { MapPin, CircleDot, CalendarDays, Clock, ArrowRight } from "lucide-react"
import { services } from "@/lib/services"
import { cn } from "@/lib/utils"

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
        className="rounded-3xl border border-border bg-card p-4 shadow-[0_8px_30px_-12px] shadow-primary/15"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            Quick booking
          </h2>
          <span className="text-xs text-muted-foreground">Takes 30s</span>
        </div>

        {/* Pickup / Dropoff stacked with vertical connector */}
        <div className="relative rounded-2xl bg-secondary p-3">
          <div className="pointer-events-none absolute left-[26px] top-[42px] h-9 w-px bg-border" />
          <FieldRow
            icon={<CircleDot className="h-4 w-4 text-primary" />}
            label="Pickup"
            value={pickup}
            onChange={setPickup}
            placeholder="Current location or address"
          />
          <div className="my-2 ml-6 h-px bg-border" />
          <FieldRow
            icon={<MapPin className="h-4 w-4 text-accent-foreground" />}
            label="Drop off"
            value={dropoff}
            onChange={setDropoff}
            placeholder="Where are you going?"
          />
        </div>

        {/* Date & time */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <IconInput
            icon={<CalendarDays className="h-4 w-4 text-primary" />}
            label="Date"
            type="date"
            value={date || defaults.date}
            onChange={(v) => setDate(v)}
          />
          <IconInput
            icon={<Clock className="h-4 w-4 text-primary" />}
            label="Time"
            type="time"
            value={time || defaults.time}
            onChange={(v) => setTime(v)}
          />
        </div>

        {/* Service pills */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Service
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {services.slice(0, 6).map((s) => {
              const active = serviceId === s.id
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className={cn(
                    "tap inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.shortName}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          className="tap mt-4 inline-flex h-13 w-full items-center justify-between rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-md"
        >
          <span>Book now</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          You&apos;re booking a private driver who can drive your own car.
        </p>
      </form>
    </section>
  )
}

function FieldRow({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card ring-1 ring-border">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-0.5 text-[14px] font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </span>
    </label>
  )
}

function IconInput({
  icon,
  label,
  type,
  value,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  type: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card ring-1 ring-border">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-0.5 text-[14px] font-medium text-foreground outline-none"
        />
      </span>
    </label>
  )
}
