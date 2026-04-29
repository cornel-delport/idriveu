import { defaultPricing, estimatePrice } from "./pricing"

/**
 * Haversine distance in km between two lat/lng coordinates.
 * Used for QR pickup quick-quotes when no live Directions response is
 * available yet.
 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export interface QrPriceInput {
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
  /** Date object representing the *intended* pickup time */
  pickupAt: Date
  /** If true, the call-out base fee is waived (partner restaurants) */
  waiveCallOutFee?: boolean
}

export interface QrPriceResult {
  distanceKm: number
  durationMinutes: number
  isNight: boolean
  estimatedPrice: number
  breakdown: {
    baseFee: number
    perKmTotal: number
    nightSurcharge: number
    callOutWaived: boolean
  }
}

/**
 * QR-pickup pricing — straight-line distance × 1.3 road factor + IDriveU
 * standard rates. Cheap to compute, runs in the API route on every keystroke.
 */
export function quoteQrPickup(input: QrPriceInput): QrPriceResult {
  const straight = haversineKm(
    { lat: input.pickupLat, lng: input.pickupLng },
    { lat: input.dropoffLat, lng: input.dropoffLng },
  )
  const distanceKm = Math.max(0.5, straight * 1.3)
  const durationMinutes = Math.max(5, Math.round(distanceKm * 2))

  const hour = input.pickupAt.getHours()
  const isNight = hour >= 21 || hour < 6

  let price = estimatePrice({
    serviceId: "drive-me-home",
    distanceKm,
    durationMinutes,
    isNight,
  })

  if (input.waiveCallOutFee) {
    price = Math.max(0, price - defaultPricing.baseFee)
  }

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMinutes,
    isNight,
    estimatedPrice: Math.round(price),
    breakdown: {
      baseFee: input.waiveCallOutFee ? 0 : defaultPricing.baseFee,
      perKmTotal: Math.round(distanceKm * defaultPricing.perKm),
      nightSurcharge: isNight ? defaultPricing.nightSurcharge : 0,
      callOutWaived: !!input.waiveCallOutFee,
    },
  }
}
