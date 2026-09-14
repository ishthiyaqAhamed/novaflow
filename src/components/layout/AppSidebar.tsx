"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Kanban,
  Users,
  Building2,
  CheckSquare,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { SessionUser } from "@/lib/session"
import { logout } from "@/app/(auth)/login/actions"

interface AppSidebarProps {
  user: SessionUser | null
  activeDealsCount?: number
  pendingTasksCount?: number
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deals", label: "Deals & Pipeline", icon: Kanban, badgeKey: "deals" },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, badgeKey: "tasks" },
  { href: "/activities", label: "Activity Log", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppSidebar({ user, activeDealsCount = 0, pendingTasksCount = 0 }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-paper flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Brand & Workspace */}
      <div>
        <div className="h-16 border-b border-border px-5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-base shadow-xs">
              N
            </span>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-ink tracking-tight">NovaFlow</span>
              <span className="text-[10px] text-muted font-mono font-medium -mt-1">WORKSPACE</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            const badgeCount = item.badgeKey === "deals" ? activeDealsCount : item.badgeKey === "tasks" ? pendingTasksCount : 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-ink text-paper shadow-xs font-semibold"
                    : "text-muted hover:text-ink hover:bg-ink/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted"}`} />
                  <span>{item.label}</span>
                </div>

                {badgeCount > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-accent text-paper" : "bg-ink/5 text-muted"
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}

          {user?.role === "ADMIN" && (
            <div className="pt-3 mt-3 border-t border-border/60">
              <Link
                href="/admin"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Admin Portal</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-border bg-ink/[0.01]">
        <div className="p-2.5 rounded-xl border border-border/80 bg-paper flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name?.slice(0, 1) || "U"}
              </div>
            )}
            <div className="min-w-0 flex-grow">
              <div className="text-xs font-semibold text-ink truncate">{user?.name || "User"}</div>
              <div className="text-[10px] text-muted truncate">{user?.title || user?.role || "Member"}</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-muted hover:text-alert hover:bg-alert/5 rounded-lg transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
