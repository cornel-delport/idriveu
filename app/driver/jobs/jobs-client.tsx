'use client'

import { useState, useTransition } from 'react'
import { BriefcaseBusiness, MapPin, Navigation, Users, Car, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { claimBooking } from '@/actions/bookings'
import { formatZAR } from '@/lib/pricing'
import { cn } from '@/lib/utils'

export interface JobCardData {
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

export interface ActiveTripData {
  id: string
  reference: string
  pickupAddress: string
  dropoffAddress: string
  dateTime: string
  status: string
}

interface JobsClientProps {
  jobs: JobCardData[]
  activeTrip: ActiveTripData | null
}

function ActiveTripCard({ trip }: { trip: ActiveTripData }) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Car className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Active trip · {trip.reference}
        </span>
      </div>
      <div className="flex flex-col gap-1 text-[13px] text-foreground">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span>{trip.pickupAddress}</span>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span>{trip.dropoffAddress}</span>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">
        Status: <span className="font-medium text-foreground">{trip.status.replace(/_/g, ' ')}</span>
      </p>
    </div>
  )
}

function JobCard({
  job,
  onAccept,
  onDecline,
  busy,
}: {
  job: JobCardData
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  busy: boolean
}) {
  const date = new Date(job.dateTime)
  const dateLabel = date.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeLabel = date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">{job.reference}</p>
          <p className="text-[13px] font-semibold text-foreground">{dateLabel} · {timeLabel}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary">
          {formatZAR(job.estimatedPrice)}
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-1.5 text-[13px] text-foreground">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="line-clamp-2">{job.pickupAddress}</span>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="line-clamp-2">{job.dropoffAddress}</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {job.passengerCount} pax
        </span>
        <span>{job.distanceKm.toFixed(1)} km</span>
      </div>

      <div className="flex gap-3">
        <button
          disabled={busy}
          onClick={() => onDecline(job.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary',
            'py-2.5 text-[13px] font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive',
            busy && 'pointer-events-none opacity-50',
          )}
        >
          <XCircle className="h-4 w-4" /> Decline
        </button>
        <button
          disabled={busy}
          onClick={() => onAccept(job.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5',
            'text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90',
            busy && 'pointer-events-none opacity-50',
          )}
        >
          <CheckCircle className="h-4 w-4" /> Accept
        </button>
      </div>
    </div>
  )
}

export function JobsClient({ jobs: initialJobs, activeTrip }: JobsClientProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [_isPending, startTransition] = useTransition()

  function handleAccept(id: string) {
    setClaimingId(id)
    startTransition(async () => {
      try {
        const result = await claimBooking(id)
        if (result && typeof result === 'object' && 'error' in result) {
          toast.error(String((result as { error: unknown }).error))
        } else {
          toast.success('Job accepted!')
          setJobs((prev) => prev.filter((j) => j.id !== id))
        }
      } catch {
        toast.error('Failed to accept job. Please try again.')
      } finally {
        setClaimingId(null)
      }
    })
  }

  function handleDecline(id: string) {
    setJobs((prev) => prev.filter((j) => j.id !== id))
    toast('Job skipped.')
  }

  return (
    <div>
      {activeTrip && <ActiveTripCard trip={activeTrip} />}

      <div className="mb-3 flex items-center gap-2">
        <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[15px] font-semibold">
          Available jobs
          {jobs.length > 0 && (
            <span className="ml-2 text-[13px] font-normal text-muted-foreground">
              ({jobs.length})
            </span>
          )}
        </h2>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-[14px] font-medium text-muted-foreground">No jobs available right now</p>
          <p className="text-[12px] text-muted-foreground">Pull down to refresh or check back soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onAccept={handleAccept}
              onDecline={handleDecline}
              busy={claimingId === job.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
