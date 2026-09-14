"use client"

import { useState, useTransition } from "react"
import {
  Key,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { purgeExpiredOtps } from "./actions"

interface OtpItem {
  id: string
  code: string
  expiresAt: string | Date
  consumedAt: string | Date | null
  createdAt: string | Date
  user: {
    id: string
    name: string
    email: string
  }
}

export function AdminOtpsClient({ initialOtps }: { initialOtps: OtpItem[] }) {
  const [otps, setOtps] = useState<OtpItem[]>(initialOtps)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isPending, startTransition] = useTransition()

  const filteredOtps = otps.filter(otp => {
    const isConsumed = Boolean(otp.consumedAt)
    const isExpired = !isConsumed && new Date(otp.expiresAt) < new Date()
    const currentStatus = isConsumed ? "CONSUMED" : isExpired ? "EXPIRED" : "ACTIVE"

    const matchesSearch =
      otp.code.includes(searchQuery) ||
      otp.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otp.user.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || currentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handlePurge = () => {
    if (!confirm("Are you sure you want to purge all expired and already consumed OTP records?")) return
    setOtps(prev =>
      prev.filter(o => !o.consumedAt && new Date(o.expiresAt) >= new Date())
    )
    startTransition(async () => {
      await purgeExpiredOtps()
    })
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by code or user email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-border bg-paper px-3 py-1.5 text-muted focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Valid)</option>
            <option value="CONSUMED">Consumed (Verified)</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <button
          onClick={handlePurge}
          disabled={isPending}
          className="border border-border hover:border-alert text-muted hover:text-alert text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{isPending ? "Purging..." : "Purge Stale OTPs"}</span>
        </button>
      </div>

      {/* OTPs Table */}
      <div className="rounded-xl border border-border bg-paper shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-ink/[0.01]">
              <tr className="text-muted font-medium">
                <th className="py-3 px-4 font-semibold">6-Digit Code</th>
                <th className="py-3 px-4 font-semibold">Target User</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Dispatched At</th>
                <th className="py-3 px-4 font-semibold">Expires At</th>
                <th className="py-3 px-4 text-right font-semibold">Verified At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOtps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    No OTP verification codes found.
                  </td>
                </tr>
              ) : (
                filteredOtps.map(otp => {
                  const isConsumed = Boolean(otp.consumedAt)
                  const isExpired = !isConsumed && new Date(otp.expiresAt) < new Date()

                  return (
                    <tr key={otp.id} className="hover:bg-ink/[0.01] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-ink tracking-widest">
                        <span className="bg-ink/5 px-2.5 py-1 rounded-md border border-border/60">
                          {otp.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-ink">{otp.user.name}</div>
                        <div className="text-[10px] text-muted font-mono">{otp.user.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isConsumed
                                ? "bg-signal/10 text-signal"
                                : isExpired
                                ? "bg-alert/10 text-alert"
                                : "bg-accent/10 text-accent animate-pulse"
                            }`}
                          >
                            {isConsumed ? "Consumed" : isExpired ? "Expired" : "Active (Valid)"}
                          </span>
                          {(otp as any).purpose && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono text-muted bg-ink/5 rounded">
                              {(otp as any).purpose}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted text-[11px]">
                        {new Date(otp.createdAt).toLocaleTimeString()} • {new Date(otp.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted text-[11px]">
                        {new Date(otp.expiresAt).toLocaleTimeString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-muted text-[11px]">
                        {otp.consumedAt ? (
                          <span className="text-signal font-semibold">
                            {new Date(otp.consumedAt).toLocaleTimeString()}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
