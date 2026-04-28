"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Search,
  Filter,
  Users as UsersIcon,
  UserCheck,
  UserX,
  ArrowUpCircle,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  suspendUser,
  reactivateUser,
  upgradeToDriver,
  changeUserRole,
} from "@/actions/admin"
import { IconInput, IconSelect } from "@/components/ui-icon"

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "customer" | "driver" | "admin" | "super_admin"

export interface UserRow {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  status: string
  createdAt: string
  driverProfile: {
    driverStatus: string
    rating: number
    totalTrips: number
  } | null
}

interface Props {
  users: UserRow[]
  /** Whether the current admin is super_admin (controls super_admin role option) */
  isSuperAdmin: boolean
  /** Current admin user id — used to disable self-edit */
  currentUserId: string
}

// ─── Component ────────────────────────────────────────────────────────────────
export function UsersClient({ users, isSuperAdmin, currentUserId }: Props) {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all")
  const [pendingId, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (statusFilter !== "all" && u.status !== statusFilter) return false
      if (!q) return true
      return (
        u.email.toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
      )
    })
  }, [users, query, roleFilter, statusFilter])

  function runAction(id: string, fn: () => Promise<{ ok: true } | { error: string }>) {
    setActiveId(id)
    startTransition(async () => {
      try {
        const r = await fn()
        if ("error" in r) toast.error(r.error)
        else toast.success("Done")
      } finally {
        setActiveId(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-2">
        <IconInput
          icon={Search}
          label="Search"
          placeholder="Name, email or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <IconSelect
            icon={Filter}
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
          >
            <option value="all">All roles</option>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
            {isSuperAdmin && <option value="super_admin">Super admin</option>}
          </IconSelect>
          <IconSelect
            icon={UsersIcon}
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "suspended")
            }
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </IconSelect>
        </div>
      </div>

      <p className="px-1 text-[12px] text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
        of {users.length}
      </p>

      {/* List */}
      <ul className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-[13px] text-muted-foreground">
            No users match your filters.
          </li>
        ) : (
          filtered.map((u) => {
            const isSelf = u.id === currentUserId
            const isActive = u.status === "active"
            const busy = activeId === u.id && pendingId
            return (
              <li
                key={u.id}
                className={cn(
                  "rounded-2xl border border-border bg-card p-4 transition-opacity",
                  busy && "opacity-60",
                )}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-foreground">
                      {u.name ?? "—"}{" "}
                      {isSelf && (
                        <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          You
                        </span>
                      )}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">{u.email}</p>
                    {u.phone && (
                      <p className="truncate text-[12px] text-muted-foreground">{u.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <RoleBadge role={u.role} />
                    <StatusBadge status={u.status} />
                  </div>
                </div>

                {/* Driver info */}
                {u.driverProfile && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary px-3 py-2 text-[12px]">
                    <span className="font-medium text-foreground">
                      Driver: <StatusBadge status={u.driverProfile.driverStatus} />
                    </span>
                    <span className="text-muted-foreground">
                      ⭐ {u.driverProfile.rating.toFixed(1)} ·{" "}
                      {u.driverProfile.totalTrips} trips
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* Role change dropdown */}
                  <RoleChanger
                    currentRole={u.role}
                    isSuperAdmin={isSuperAdmin}
                    disabled={isSelf || !!busy}
                    onChange={(newRole) =>
                      runAction(u.id, () => changeUserRole(u.id, newRole))
                    }
                  />

                  {isActive ? (
                    <ActionPill
                      icon={UserX}
                      tone="danger"
                      disabled={isSelf || !!busy}
                      onClick={() =>
                        runAction(u.id, () => suspendUser(u.id, "Suspended via admin UI"))
                      }
                    >
                      Suspend
                    </ActionPill>
                  ) : (
                    <ActionPill
                      icon={UserCheck}
                      tone="success"
                      disabled={!!busy}
                      onClick={() => runAction(u.id, () => reactivateUser(u.id))}
                    >
                      Reactivate
                    </ActionPill>
                  )}

                  {u.role === "customer" && (
                    <ActionPill
                      icon={ArrowUpCircle}
                      tone="default"
                      disabled={!!busy}
                      onClick={() => runAction(u.id, () => upgradeToDriver(u.id))}
                    >
                      Make driver
                    </ActionPill>
                  )}
                </div>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    customer: "bg-primary/10 text-primary",
    driver: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    admin: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    super_admin: "bg-red-500/10 text-red-600 dark:text-red-400",
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        map[role] ?? "bg-muted text-muted-foreground",
      )}
    >
      {role.replace("_", " ")}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    suspended: "bg-destructive/10 text-destructive",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-destructive/10 text-destructive",
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  )
}

function ActionPill({
  icon: Icon,
  children,
  onClick,
  disabled,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: "default" | "danger" | "success"
}) {
  const cls = {
    default: "border-border bg-secondary text-foreground hover:bg-muted",
    danger:
      "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400",
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "tap inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50",
        cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  )
}

function RoleChanger({
  currentRole,
  isSuperAdmin,
  onChange,
  disabled,
}: {
  currentRole: string
  isSuperAdmin: boolean
  onChange: (newRole: Role) => void
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        "tap inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-1 text-[12px] font-semibold transition-colors hover:bg-secondary",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <span className="text-muted-foreground">Role</span>
      <select
        value={currentRole}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value as Role
          if (v !== currentRole) onChange(v)
        }}
        className="cursor-pointer appearance-none bg-transparent pr-1 font-semibold text-foreground outline-none"
      >
        <option value="customer">Customer</option>
        <option value="driver">Driver</option>
        <option value="admin">Admin</option>
        {isSuperAdmin && <option value="super_admin">Super admin</option>}
      </select>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </label>
  )
}
