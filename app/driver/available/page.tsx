'use client'

import { useEffect, useState, useTransition } from 'react'
import { BriefcaseBusiness, MapPin, Users, Car } from 'lucide-react'
import { toast } from 'sonner'
import { MobileShell } from '@/components/mobile-shell'
import { AppTopBar } from '@/components/app-top-bar'
import { BottomNav, BottomNavSpacer } from '@/components/bottom-nav'
import { claimBooking } from '@/actions/bookings'
import { getService } from '@/lib/services'
import { formatZAR } from '@/lib/pricing'
import { formatDateTime } from '@/lib/time'

interface AvailableBooking {
  id: string
  reference: string
  serviceId: string
  pickupAddress: string
  dropoffAddress: string
  dateTime: string
  estimatedPrice: number
  passengerCount: number
  distanceKm: number
}

export default function AvailableJobsPage() {
  const [jobs, setJobs] = useState<AvailableBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function fetchJobs() {
    try {
      const res = await fetch('/api/bookings/available')
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 30_000)
    return () => clearInterval(interval)
  }, [])

  function handleClaim(id: string) {
    setClaimingId(id)
    startTransition(async () => {
      const result = await claimBooking(id)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Job claimed! Check your dashboard.')
        setJobs((prev) => prev.filter((j) => j.id !== id))
      }
      setClaimingId(null)
    })
  }

  return (
    <MobileShell>
      <AppTopBar title="Available Jobs" />
      <main className="px-4 pt-2">
        <section>
          <p className="text-[12px] font-medium text-muted-foreground">Open jobs</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            Available Jobs
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Refreshes every 30 seconds. Claim a job to assign it to yourself.
          </p>
        </section>

        <section className="mt-5">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-3xl border border-border bg-card"
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <BriefcaseBusiness className="h-7 w-7 text-muted-foreground" />
              </span>
              <p className="text-[15px] font-semibold">No available jobs</p>
              <p className="text-[13px] text-muted-foreground">
                Check back soon — jobs refresh automatically.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {jobs.map((job) => {
                const service = getService(job.serviceId)
                const Icon = service?.icon
                const isClaiming = claimingId === job.id && isPending
                return (
                  <li
                    key={job.id}
                    className="overflow-hidden rounded-3xl border border-border bg-card"
                  >
                    <div className="flex items-start gap-3 p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {Icon ? <Icon className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold">
                              {service?.name ?? job.serviceId}
                            </p>
                            <p className="text-[12px] text-muted-foreground">
                              Ref {job.reference} · {formatDateTime(job.dateTime)}
                            </p>
                          </div>
                          <p className="shrink-0 text-[16px] font-bold text-primary">
                            {formatZAR(job.estimatedPrice)}
                          </p>
                        </div>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">{job.pickupAddress}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                            <span className="truncate">{job.dropoffAddress}</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {job.passengerCount} pax
                          </span>
                          {job.distanceKm > 0 && (
                            <span>{job.distanceKm.toFixed(1)} km</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border px-4 py-3">
                      <button
                        onClick={() => handleClaim(job.id)}
                        disabled={isPending}
                        className="tap inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[13px] font-semibold text-accent-foreground disabled:opacity-60"
                      >
                        {isClaiming ? 'Claiming…' : 'Claim this job'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
