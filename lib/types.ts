import type { ServiceId } from "./services"

export type BookingStatus =
  | "draft"
  | "pending_payment"
  | "payment_received"
  | "confirmed"
  | "driver_assigned"
  | "driver_on_the_way"
  | "arrived"
  | "passenger_collected"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refund_requested"
  | "refunded"

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "refund_requested"
  | "cash_requested"
  | "eft_requested"
  | "admin_confirmed"

export type UserRole = "customer" | "driver" | "admin" | "super_admin"

export interface LatLng {
  lat: number
  lng: number
}

export interface Location {
  address: string
  lat?: number
  lng?: number
  note?: string
}

export interface Booking {
  id: string
  reference: string
  customerId: string
  customerName: string
  customerPhone?: string
  driverId?: string
  driverName?: string
  serviceId: ServiceId
  pickup: Location
  dropoff: Location
  stops: Location[]
  dateTime: string // ISO
  returnTrip: boolean
  returnDateTime?: string
  passengerCount: number
  usesCustomerVehicle: boolean
  requiresFemaleDriver: boolean
  childPickup: boolean
  childDetails?: {
    childName: string
    school: string
    authorisedAdult: string
    emergencyContact: string
    instructions?: string
  }
  distanceKm: number
  durationMinutes: number
  estimatedPrice: number
  finalPrice?: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: string
}

export interface PricingRules {
  baseFee: number
  perKm: number
  nightSurcharge: number
  waitingPerMin: number
  airportFixed: Record<"george" | "gqeberha" | "cape_town", number>
  childPickupFixed: number
  wineHalfDay: number
  wineFullDay: number
}
