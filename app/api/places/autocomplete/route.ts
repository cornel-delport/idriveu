import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

// Plettenberg Bay centre
const CENTRE_LAT = -34.0527
const CENTRE_LNG = 23.3716
const RADIUS_M = 80_000

export interface AutocompleteResult {
  placeId: string
  mainText: string
  secondaryText: string
  fullText: string
}

async function fetchNew(input: string, lang: string): Promise<AutocompleteResult[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "Content-Type": "application/json",
      "Accept-Language": lang,
    },
    body: JSON.stringify({
      input,
      includedRegionCodes: ["za"],
      locationBias: {
        circle: {
          center: { latitude: CENTRE_LAT, longitude: CENTRE_LNG },
          radius: RADIUS_M,
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Places API (New) autocomplete returned ${res.status}`)
  }

  const data = await res.json()

  if (!Array.isArray(data.suggestions)) {
    throw new Error("Places API (New) autocomplete: unexpected response shape")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.suggestions as any[])
    .filter((s) => s.placePrediction != null)
    .map((s) => {
      const p = s.placePrediction
      return {
        placeId: p.placeId ?? "",
        mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondaryText: p.structuredFormat?.secondaryText?.text ?? "",
        fullText: p.text?.text ?? "",
      }
    })
}

async function fetchLegacy(input: string, lang: string): Promise<AutocompleteResult[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json")
  url.searchParams.set("input", input)
  url.searchParams.set("key", API_KEY)
  url.searchParams.set("components", "country:za")
  url.searchParams.set("location", `${CENTRE_LAT},${CENTRE_LNG}`)
  url.searchParams.set("radius", String(RADIUS_M))
  url.searchParams.set("language", lang)

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new Error(`Places API (Legacy) autocomplete returned ${res.status}`)
  }

  const data = await res.json()

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Places API (Legacy) autocomplete status: ${data.status}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.predictions ?? []).map((p: any) => ({
    placeId: p.place_id ?? "",
    mainText: p.structured_formatting?.main_text ?? p.description ?? "",
    secondaryText: p.structured_formatting?.secondary_text ?? "",
    fullText: p.description ?? "",
  }))
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? ""
  const lang = req.nextUrl.searchParams.get("lang") ?? "en"

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Try Places API (New) first, fall back to Legacy
  let results: AutocompleteResult[] | null = null
  let newError: unknown = null

  try {
    results = await fetchNew(q, lang)
  } catch (err) {
    newError = err
    if (process.env.NODE_ENV !== "production") {
      console.warn("[/api/places/autocomplete] Places API (New) failed, trying legacy:", err)
    }
  }

  if (results === null) {
    try {
      results = await fetchLegacy(q, lang)
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "[/api/places/autocomplete] Both APIs failed.",
          "New error:", newError,
          "Legacy error:", err,
        )
      }
      return NextResponse.json({ results: [] })
    }
  }

  return NextResponse.json({ results })
}
