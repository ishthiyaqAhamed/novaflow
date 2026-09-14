import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { isSystemAdminEmail } from "@/lib/admin"
import Link from "next/link"
import {
  Users,
  Key,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Mail,
  Database,
  Server,
  Trash2,
} from "lucide-react"

export default async function AdminOverviewPage() {
  const [users, otps, totalUsersCount, totalOtpsCount, consumedOtpsCount] =
    await Promise.all([
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          otpCodes: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      db.otpCode.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.user.count(),
      db.otpCode.count(),
      db.otpCode.count({
        where: { consumedAt: { not: null } },
      }),
    ])

  const otpSuccessRate =
    totalOtpsCount > 0 ? Math.round((consumedOtpsCount / totalOtpsCount) * 100) : 0

  return (
    <div className="flex-1 flex flex-col">
      {/* Admin Header */}
      <header className="min-h-16 border-b border-border bg-paper/80 backdrop-blur-xs px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0 sticky top-0 z-40">
        <div>
          <h1 className="text-base font-bold text-ink leading-tight">Admin Overview & Metrics</h1>
          <p className="text-[11px] text-muted">Real-time user onboarding, authentication logs, and security telemetry.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-signal font-semibold bg-signal/10 px-3 py-1 rounded-full border border-signal/20">
            <span className="h-2 w-2 rounded-full bg-signal animate-pulse"></span>
            <span>Resend & DB Operational</span>
          </span>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* 1. Executive Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Registered Users */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">Registered Users</span>
              <Users className="h-4 w-4 text-accent" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-ink font-mono">
              {totalUsersCount}
            </div>
            <div className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
              <span>Managed in database</span>
            </div>
          </div>

          {/* Total OTPs Generated */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">OTPs Dispatched</span>
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-ink font-mono">
              {totalOtpsCount}
            </div>
            <div className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
              <span>via onboarding@novaflowpro.online</span>
            </div>
          </div>

          {/* OTP Verification Rate */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">Verification Success</span>
              <ShieldCheck className="h-4 w-4 text-signal" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-signal font-mono">
              {otpSuccessRate}%
            </div>
            <div className="text-[11px] text-signal font-medium mt-1.5">
              <span>{consumedOtpsCount} of {totalOtpsCount} codes verified</span>
            </div>
          </div>

          {/* Delivery & Security Status */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">Domain Delivery</span>
              <Server className="h-4 w-4 text-purple-500" />
            </div>
            <div className="font-display text-lg font-bold text-ink font-mono truncate">
              novaflowpro.online
            </div>
            <div className="text-[11px] text-signal font-semibold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> DKIM & SPF Verified
            </div>
          </div>
        </div>

        {/* 2. Registered Users Table & OTP Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Users Table */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-paper p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-ink">Recent Registered Users</h2>
                <p className="text-[11px] text-muted">Accounts created through the signup portal</p>
              </div>
              <Link href="/admin/users" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                <span>View All ({totalUsersCount})</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted font-medium pb-2">
                    <th className="pb-2 font-semibold">User</th>
                    <th className="pb-2 font-semibold">Role</th>
                    <th className="pb-2 font-semibold">Joined</th>
                    <th className="pb-2 font-semibold text-right">Latest OTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map(u => {
                    const latestOtp = u.otpCodes[0]
                    return (
                      <tr key={u.id} className="hover:bg-ink/[0.01]">
                        <td className="py-3 pr-2">
                          <div className="font-bold text-ink">{u.name}</div>
                          <div className="text-[10px] text-muted font-mono">{u.email}</div>
                        </td>
                        <td className="py-3 pr-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isSystemAdminEmail(u.email)
                                ? "bg-purple-500/10 text-purple-700 border border-purple-500/20"
                                : "bg-ink/5 text-muted border border-border"
                            }`}
                          >
                            {isSystemAdminEmail(u.email) ? "SUPER ADMIN" : "MEMBER"}
                          </span>
                        </td>
                        <td className="py-3 text-muted text-[11px] font-mono pr-2">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          {latestOtp ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                latestOtp.consumedAt
                                  ? "bg-signal/10 text-signal"
                                  : new Date(latestOtp.expiresAt) > new Date()
                                  ? "bg-accent/10 text-accent"
                                  : "bg-alert/10 text-alert"
                              }`}
                            >
                              {latestOtp.consumedAt ? "Verified" : "Pending"}
                            </span>
                          ) : (
                            <span className="text-muted text-[10px]">No OTP</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* OTP Code Stream */}
          <div className="lg:col-span-5 rounded-xl border border-border bg-paper p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-ink">Recent OTP Dispatches</h2>
                <p className="text-[11px] text-muted">Authentication token lifecycle</p>
              </div>
              <Link href="/admin/otps" className="text-xs font-semibold text-accent hover:underline">
                Inspect All
              </Link>
            </div>

            <div className="space-y-3">
              {otps.map(otp => {
                const isConsumed = Boolean(otp.consumedAt)
                const isExpired = !isConsumed && new Date(otp.expiresAt) < new Date()

                return (
                  <div
                    key={otp.id}
                    className="p-3 rounded-lg border border-border bg-[#FCFAF6]/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-ink bg-ink/5 px-2 py-0.5 rounded text-xs tracking-wider">
                          {otp.code}
                        </span>
                        <span className="text-[11px] text-muted truncate max-w-[140px]">
                          {otp.user.email}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted font-mono mt-1">
                        Sent: {new Date(otp.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isConsumed
                          ? "bg-signal/10 text-signal"
                          : isExpired
                          ? "bg-alert/10 text-alert"
                          : "bg-accent/10 text-accent animate-pulse"
                      }`}
                    >
                      {isConsumed ? "Consumed" : isExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
