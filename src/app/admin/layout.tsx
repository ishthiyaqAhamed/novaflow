import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Users,
  ShieldCheck,
  Key,
  Server,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { logout } from "@/app/(auth)/login/actions"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-[#FBF9F5] text-ink font-sans selection:bg-accent/20">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border bg-paper flex flex-col justify-between shrink-0 select-none min-h-screen">
        <div>
          {/* Admin Portal Header */}
          <div className="h-16 border-b border-border px-5 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="h-8 w-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-base shadow-xs">
                N
              </span>
              <div className="flex flex-col">
                <span className="font-display font-bold text-base text-ink tracking-tight">NovaFlow</span>
                <span className="text-[10px] text-accent font-mono font-bold tracking-wider -mt-1">ADMIN PORTAL</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink hover:bg-ink/[0.04] transition-all"
            >
              <LayoutDashboard className="h-4 w-4 text-accent" />
              <span>Admin Overview</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-ink/[0.04] transition-all"
            >
              <Users className="h-4 w-4 text-muted" />
              <span>User Management</span>
            </Link>

            <Link
              href="/admin/otps"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-ink/[0.04] transition-all"
            >
              <Key className="h-4 w-4 text-muted" />
              <span>OTP Codes & Security</span>
            </Link>

            <Link
              href="/admin/system"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-ink hover:bg-ink/[0.04] transition-all"
            >
              <Server className="h-4 w-4 text-muted" />
              <span>System & Resend Health</span>
            </Link>

            <div className="pt-4 mt-4 border-t border-border/60">
              <Link
                href="/dashboard"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 transition-all"
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
              <div className="h-8 w-8 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name?.slice(0, 1) || "A"}
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-xs font-semibold text-ink truncate">{user?.name}</div>
                <div className="text-[10px] text-accent font-mono font-bold">{user?.role}</div>
              </div>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-muted hover:text-alert hover:bg-alert/5 rounded-lg transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
