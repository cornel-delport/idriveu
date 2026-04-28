'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BrandLogo } from '@/components/brand-logo'
import { Phone, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { IconInput, IconButton } from '@/components/ui-icon'

export default function CompleteProfilePage() {
  const router = useRouter()
  const { update } = useSession()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await update({ phone })
      toast.success('Profile complete!')
      router.push('/book')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5">
      <BrandLogo size="md" />

      <div className="mt-10 w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-[24px] font-semibold tracking-tight">One more thing</h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            We use your mobile number to send WhatsApp booking confirmations and live driver
            updates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <IconInput
            icon={Phone}
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+27 82 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <IconButton
            type="submit"
            icon={Phone}
            iconRight={ArrowRight}
            variant="glow"
            size="lg"
            fullWidth
            loading={loading}
            loadingLabel="Saving…"
            disabled={!phone.trim()}
          >
            Continue
          </IconButton>
        </form>
      </div>
    </main>
  )
}
