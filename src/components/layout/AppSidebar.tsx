"use client"

import { useState, useEffect } from "react"
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
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Brand & Workspace */}
      <div>
        <div className="h-16 border-b border-border px-5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-base shadow-xs">
              N
            </span>
            <div className="flex flex-col max-w-[170px]">
              <span className="font-display font-bold text-base text-ink tracking-tight truncate">NovaFlow</span>
              <span className="text-[10px] text-muted font-mono font-medium -mt-1 truncate uppercase">
                {user?.workspaceName || "WORKSPACE"}
              </span>
            </div>
          </Link>

          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-muted hover:text-ink hover:bg-ink/5"
            >
              <X className="h-5 w-5" />
            </button>
          )}
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
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
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

          <div className="pt-3 mt-3 border-t border-border/60">
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Admin Portal</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted hover:text-alert hover:bg-alert/5 rounded-lg transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top Sticky Navigation Bar */}
      <div className="lg:hidden sticky top-0 z-40 h-14 border-b border-border bg-paper/95 backdrop-blur-md px-4 flex items-center justify-between w-full">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-ink hover:bg-ink/5 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-sm shadow-xs">
            N
          </span>
          <span className="font-display font-bold text-sm text-ink tracking-tight">NovaFlow</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="h-7 w-7 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-xs"
          >
            {user?.name?.slice(0, 1) || "U"}
          </Link>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-paper shadow-2xl flex flex-col justify-between z-50 h-full">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-paper flex-col justify-between shrink-0 select-none min-h-screen">
        {navContent}
      </aside>
    </>
  )
}
