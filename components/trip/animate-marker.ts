/**
 * Smoothly animates a LatLng value from `from` to `to` over `durationMs` milliseconds.
 * Calls `onUpdate` on each animation frame with the interpolated position.
 * Returns a cancel function.
 */
export function animateLatLng(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  durationMs: number,
  onUpdate: (pos: { lat: number; lng: number }) => void,
): () => void {
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const t = Math.min(elapsed / durationMs, 1)
    // Ease in-out cubic
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    onUpdate({
      lat: from.lat + (to.lat - from.lat) * eased,
      lng: from.lng + (to.lng - from.lng) * eased,
    })

    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    }
  }

  let rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}
