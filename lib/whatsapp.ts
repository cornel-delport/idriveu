// lib/whatsapp.ts — STUB, will be implemented in Phase 5
export type WhatsAppTemplate =
  | 'BOOKING_CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ON_THE_WAY'
  | 'DRIVER_ARRIVED'
  | 'TRIP_COMPLETED'
  | 'CHILD_PICKUP_ALERT'
  | 'CHILD_DROPOFF_ALERT'
  | 'REFUND_REQUESTED'
  | 'REFUND_COMPLETED'
  | 'BOOKING_CANCELLED'
  | 'NEW_JOB_AVAILABLE'
  | 'JOB_CLAIMED_BY_OTHER'

export async function sendWhatsApp(
  _to: string,
  _template: WhatsAppTemplate,
  _vars: Record<string, string>,
  _bookingId?: string
): Promise<void> {
  // Stub — implemented in Phase 5
  console.log(`[WhatsApp stub] ${_template} to ${_to}`)
}
