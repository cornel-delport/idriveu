"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  MapPin,
  Hash,
  Plus,
  ChevronRight,
  QrCode,
  ToggleRight,
  ToggleLeft,
  PhoneCall,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IconButton, IconInput } from "@/components/ui-icon"
import { createRestaurant, updateRestaurant } from "@/actions/restaurants"

export interface RestaurantRow {
  id: string
  name: string
  address: string
  restaurantCode: string
  status: string
  lat: number
  lng: number
  contactName: string | null
  contactPhone: string | null
  waiveCallOutFee: boolean
  qrCodeCount: number
  bookingCount: number
}

interface Props {
  restaurants: RestaurantRow[]
}

export function RestaurantsClient({ restaurants }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(restaurants.length === 0)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">
            QR partner venues
          </p>
          <h2 className="text-[22px] font-semibold tracking-tight">
            {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"}
          </h2>
        </div>
        {!showForm && (
          <IconButton
            icon={Plus}
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            New
          </IconButton>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <CreateRestaurantForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            router.refresh()
          }}
        />
      )}

      {/* List */}
      {restaurants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Building2 className="h-6 w-6" />
          </span>
          <p className="text-[15px] font-semibold">No restaurants yet</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Add a partner restaurant — admins can then generate QR codes for
            their tables.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {restaurants.map((r) => (
            <li key={r.id}>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/restaurants/${r.id}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <p className="truncate text-[15px] font-semibold text-foreground">
                        {r.name}
                      </p>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono font-semibold text-foreground">
                        {r.restaurantCode}
                      </span>
                      {" · "}
                      <MapPin className="h-3 w-3" /> {r.address}
                    </p>
                    {r.contactPhone && (
                      <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                        <PhoneCall className="h-3 w-3" /> {r.contactPhone}
                      </p>
                    )}
                  </Link>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Stat label="QR codes" value={r.qrCodeCount} />
                  <Stat label="Bookings" value={r.bookingCount} />
                  <Stat
                    label="Call-out"
                    value={r.waiveCallOutFee ? "Waived" : "Standard"}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/restaurants/${r.id}/qr-codes`}
                    className="tap inline-flex h-9 items-center gap-1.5 rounded-xl bg-secondary px-3 text-[12px] font-semibold"
                  >
                    <QrCode className="h-3.5 w-3.5" /> QR codes
                  </Link>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const next = r.status === "active" ? "inactive" : "active"
                        const res = await updateRestaurant({ id: r.id, status: next })
                        if ("error" in res) toast.error(res.error)
                        else {
                          toast.success(`Marked ${next}`)
                          router.refresh()
                        }
                      })
                    }}
                    className="tap inline-flex h-9 items-center gap-1.5 rounded-xl bg-secondary px-3 text-[12px] font-semibold disabled:opacity-50"
                  >
                    {r.status === "active" ? (
                      <>
                        <ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" /> Activate
                      </>
                    )}
                  </button>
                  <Link
                    href={`/admin/restaurants/${r.id}`}
                    className="tap ml-auto inline-flex h-9 items-center gap-1 rounded-xl bg-primary/10 px-3 text-[12px] font-semibold text-primary"
                  >
                    Edit <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary px-2 py-2">
      <p className="text-[16px] font-bold text-foreground">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

function CreateRestaurantForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: () => void
}) {
  const [submitting, startSubmit] = useTransition()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [address, setAddress] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [waiveCallOutFee, setWaiveCallOutFee] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      toast.error("Latitude and longitude must be valid numbers")
      return
    }
    startSubmit(async () => {
      const res = await createRestaurant({
        name,
        address,
        lat: latNum,
        lng: lngNum,
        restaurantCode: code.toUpperCase(),
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        waiveCallOutFee,
      })
      if ("error" in res) {
        toast.error(res.error)
      } else {
        toast.success("Restaurant created")
        onCreated()
      }
    })
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4"
    >
      <p className="text-[15px] font-semibold tracking-tight">New restaurant</p>

      <IconInput
        icon={Building2}
        label="Name"
        placeholder="The Lookout"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <IconInput
        icon={Hash}
        label="Restaurant code"
        placeholder="PLETT-001"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        hint="A short, unique, all-uppercase code shown on table tents."
        required
      />
      <IconInput
        icon={MapPin}
        label="Address"
        placeholder="Lookout Centre, Plettenberg Bay"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <IconInput
          icon={MapPin}
          label="Latitude"
          placeholder="-34.0527"
          inputMode="decimal"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          required
        />
        <IconInput
          icon={MapPin}
          label="Longitude"
          placeholder="23.3716"
          inputMode="decimal"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <IconInput
          icon={Building2}
          label="Contact name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />
        <IconInput
          icon={PhoneCall}
          label="Contact phone"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-[13px]">
        <input
          type="checkbox"
          checked={waiveCallOutFee}
          onChange={(e) => setWaiveCallOutFee(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span>Waive call-out fee for this venue</span>
      </label>

      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="tap flex-1 rounded-full border border-border bg-card py-2.5 text-[13px] font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="tap flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Create
            </>
          )}
        </button>
      </div>
    </form>
  )
}
