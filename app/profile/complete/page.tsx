'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

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
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5">
      <BrandLogo size="md" />
      <div className="mt-8 w-full max-w-sm">
        <h1 className="text-[24px] font-semibold tracking-tight">One more thing</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          We need your mobile number to send WhatsApp booking confirmations.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            type="tel"
            inputMode="tel"
            placeholder="+27 82 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 text-base"
            required
          />
          <Button
            type="submit"
            disabled={loading || !phone.trim()}
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            {loading ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </div>
    </main>
  )
}
