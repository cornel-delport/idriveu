import type { PricingRules } from "./types"
import type { ServiceId } from "./services"

export const defaultPricing: PricingRules = {
  baseFee: 120,
  perKm: 14,
  nightSurcharge: 80,
  waitingPerMin: 3,
  airportFixed: {
    george: 650,
    gqeberha: 1950,
    cape_town: 4200,
  },
  childPickupFixed: 220,
  wineHalfDay: 950,
  wineFullDay: 1750,
}

export interface EstimateInput {
  serviceId: ServiceId
  distanceKm: number
  durationMinutes: number
  isNight?: boolean
  waitingMinutes?: number
}

export function estimatePrice(
  input: EstimateInput,
  rules: PricingRules = defaultPricing,
): number {
  const { serviceId, distanceKm, isNight, waitingMinutes = 0 } = input

  if (serviceId === "wine-farm") {
    return rules.wineHalfDay + waitingMinutes * rules.waitingPerMin
  }

  if (serviceId === "child-pickup") {
    return rules.childPickupFixed + Math.max(0, distanceKm - 10) * rules.perKm
  }

  if (serviceId === "airport") {
    // Default to George pricing; admin can refine per leg
    return rules.airportFixed.george
  }

  const base =
    rules.baseFee +
    distanceKm * rules.perKm +
    (isNight ? rules.nightSurcharge : 0) +
    waitingMinutes * rules.waitingPerMin

  return Math.round(base)
}

export function formatZAR(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount)
}
