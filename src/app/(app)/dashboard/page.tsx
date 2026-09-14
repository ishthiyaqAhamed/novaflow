import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AppHeader } from "@/components/layout/AppHeader"
import Link from "next/link"
import {
  DollarSign,
  TrendingUp,
  Building,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const workspaceId = user?.workspaceId || ""

  const [
    allDeals,
    allCompanies,
    allContacts,
    tasks,
    recentActivities,
  ] = await Promise.all([
    db.deal.findMany({
      where: { workspaceId },
      include: {
        company: true,
        contact: true,
      },
      orderBy: { value: "desc" },
    }),
    db.company.findMany({
      where: { workspaceId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.contact.findMany({
      where: { workspaceId },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.task.findMany({
      where: { workspaceId, status: { not: "DONE" } },
      include: {
        deal: true,
        contact: true,
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    db.activityLog.findMany({
      where: { workspaceId },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    }),
  ])

  // Compute Metrics
  const activeDeals = allDeals.filter(d => !["WON", "LOST"].includes(d.stage))
  const wonDeals = allDeals.filter(d => d.stage === "WON")
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
  const wonRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0)
  const winRate = allDeals.length > 0 ? Math.round((wonDeals.length / allDeals.length) * 100) : 0

  // Pipeline stage breakdown
  const stages = [
    { key: "LEAD", label: "Lead", color: "bg-amber-500" },
    { key: "QUALIFIED", label: "Qualified", color: "bg-blue-500" },
    { key: "DEMO", label: "Demo", color: "bg-indigo-500" },
    { key: "PROPOSAL", label: "Proposal", color: "bg-purple-500" },
    { key: "NEGOTIATION", label: "Negotiation", color: "bg-pink-500" },
    { key: "WON", label: "Won", color: "bg-signal" },
  ]

  const stageBreakdown = stages.map(s => {
    const stageDeals = allDeals.filter(d => d.stage === s.key)
    const stageVal = stageDeals.reduce((sum, d) => sum + d.value, 0)
    const percent = pipelineValue > 0 ? Math.round((stageVal / pipelineValue) * 100) : 0
    return { ...s, count: stageDeals.length, value: stageVal, percent }
  })

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Executive Overview"
        subtitle={`Welcome back, ${user?.name || "Alex"}. Here is your revenue pipeline performance today.`}
      />

      <div className="p-6 space-y-6 max-w-7xl">
        {/* 1. KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Pipeline */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">Active Pipeline</span>
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-ink font-mono">
              ${pipelineValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
              <span className="font-semibold text-ink font-mono">{activeDeals.length}</span>
              <span>opportunities in flight</span>
            </div>
          </div>

          {/* Card 2: Closed Won Revenue */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">Closed Won (ARR)</span>
              <TrendingUp className="h-4 w-4 text-signal" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-signal font-mono">
              ${wonRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-signal font-medium mt-1.5 flex items-center gap-1">
              <span className="font-mono font-bold">{wonDeals.length} deals won</span>
              <span>• {winRate}% win rate</span>
            </div>
          </div>

          {/* Card 3: Accounts & Contacts */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">Enterprise Graph</span>
              <Building className="h-4 w-4 text-blue-500" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-ink font-mono">
              {allCompanies.length}
            </div>
            <div className="text-[11px] text-muted mt-1.5 flex items-center gap-1">
              <span>Across</span>
              <span className="font-semibold text-ink font-mono">{allContacts.length}</span>
              <span>stakeholders</span>
            </div>
          </div>

          {/* Card 4: Actionable To-dos */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold">Pending Actions</span>
              <AlertCircle className="h-4 w-4 text-alert" />
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-alert font-mono">
              {tasks.length}
            </div>
            <div className="text-[11px] text-muted mt-1.5">
              <span>Require rep attention</span>
            </div>
          </div>
        </div>

        {/* 2. Pipeline Velocity Breakdown & Urgent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pipeline Stage Distribution */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-paper p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-ink">Pipeline Distribution</h2>
                <p className="text-[11px] text-muted">Weighted stage breakdown by total deal volume</p>
              </div>
              <Link
                href="/deals"
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <span>View Kanban</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {stageBreakdown.map(stage => (
                <div key={stage.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`}></span>
                      <span className="font-medium text-ink">{stage.label}</span>
                      <span className="text-[10px] text-muted">({stage.count} deals)</span>
                    </div>
                    <span className="font-mono font-bold text-ink">${stage.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ink/[0.04] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.color}`}
                      style={{ width: `${Math.max(4, Math.min(100, stage.percent))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent To-Dos */}
          <div className="lg:col-span-5 rounded-xl border border-border bg-paper p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-ink">Urgent To-Dos</h2>
                  <p className="text-[11px] text-muted">Time-sensitive follow-ups</p>
                </div>
                <Link href="/tasks" className="text-xs font-semibold text-accent hover:underline">
                  All Tasks
                </Link>
              </div>

              <div className="space-y-2.5">
                {tasks.length === 0 ? (
                  <p className="text-xs text-muted py-6 text-center">No pending tasks. You&apos;re all caught up!</p>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg border border-border bg-[#FCFAF6]/60 hover:bg-[#FCFAF6] transition-all flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-ink line-clamp-1">{task.title}</div>
                        <div className="text-[10px] text-muted flex items-center gap-2 mt-1">
                          {task.deal && <span className="truncate">Deal: {task.deal.title}</span>}
                          {task.dueDate && (
                            <span className="text-alert font-mono">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono shrink-0 ${
                          task.priority === "URGENT"
                            ? "bg-alert/10 text-alert"
                            : task.priority === "HIGH"
                            ? "bg-accent/10 text-accent"
                            : "bg-ink/5 text-muted"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Link
              href="/tasks"
              className="mt-4 w-full border border-border hover:border-ink/40 text-ink text-xs font-semibold py-2 rounded-lg text-center transition-colors block"
            >
              Manage Tasks & Reminders
            </Link>
          </div>
        </div>

        {/* 3. Top Active Opportunities & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Deals Table */}
          <div className="lg:col-span-8 rounded-xl border border-border bg-paper p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-ink">Top Opportunities in Flight</h2>
                <p className="text-[11px] text-muted">Highest value active revenue pipeline deals</p>
              </div>
              <Link href="/deals" className="text-xs font-semibold text-accent hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted font-medium pb-2">
                    <th className="pb-2 font-medium">Deal Title</th>
                    <th className="pb-2 font-medium">Company</th>
                    <th className="pb-2 font-medium">Stage</th>
                    <th className="pb-2 font-medium text-right">Value (ARR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeDeals.slice(0, 5).map(deal => (
                    <tr key={deal.id} className="hover:bg-ink/[0.01]">
                      <td className="py-3 font-semibold text-ink pr-3 max-w-[220px] truncate">
                        {deal.title}
                      </td>
                      <td className="py-3 text-muted pr-3">
                        {deal.company?.name || "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent/10 text-accent">
                          {deal.stage}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-ink">
                        ${deal.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Activity Timeline */}
          <div className="lg:col-span-4 rounded-xl border border-border bg-paper p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-ink">Live Activity Feed</h2>
                <p className="text-[11px] text-muted">Recent touchpoints & logs</p>
              </div>
              <Link href="/activities" className="text-xs font-semibold text-accent hover:underline">
                History
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.map(act => (
                <div key={act.id} className="flex gap-2.5 items-start text-xs border-b border-border/40 pb-2.5 last:border-0">
                  <div className="h-6 w-6 rounded-full bg-accent/10 text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {act.type.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-ink leading-snug">{act.note}</p>
                    <span className="text-[9px] text-muted font-mono mt-0.5 block">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
