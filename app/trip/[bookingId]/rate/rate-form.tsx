"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitRating } from "@/actions/posttrip"
import { RatingStars } from "@/components/trip/rating-stars"
import {
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { IconButton, IconTextarea } from "@/components/ui-icon"

const FEEDBACK_TAGS = [
  "Punctual",
  "Friendly",
  "Safe driving",
  "Clean vehicle",
  "Professional",
  "Great route",
  "Went above & beyond",
]

interface RateFormProps {
  bookingId: string
  driverName: string
  reference: string
  pickup: string
  dropoff: string
}

export function RateForm({
  bookingId,
  driverName,
  reference,
  pickup,
  dropoff,
}: RateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [done, setDone] = useState(false)

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function handleSubmit() {
    if (rating === 0) return
    startTransition(async () => {
      const result = await submitRating(bookingId, rating, comment.trim() || undefined, tags)
      if ("error" in result) {
        alert(result.error)
        return
      }
      setDone(true)
      setTimeout(() => router.push(`/trip/${bookingId}/tip`), 1200)
    })
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-[22px] font-semibold tracking-tight">Thanks for your rating!</h2>
        <p className="text-[14px] text-muted-foreground">Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Trip summary card */}
      <div className="rounded-3xl border border-border bg-secondary p-4">
        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <MapPin className="h-3 w-3" /> {reference}
        </p>
        <div className="mt-2 flex items-start gap-3">
          <div className="mt-1 flex flex-col items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-6 w-px bg-border" />
            <span className="h-2 w-2 rounded-full bg-accent" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="truncate text-[13px] font-medium text-foreground">{pickup}</p>
            <p className="truncate text-[13px] text-muted-foreground">{dropoff}</p>
          </div>
        </div>
      </div>

      {/* Stars — premium dark card */}
      <div className="card-dark flex flex-col items-center gap-3 rounded-3xl px-6 py-7">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-glow">
          How was {driverName}?
        </p>
        <RatingStars value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-[13px] font-semibold text-white">
            {["", "Poor", "Below average", "Average", "Good", "Excellent!"][rating]}
          </p>
        )}
      </div>

      {/* Tags */}
      {rating >= 4 && (
        <div>
          <p className="mb-3 text-[13px] font-medium text-muted-foreground">
            What stood out? (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={cn(
                  "tap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                  tags.includes(t)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment */}
      <IconTextarea
        icon={MessageSquare}
        label="Leave a comment (optional)"
        rows={3}
        placeholder="Tell us about your experience…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Submit */}
      <IconButton
        icon={CheckCircle2}
        iconRight={ArrowRight}
        variant="glow"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        disabled={rating === 0}
        loading={isPending}
        loadingLabel="Submitting…"
      >
        Submit rating
      </IconButton>

      <IconButton
        icon={ChevronRight}
        variant="ghost"
        size="sm"
        href={`/trip/${bookingId}/tip`}
        className="self-center"
      >
        Skip rating
      </IconButton>
    </div>
  )
}
