"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Account created — welcome aboard!")
      router.push("/dashboard")
    }, 600)
  }

  return (
    <AuthShell
      subtitle="Create account"
      title="Your trusted Plett driver, one tap away."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstname">First name</Label>
            <Input id="firstname" required placeholder="Thandi" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastname">Last name</Label>
            <Input id="lastname" required placeholder="Mokoena" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Mobile number</Label>
          <Input id="phone" type="tel" required placeholder="+27 82 ..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required placeholder="Minimum 8 characters" />
        </div>
        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            terms & safety
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  )
}
