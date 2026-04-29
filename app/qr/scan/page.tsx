import { QrScanner } from "@/components/restaurant/qr-scanner"

export const metadata = {
  title: "Scan restaurant QR — IDriveU",
  description: "Point your camera at the QR code on your restaurant table.",
}

/**
 * /qr/scan
 * Full-screen camera scanner. No top bar, no chrome — pure scanner UX.
 */
export default function ScanQrPage() {
  return <QrScanner />
}
