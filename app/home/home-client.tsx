'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MapPin, Navigation, ArrowRight, Shield, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton, IconInput } from '@/components/ui-icon'

interface HomeClientProps {
  role: string
  name: string
}

export function HomeClient({ role, name }: HomeClientProps) {
  const router = useRouter()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [routeReady, setRouteReady] = useState(false)
  const isAdmin = role === 'admin' || role === 'super_admin'

  function handlePreview() {
    if (pickup.trim() && dropoff.trim()) setRouteReady(true)
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">
      {/* Greeting */}
      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground">
          {name ? `Hi, ${name.split(' ')[0]}` : 'Where to?'}
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Book a private driver in seconds.
        </p>
      </div>

      {/* Admin — Manage Users CTA */}
      {isAdmin && (
        <Link
          href="/admin/users"
          className={cn(
            'flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10',
            'px-4 py-3 text-[14px] font-semibold text-orange-600 transition hover:bg-orange-500/20',
            'dark:text-orange-400',
          )}
        >
          <Shield className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">Manage Users</span>
          <ArrowRight className="h-4 w-4 opacity-60" />
        </Link>
      )}

      {/* Pickup input */}
      <div className="flex flex-col gap-3">
        <IconInput
          icon={MapPin}
          label="Pickup location"
          type="text"
          placeholder="Enter pickup address"
          value={pickup}
          onChange={(e) => { setPickup(e.target.value); setRouteReady(false) }}
        />

        <IconInput
          icon={Navigation}
          label="Drop-off location"
          type="text"
          placeholder="Enter drop-off address"
          value={dropoff}
          onChange={(e) => { setDropoff(e.target.value); setRouteReady(false) }}
        />
      </div>

      {/* Place search hint */}
      {(pickup || dropoff) && !routeReady && (
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[13px] text-muted-foreground hover:bg-secondary"
        >
          <Search className="h-4 w-4" />
          Preview route
        </button>
      )}

      {/* Route preview */}
      {routeReady && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-1 text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
            Route preview
          </p>
          <p className="text-[14px] text-foreground">
            <span className="font-semibold">{pickup}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="font-semibold">{dropoff}</span>
          </p>
        </div>
      )}

      {/* Request ride CTA */}
      <IconButton
        icon={Navigation}
        iconRight={ArrowRight}
        variant="glow"
        size="lg"
        fullWidth
        onClick={() => {
          const params = new URLSearchParams()
          if (pickup) params.set('pickup', pickup)
          if (dropoff) params.set('dropoff', dropoff)
          router.push(`/book?${params.toString()}`)
        }}
      >
        Request ride
      </IconButton>
    </div>
  )
}
