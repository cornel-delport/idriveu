export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { MobileShell } from '@/components/mobile-shell'
import { BottomNav, BottomNavSpacer } from '@/components/bottom-nav'
import { HomeClient } from './home-client'

export const metadata = {
  title: 'Home — iDriveU',
}

export default async function HomePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role ?? 'customer'
  const name = session.user.name

  return (
    <MobileShell>
      <main className="flex flex-col pb-4">
        <HomeClient role={role} name={name ?? ''} />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
