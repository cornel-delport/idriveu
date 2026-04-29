'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Home,
  CalendarClock,
  Map as MapIcon,
  User,
  Car,
  BriefcaseBusiness,
  LayoutDashboard,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const customerItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/bookings', label: 'Bookings', icon: CalendarClock },
  { href: '/map', label: 'Map', icon: MapIcon },
  { href: '/profile', label: 'Profile', icon: User },
] as const

const driverItems = [
  { href: '/driver/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { href: '/driver', label: 'Dashboard', icon: Car },
  { href: '/driver/history', label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
] as const

const adminItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: CalendarClock },
  { href: '/driver', label: 'Drivers', icon: Car },
  { href: '/profile', label: 'Profile', icon: User },
] as const

interface BottomNavProps {
  className?: string
}

/**
 * Floating dark-glass pill nav.
 * Role-aware: shows different tabs for customer / driver / admin.
 * Active tab gets a bright-blue glowing indicator.
 */
export function BottomNav({ className }: BottomNavProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const role = session?.user?.role ?? 'customer'
  const items =
    role === 'admin' || role === 'super_admin'
      ? adminItems
      : role === 'driver'
        ? driverItems
        : customerItems

  return (
    <nav
      aria-label="Primary"
      className={cn('fixed inset-x-0 bottom-0 z-40 pointer-events-none', className)}
    >
      <div className="mx-auto flex max-w-xl justify-center px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
        <ul
          className={cn(
            'pointer-events-auto glass-dark flex w-full items-stretch justify-between',
            'rounded-full px-2 py-1.5 ring-1 ring-white/10',
            'shadow-[0_24px_60px_-20px_rgba(10,15,28,0.6)]',
          )}
        >
          {items.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    'tap relative flex flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[10.5px] font-medium',
                    active ? 'text-white' : 'text-white/55',
                  )}
                >
                  <span
                    className={cn(
                      'relative flex h-9 w-10 items-center justify-center rounded-full transition',
                      active
                        ? 'bg-[#1976D2] shadow-[0_0_0_5px_rgba(79,195,247,0.18),0_10px_22px_-8px_rgba(25,118,210,0.6)]'
                        : 'bg-transparent',
                    )}
                  >
                    <Icon
                      className="h-[18px] w-[18px]"
                      strokeWidth={active ? 2.2 : 2}
                    />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/** Spacer so scroll content doesn't hide behind the floating pill nav. */
export function BottomNavSpacer() {
  return <div aria-hidden className="h-24" />
}
