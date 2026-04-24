'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import {
  confirmPayment,
  triggerRefund,
  markRefundComplete,
  assignDriverOverride,
} from '@/actions/bookings'

interface AdminActionsProps {
  bookingId: string
  status: string
  paymentStatus: string
  driverId: string | null
  drivers: Array<{ id: string; name: string | null }>
}

export function AdminActions({
  bookingId,
  status,
  paymentStatus,
  driverId,
  drivers,
}: AdminActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedDriver, setSelectedDriver] = useState(driverId ?? '')

  const canConfirmPayment = ['pending', 'cash_requested', 'eft_requested'].includes(paymentStatus)
  const canTriggerRefund = status === 'completed'
  const canMarkRefundDone = status === 'refund_requested'

  function handleConfirmPayment(method: 'cash' | 'eft') {
    startTransition(async () => {
      const result = await confirmPayment(bookingId, method)
      if ('error' in result) toast.error(result.error)
      else toast.success(`Payment confirmed (${method})`)
    })
  }

  function handleTriggerRefund() {
    startTransition(async () => {
      const result = await triggerRefund(bookingId)
      if ('error' in result) toast.error(result.error)
      else toast.success('Refund triggered')
    })
  }

  function handleMarkRefundDone() {
    startTransition(async () => {
      const result = await markRefundComplete(bookingId)
      if ('error' in result) toast.error(result.error)
      else toast.success('Refund marked complete')
    })
  }

  function handleAssignDriver(dId: string) {
    setSelectedDriver(dId)
    if (!dId) return
    startTransition(async () => {
      const result = await assignDriverOverride(bookingId, dId)
      if ('error' in result) toast.error(result.error)
      else toast.success('Driver assigned')
    })
  }

  if (!canConfirmPayment && !canTriggerRefund && !canMarkRefundDone && drivers.length === 0) {
    return null
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {/* Assign driver */}
      {drivers.length > 0 && (
        <select
          value={selectedDriver}
          onChange={(e) => handleAssignDriver(e.target.value)}
          disabled={isPending}
          className="h-8 rounded-xl border border-border bg-secondary px-2 text-[11px] font-medium text-foreground outline-none disabled:opacity-60"
        >
          <option value="">Assign driver…</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name ?? d.id}
            </option>
          ))}
        </select>
      )}

      {/* Confirm Payment */}
      {canConfirmPayment && (
        <>
          <button
            onClick={() => handleConfirmPayment('cash')}
            disabled={isPending}
            className="tap inline-flex h-8 items-center rounded-xl bg-primary px-3 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            Confirm Cash
          </button>
          <button
            onClick={() => handleConfirmPayment('eft')}
            disabled={isPending}
            className="tap inline-flex h-8 items-center rounded-xl bg-primary/80 px-3 text-[11px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            Confirm EFT
          </button>
        </>
      )}

      {/* Trigger refund */}
      {canTriggerRefund && (
        <button
          onClick={handleTriggerRefund}
          disabled={isPending}
          className="tap inline-flex h-8 items-center rounded-xl bg-destructive px-3 text-[11px] font-semibold text-destructive-foreground disabled:opacity-60"
        >
          Trigger Refund
        </button>
      )}

      {/* Mark refund done */}
      {canMarkRefundDone && (
        <button
          onClick={handleMarkRefundDone}
          disabled={isPending}
          className="tap inline-flex h-8 items-center rounded-xl bg-secondary px-3 text-[11px] font-semibold ring-1 ring-border disabled:opacity-60"
        >
          Mark Refund Done
        </button>
      )}
    </div>
  )
}
