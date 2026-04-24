import {
  Moon,
  Wine,
  Plane,
  Utensils,
  Car,
  Package,
  Baby,
  MapPin,
  type LucideIcon,
} from "lucide-react"

export type ServiceId =
  | "drive-me-home"
  | "wine-farm"
  | "airport"
  | "event-pickup"
  | "vehicle-collection"
  | "parcel"
  | "child-pickup"
  | "tourist"

export interface Service {
  id: ServiceId
  name: string
  shortName: string
  tagline: string
  description: string
  longDescription: string
  icon: LucideIcon
  fromPrice: number // ZAR
  priceLabel: string
  badge?: string
  features: string[]
}

export const services: Service[] = [
  {
    id: "drive-me-home",
    name: "Drive Me Home",
    shortName: "Drive Home",
    tagline: "Enjoy your night. We get you home.",
    description:
      "After dinner, drinks, a wedding or a braai — John drives you home safely in your own car.",
    longDescription:
      "Had a glass of wine too many? Don't risk it. Call John from the restaurant, pub, wedding or event and he'll meet you there and drive you home in your own vehicle. Safe, discreet, and local to Plett.",
    icon: Moon,
    fromPrice: 250,
    priceLabel: "from R250",
    badge: "Most booked",
    features: [
      "Driver meets you at the venue",
      "Drives you home in your own car",
      "Available late nights and weekends",
      "Fixed, upfront quote",
    ],
  },
  {
    id: "wine-farm",
    name: "Wine Farm Driver",
    shortName: "Wine Farm",
    tagline: "Taste freely. We'll do the driving.",
    description:
      "Spend the day at the wine farms — John drives, waits, and takes you home safely.",
    longDescription:
      "A dedicated driver for your wine tasting day around Plett, Knysna and the Garden Route. Half-day and full-day options, with patient waiting time included.",
    icon: Wine,
    fromPrice: 950,
    priceLabel: "from R950",
    features: [
      "Half-day or full-day bookings",
      "Waiting time included",
      "Multiple farm stops",
      "Uses your own vehicle",
    ],
  },
  {
    id: "airport",
    name: "Airport Transfer",
    shortName: "Airport",
    tagline: "On time to George, PE or Cape Town.",
    description:
      "Reliable transfers to and from George, Gqeberha and Cape Town airports.",
    longDescription:
      "Pre-booked transfers with flight tracking. Travel in your own car or arrange a vehicle. Fixed pricing, no surprises.",
    icon: Plane,
    fromPrice: 650,
    priceLabel: "from R650",
    features: [
      "George, Gqeberha and Cape Town",
      "Flight tracking",
      "Fixed airport pricing",
      "Luggage assistance",
    ],
  },
  {
    id: "event-pickup",
    name: "Event Pickup",
    shortName: "Event",
    tagline: "From restaurant, club or function.",
    description:
      "Scheduled pickup from restaurants, clubs, weddings and private events.",
    longDescription:
      "Book a pickup time in advance and know there's a trusted driver waiting when the night ends.",
    icon: Utensils,
    fromPrice: 220,
    priceLabel: "from R220",
    features: [
      "Scheduled pickup window",
      "SMS & WhatsApp updates",
      "Group bookings welcome",
      "Late night availability",
    ],
  },
  {
    id: "vehicle-collection",
    name: "Vehicle Collection",
    shortName: "Collection",
    tagline: "Your car fetched or delivered.",
    description:
      "We collect or deliver your car from service centres, airports, dealerships or home.",
    longDescription:
      "Skip the Uber back from the workshop — we fetch your car and bring it to you, or drop it off for servicing.",
    icon: Car,
    fromPrice: 300,
    priceLabel: "from R300",
    features: [
      "Service centre collection",
      "Dealership handover",
      "Airport parking returns",
      "Photo proof on handover",
    ],
  },
  {
    id: "parcel",
    name: "Parcel & Errands",
    shortName: "Parcel",
    tagline: "Documents, groceries, small parcels.",
    description:
      "Quick local pickup and dropoff of parcels, documents and groceries.",
    longDescription:
      "For busy days when you can't get to the shops, the post office or a collection point — we'll handle it.",
    icon: Package,
    fromPrice: 180,
    priceLabel: "from R180",
    features: [
      "Local Plett deliveries",
      "Documents & parcels",
      "Grocery runs",
      "Proof of delivery",
    ],
  },
  {
    id: "child-pickup",
    name: "Safe Children Pickup",
    shortName: "Kids Pickup",
    tagline: "Trusted, with an optional lady driver.",
    description:
      "Trusted pickup and dropoff for your children — female driver available.",
    longDescription:
      "Peace of mind for parents. Vetted drivers, WhatsApp updates at pickup and dropoff, and an option to request a lady driver (subject to availability).",
    icon: Baby,
    fromPrice: 220,
    priceLabel: "from R220",
    badge: "Family favourite",
    features: [
      "Female driver on request",
      "Authorised adult confirmation",
      "WhatsApp pickup & dropoff alerts",
      "School run & activities",
    ],
  },
  {
    id: "tourist",
    name: "Tourist Day Driver",
    shortName: "Tourist",
    tagline: "Plett, Knysna, Tsitsikamma & more.",
    description:
      "Private day driver for tourists exploring the Garden Route at your own pace.",
    longDescription:
      "A friendly local behind the wheel while you take in Plett, Nature's Valley, Knysna, Tsitsikamma, beaches, wine farms and restaurants.",
    icon: MapPin,
    fromPrice: 1200,
    priceLabel: "from R1 200",
    features: [
      "Full-day private driver",
      "Local recommendations",
      "Flexible itinerary",
      "English, isiZulu, Afrikaans",
    ],
  },
]

export function getService(id: string): Service | undefined {
  return services.find((s) => s.id === id)
}
