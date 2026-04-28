export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAuditLogs } from "@/actions/admin"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { SignedInAs } from "@/components/role-banner"
import {
  ShieldCheck,
  UserCog,
  Car,
  Ban,
  CheckCircle2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Audit log — IDriveU Admin",
}

const ACTION_ICON: Record<string, LucideIcon> = {
  role_change: UserCog,
  assign_driver: Car,
  approve_driver: ShieldCheck,
  suspend_user: Ban,
  reactivate_user: CheckCircle2,
}

const ACTION_TONE: Record<string, string> = {
  role_change: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  assign_driver: "bg-primary/10 text-primary",
  approve_driver: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  suspend_user: "bg-destructive/10 text-destructive",
  reactivate_user: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

export default async function AdminAuditPage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user) redirect("/login")
  if (role !== "admin" && role !== "super_admin") redirect("/")

  const result = await getAuditLogs(100)

  return (
    <MobileShell>
      <AppTopBar title="Audit log" backHref="/admin" />
      <main className="px-4 pb-6 pt-3">
        <SignedInAs
          role={role as "admin" | "super_admin"}
          name={session.user.name}
          className="mb-4"
        />

        <header className="mb-4">
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight">
            Audit log
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Last 100 admin actions — who changed what and when.
          </p>
        </header>

        {"error" in result ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
            {result.error}
          </p>
        ) : result.logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-[14px] font-semibold">No audit entries yet</p>
            <p className="text-[12px] text-muted-foreground">
              Role changes, suspensions and approvals will show up here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {result.logs.map((log) => {
              const Icon = ACTION_ICON[log.actionType] ?? ClipboardList
              const tone = ACTION_TONE[log.actionType] ?? "bg-muted text-muted-foreground"
              return (
                <li
                  key={log.id}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      tone,
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground">
                      {humaniseAction(log.actionType)}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">
                      by{" "}
                      <span className="font-medium text-foreground">
                        {log.actorName ?? log.actorUserId ?? "Unknown"}
                      </span>{" "}
                      · target{" "}
                      <span className="font-mono text-[10.5px] text-foreground">
                        {log.targetType}/{log.targetId?.slice(0, 8)}
                      </span>
                    </p>
                    {log.metadata && Object.keys(log.metadata as object).length > 0 && (
                      <pre className="mt-1.5 overflow-x-auto rounded-lg bg-secondary px-2 py-1 text-[10.5px] text-muted-foreground">
                        {JSON.stringify(log.metadata, null, 0)}
                      </pre>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function humaniseAction(action: string): string {
  return action
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}
