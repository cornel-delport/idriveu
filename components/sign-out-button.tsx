'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="mt-6 h-12 w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  )
}
