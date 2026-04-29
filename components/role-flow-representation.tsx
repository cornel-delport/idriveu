import Link from 'next/link'
import { Car, User, Shield, ChevronRight, LogIn, CheckSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlowStep {
  id: string
  label: string
  sub?: string
  icon: React.ReactNode
  accent?: string
}

const steps: FlowStep[] = [
  {
    id: 'login',
    label: 'User logs in',
    sub: 'Email/password or Google',
    icon: <LogIn className="h-5 w-5" />,
    accent: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'check',
    label: 'Role is checked',
    sub: 'Fetched from NextAuth JWT',
    icon: <CheckSquare className="h-5 w-5" />,
    accent: 'bg-muted/40 text-foreground border-border',
  },
]

const destinations: { label: string; sub: string; href: string; icon: React.ReactNode; accent: string }[] = [
  {
    label: 'Driver',
    sub: '→ /driver/jobs',
    href: '/driver/jobs',
    icon: <Car className="h-5 w-5" />,
    accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  },
  {
    label: 'Customer',
    sub: '→ /home',
    href: '/home',
    icon: <User className="h-5 w-5" />,
    accent: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    label: 'Admin',
    sub: '→ /home + Manage Users',
    href: '/home',
    icon: <Shield className="h-5 w-5" />,
    accent: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
  },
]

function FlowCard({ label, sub, icon, accent }: { label: string; sub?: string; icon: React.ReactNode; accent?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-[14px] font-semibold',
        accent ?? 'bg-card border-border text-foreground',
      )}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-background/50">
        {icon}
      </span>
      <div>
        <p>{label}</p>
        {sub && <p className="text-[11px] font-normal opacity-70">{sub}</p>}
      </div>
    </div>
  )
}

export function RoleFlowRepresentation() {
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-8">
      <h2 className="mb-2 text-center text-[20px] font-bold leading-tight tracking-tight text-foreground">
        Role-Based Login Flow
      </h2>
      <p className="mb-4 text-center text-[13px] text-muted-foreground">
        How iDriveU routes users after sign-in
      </p>

      {/* Login + role check */}
      <div className="w-full max-w-sm">
        {steps.map((step, i) => (
          <div key={step.id}>
            <FlowCard label={step.label} sub={step.sub} icon={step.icon} accent={step.accent} />
            {i < steps.length - 1 && (
              <div className="my-1 flex justify-center">
                <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Branch label */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <div className="h-px w-8 bg-border" />
        <span>role determines destination</span>
        <div className="h-px w-8 bg-border" />
      </div>

      {/* Destinations */}
      <div className="grid w-full max-w-sm grid-cols-1 gap-2">
        {destinations.map((dest) => (
          <Link key={dest.label} href={dest.href} className="transition hover:opacity-80">
            <FlowCard label={dest.label} sub={dest.sub} icon={dest.icon} accent={dest.accent} />
          </Link>
        ))}
      </div>

      {/* Admin extra step */}
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <div className="h-px w-8 bg-border" />
        <span>admin-only action</span>
        <div className="h-px w-8 bg-border" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-1 flex justify-center">
          <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
        </div>
        <FlowCard
          label="Manage Users"
          sub="Admin clicks → /admin/users"
          icon={<Users className="h-5 w-5" />}
          accent="bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400"
        />
        <div className="mt-2 flex justify-center">
          <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
        </div>
        <div className="mt-2">
          <FlowCard
            label="User list with role controls"
            sub="Update role · Save · Audit logged"
            icon={<Shield className="h-5 w-5" />}
            accent="bg-card text-foreground border-border"
          />
        </div>
      </div>
    </div>
  )
}
