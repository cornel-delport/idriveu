/**
 * Paystack abstraction.
 * ────────────────────────────────────────────
 * The provider is encapsulated behind a small interface so we can swap
 * Stripe / Yoco later without touching call-sites.
 *
 * Required env vars:
 *   PAYSTACK_SECRET_KEY        sk_test_xxx or sk_live_xxx
 *   PAYSTACK_PUBLIC_KEY        pk_test_xxx (used client-side, optional)
 *   NEXT_PUBLIC_APP_URL        e.g. https://idriveu.app — used for callback_url
 */

const PAYSTACK_API = "https://api.paystack.co"

export interface CheckoutInput {
  /** ZAR amount in CENTS (e.g. R150 = 15000) */
  amountCents: number
  email: string
  /** Internal booking id — round-trips back via webhook metadata */
  bookingId: string
  /** Customer-facing reference (e.g. IDU-1234) */
  reference: string
  /** Where Paystack redirects the user after success */
  callbackUrl: string
  /** Free-form metadata for accounting / dispute resolution */
  metadata?: Record<string, unknown>
}

export interface CheckoutResult {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export interface PaystackProvider {
  initializeCheckout(input: CheckoutInput): Promise<CheckoutResult>
  verifyTransaction(reference: string): Promise<{
    status: "success" | "failed" | "abandoned"
    amountCents: number
    paidAt: Date | null
    customerEmail: string
    metadata: Record<string, unknown>
  }>
}

class PaystackHttpProvider implements PaystackProvider {
  private secret: string

  constructor() {
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is not set")
    }
    this.secret = secret
  }

  async initializeCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountCents,
        email: input.email,
        reference: input.reference,
        currency: "ZAR",
        callback_url: input.callbackUrl,
        metadata: {
          bookingId: input.bookingId,
          ...input.metadata,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Paystack init failed: ${res.status} ${text}`)
    }
    const json = (await res.json()) as {
      status: boolean
      data: { authorization_url: string; access_code: string; reference: string }
    }
    if (!json.status) throw new Error("Paystack init returned status=false")
    return {
      authorizationUrl: json.data.authorization_url,
      accessCode: json.data.access_code,
      reference: json.data.reference,
    }
  }

  async verifyTransaction(reference: string) {
    const res = await fetch(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${this.secret}` },
      },
    )
    if (!res.ok) {
      throw new Error(`Paystack verify failed: ${res.status}`)
    }
    const json = (await res.json()) as {
      status: boolean
      data: {
        status: string
        amount: number
        paid_at: string | null
        customer: { email: string }
        metadata: Record<string, unknown>
      }
    }
    if (!json.status) throw new Error("Paystack verify returned status=false")
    return {
      status: json.data.status as "success" | "failed" | "abandoned",
      amountCents: json.data.amount,
      paidAt: json.data.paid_at ? new Date(json.data.paid_at) : null,
      customerEmail: json.data.customer.email,
      metadata: json.data.metadata ?? {},
    }
  }
}

let _provider: PaystackProvider | null = null
export function getPaystack(): PaystackProvider {
  if (!_provider) _provider = new PaystackHttpProvider()
  return _provider
}

/**
 * For local dev when no PAYSTACK_SECRET_KEY is set: returns a mock that
 * pretends checkout succeeds and routes back to callback. Lets us build
 * the UI flow end-to-end without live keys.
 */
export function getPaystackOrMock(): PaystackProvider {
  if (process.env.PAYSTACK_SECRET_KEY) return getPaystack()
  return {
    async initializeCheckout(input) {
      const url = new URL(input.callbackUrl)
      url.searchParams.set("reference", input.reference)
      url.searchParams.set("mock", "1")
      return {
        authorizationUrl: url.toString(),
        accessCode: "mock_access_" + Math.random().toString(36).slice(2),
        reference: input.reference,
      }
    },
    async verifyTransaction(reference) {
      return {
        status: "success",
        amountCents: 0,
        paidAt: new Date(),
        customerEmail: "mock@idriveu.dev",
        metadata: { reference, mock: true },
      }
    },
  }
}

/**
 * Verify a webhook signature using HMAC-SHA512 with the secret key.
 * Paystack signs the raw body with the merchant secret key.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): Promise<boolean> {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  )
  const sigBytes = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody))
  const hex = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return hex === signature
}
