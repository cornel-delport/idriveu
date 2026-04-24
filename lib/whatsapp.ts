import twilio from 'twilio'
import { db } from '@/lib/db'

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

const TEMPLATES: Record<WhatsAppTemplate, (vars: Record<string, string>) => string> = {
  BOOKING_CONFIRMED: (v) =>
    `Hi ${v.name}, your IDriveU booking ${v.ref} is confirmed for ${v.date} at ${v.time}. A driver will be assigned shortly.`,
  DRIVER_ASSIGNED: (v) =>
    `Your driver ${v.driverName} has been assigned for ${v.ref}. They will contact you before pickup.`,
  DRIVER_ON_THE_WAY: (v) =>
    `🚗 ${v.driverName} is on the way to ${v.pickup}.`,
  DRIVER_ARRIVED: (v) =>
    `✅ Your driver has arrived at ${v.pickup}.`,
  TRIP_COMPLETED: (v) =>
    `Trip ${v.ref} completed. Total: R${v.amount}. Rate your driver: ${v.link}`,
  CHILD_PICKUP_ALERT: (v) =>
    `✅ ${v.childName} has been collected from ${v.school} and is on the way home.`,
  CHILD_DROPOFF_ALERT: (v) =>
    `✅ ${v.childName} has been dropped off safely at ${v.address}.`,
  REFUND_REQUESTED: (v) =>
    `Your refund for ${v.ref} is being processed by our team.`,
  REFUND_COMPLETED: (v) =>
    `✅ Your refund for ${v.ref} has been processed.`,
  BOOKING_CANCELLED: (v) =>
    `Your booking ${v.ref} has been cancelled.`,
  NEW_JOB_AVAILABLE: (v) =>
    `🔔 New IDriveU job — ${v.service} on ${v.date} at ${v.time} from ${v.pickup}. Est. R${v.price}. Open app to claim.`,
  JOB_CLAIMED_BY_OTHER: (v) =>
    `Job ${v.ref} has been claimed by another driver.`,
}

export async function sendWhatsApp(
  to: string,
  template: WhatsAppTemplate,
  vars: Record<string, string>,
  bookingId?: string
): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM

  if (!sid || !token || !from) {
    console.warn('[WhatsApp] Missing Twilio credentials — skipping send')
    return
  }

  const body = TEMPLATES[template](vars)
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

  let twilioSid: string | undefined

  try {
    const client = twilio(sid, token)
    const message = await client.messages.create({
      from,
      to: toFormatted,
      body,
    })
    twilioSid = message.sid
  } catch (err) {
    console.error('[WhatsApp] Send failed:', err)
    // Non-blocking — don't rethrow
  }

  // Log to DB (non-blocking — don't await failure)
  if (bookingId) {
    db.whatsAppLog.create({
      data: { bookingId, to: toFormatted, body, sid: twilioSid },
    }).catch((err) => console.error('[WhatsApp] Log failed:', err))
  }
}
