import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

interface DetailsResult {
  lat: number
  lng: number
  address: string
}

async function fetchNew(placeId: string): Promise<DetailsResult> {
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?key=${API_KEY}`
  const res = await fetch(url, {
    headers: {
      "X-Goog-Field-Mask": "location,formattedAddress",
    },
  })

  if (!res.ok) {
    throw new Error(`Places API (New) details returned ${res.status}`)
  }

  const data = await res.json()

  if (!data.location) {
    throw new Error("Places API (New) details: missing location in response")
  }

  return {
    lat: data.location.latitude,
    lng: data.location.longitude,
    address: data.formattedAddress ?? "",
  }
}

async function fetchLegacy(placeId: string): Promise<DetailsResult> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json")
  url.searchParams.set("place_id", placeId)
  url.searchParams.set("fields", "geometry,formatted_address")
  url.searchParams.set("key", API_KEY)

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new Error(`Places API (Legacy) details returned ${res.status}`)
  }

  const data = await res.json()

  if (data.status !== "OK") {
    throw new Error(`Places API (Legacy) details status: ${data.status}`)
  }

  const loc = data.result?.geometry?.location
  if (!loc) {
    throw new Error("Places API (Legacy) details: missing geometry.location in response")
  }

  return {
    lat: loc.lat,
    lng: loc.lng,
    address: data.result?.formatted_address ?? "",
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? ""

  if (!id.trim()) {
    return NextResponse.json({ error: "Missing place id" }, { status: 400 })
  }

  let result: DetailsResult | null = null
  let newError: unknown = null

  try {
    result = await fetchNew(id)
  } catch (err) {
    newError = err
    if (process.env.NODE_ENV !== "production") {
      console.warn("[/api/places/details] Places API (New) failed, trying legacy:", err)
    }
  }

  if (result === null) {
    try {
      result = await fetchLegacy(id)
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "[/api/places/details] Both APIs failed.",
          "New error:", newError,
          "Legacy error:", err,
        )
      }
      return NextResponse.json({ error: "Could not fetch place details" }, { status: 404 })
    }
  }

  return NextResponse.json(result)
}
