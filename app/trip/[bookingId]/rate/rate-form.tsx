"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { submitRating } from "@/actions/posttrip"
import { RatingStars } from "@/components/trip/rating-stars"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
      {/* Trip summary */}
      <div className="rounded-3xl bg-secondary p-4">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          {reference}
        </p>
        <p className="mt-1 text-[14px] font-medium text-foreground">{pickup}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">→ {dropoff}</p>
      </div>

      {/* Stars */}
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          How was {driverName}?
        </p>
        <RatingStars value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-[13px] font-medium text-primary">
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
      <div>
        <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
          Leave a comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Tell us about your experience…"
          className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating === 0 || isPending}
        className={cn(
          "tap flex h-14 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition-opacity",
          rating > 0
            ? "bg-primary text-primary-foreground"
            : "cursor-not-allowed bg-muted text-muted-foreground opacity-60",
          isPending && "opacity-60",
        )}
      >
        {isPending ? "Submitting…" : "Submit rating"}
      </button>

      <Link
        href={`/trip/${bookingId}/tip`}
        className="text-center text-[13px] text-muted-foreground underline-offset-4 hover:underline"
      >
        Skip rating
      </Link>
    </div>
  )
}
