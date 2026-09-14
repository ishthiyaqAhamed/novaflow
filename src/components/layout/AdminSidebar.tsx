"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Key,
  Server,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react"
import { logout } from "@/app/(auth)/login/actions"

interface AdminSidebarProps {
  userName: string
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Admin Portal Header */}
        <div className="h-16 border-b border-border px-5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-base shadow-xs">
              N
            </span>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-ink tracking-tight">NovaFlow</span>
              <span className="text-[10px] text-purple-700 font-mono font-bold tracking-wider -mt-1">ADMIN PORTAL</span>
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
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/admin"
                ? "bg-ink text-paper shadow-xs font-semibold"
                : "text-muted hover:text-ink hover:bg-ink/[0.04]"
            }`}
          >
            <LayoutDashboard className={`h-4 w-4 ${pathname === "/admin" ? "text-purple-400" : "text-muted"}`} />
            <span>Admin Overview</span>
          </Link>

          <Link
            href="/admin/users"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/users")
                ? "bg-ink text-paper shadow-xs font-semibold"
                : "text-muted hover:text-ink hover:bg-ink/[0.04]"
            }`}
          >
            <Users className={`h-4 w-4 ${pathname.startsWith("/admin/users") ? "text-purple-400" : "text-muted"}`} />
            <span>User Management</span>
          </Link>

          <Link
            href="/admin/otps"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/otps")
                ? "bg-ink text-paper shadow-xs font-semibold"
                : "text-muted hover:text-ink hover:bg-ink/[0.04]"
            }`}
          >
            <Key className={`h-4 w-4 ${pathname.startsWith("/admin/otps") ? "text-purple-400" : "text-muted"}`} />
            <span>OTP Codes & Security</span>
          </Link>

          <Link
            href="/admin/system"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith("/admin/system")
                ? "bg-ink text-paper shadow-xs font-semibold"
                : "text-muted hover:text-ink hover:bg-ink/[0.04]"
            }`}
          >
            <Server className={`h-4 w-4 ${pathname.startsWith("/admin/system") ? "text-purple-400" : "text-muted"}`} />
            <span>System & Resend Health</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-border/60">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Go to App Workspace</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>
      </div>

      {/* User Info & Signout */}
      <div className="p-3 border-t border-border bg-ink/[0.01]">
        <div className="p-2.5 rounded-xl border border-border/80 bg-paper flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-purple-500/15 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
              A
            </div>
            <div className="min-w-0 flex-grow">
              <div className="text-xs font-semibold text-ink truncate">{userName}</div>
              <div className="text-[10px] text-purple-700 font-mono font-bold">SUPER ADMIN</div>
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
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 h-14 border-b border-border bg-[#101012] text-white px-4 flex items-center justify-between w-full">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-neutral-300 hover:bg-white/10 transition-colors"
          aria-label="Open admin navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/admin" className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-display font-bold text-sm shadow-xs">
            N
          </span>
          <span className="font-display font-bold text-sm text-white tracking-tight">NovaFlow Admin</span>
        </Link>

        <div className="h-7 w-7 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">
          A
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
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
