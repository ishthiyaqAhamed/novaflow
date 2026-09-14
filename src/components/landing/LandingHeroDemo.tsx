"use client"

import { useState } from "react"
import { DollarSign, Building, User, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"

interface DemoDeal {
  id: string
  title: string
  company: string
  contact: string
  value: number
  stage: "LEAD" | "DEMO" | "PROPOSAL" | "WON"
  probability: number
  date: string
}

const INITIAL_DEALS: DemoDeal[] = [
  { id: "1", title: "Global Enterprise Billing Integration", company: "Stripe", contact: "Patrick Collison", value: 120000, stage: "PROPOSAL", probability: 75, date: "Oct 24" },
  { id: "2", title: "Linear Multi-Team Workspace Upgrade", company: "Linear", contact: "Karri Saarinen", value: 48000, stage: "DEMO", probability: 50, date: "Oct 18" },
  { id: "3", title: "Next.js Edge Cloud Automation", company: "Vercel", contact: "Guillermo Rauch", value: 85000, stage: "WON", probability: 100, date: "Oct 12" },
  { id: "4", title: "Design System Ops Integration", company: "Figma", contact: "Dylan Field", value: 95000, stage: "LEAD", probability: 25, date: "Nov 02" },
]

const STAGES = [
  { key: "LEAD", label: "Lead Inbound", color: "bg-amber-500/10 text-amber-700 border-amber-200" },
  { key: "DEMO", label: "Demo Scheduled", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  { key: "PROPOSAL", label: "Proposal Sent", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  { key: "WON", label: "Closed Won", color: "bg-signal/10 text-signal border-signal/20" },
] as const

export function LandingHeroDemo() {
  const [deals, setDeals] = useState<DemoDeal[]>(INITIAL_DEALS)
  const [activeDealId, setActiveDealId] = useState<string>("1")

  const totalValue = deals.reduce((sum, d) => sum + (d.stage !== "WON" ? d.value : 0), 0)
  const wonValue = deals.filter(d => d.stage === "WON").reduce((sum, d) => sum + d.value, 0)
  const activeDeal = deals.find(d => d.id === activeDealId) || deals[0]

  const moveDeal = (id: string, newStage: DemoDeal["stage"]) => {
    setDeals(prev =>
      prev.map(d => {
        if (d.id === id) {
          const prob = newStage === "WON" ? 100 : newStage === "PROPOSAL" ? 75 : newStage === "DEMO" ? 50 : 25
          return { ...d, stage: newStage, probability: prob }
        }
        return d
      })
    )
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-paper shadow-2xl overflow-hidden text-left">
      {/* App Bar Simulation */}
      <div className="border-b border-border bg-ink/[0.02] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-alert/80 inline-block"></span>
            <span className="h-3 w-3 rounded-full bg-accent/80 inline-block"></span>
            <span className="h-3 w-3 rounded-full bg-signal/80 inline-block"></span>
          </div>
          <span className="text-xs font-mono text-muted ml-2">novaflow.app/workspace/pipeline</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-muted">
            <span>Active Pipeline:</span>
            <span className="font-semibold text-ink font-mono">${(totalValue / 1000).toFixed(0)}k</span>
          </div>
          <div className="flex items-center gap-1.5 text-signal bg-signal/10 px-2 py-0.5 rounded-full font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Closed Won: ${(wonValue / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      {/* Interactive Kanban Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FBF9F5]/40">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.key)
          const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0)

          return (
            <div key={stage.key} className="flex flex-col rounded-xl border border-border/70 bg-paper p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border/50">
                <span className="text-xs font-semibold text-ink">{stage.label}</span>
                <span className="text-[11px] font-mono text-muted">${(stageTotal / 1000).toFixed(0)}k</span>
              </div>

              <div className="flex flex-col gap-2.5 min-h-[140px]">
                {stageDeals.length === 0 && (
                  <div className="h-full flex items-center justify-center text-[11px] text-muted/60 border border-dashed border-border rounded-lg p-4">
                    Drag / Click to move
                  </div>
                )}
                {stageDeals.map(deal => {
                  const isSelected = deal.id === activeDealId
                  return (
                    <div
                      key={deal.id}
                      onClick={() => setActiveDealId(deal.id)}
                      className={`cursor-pointer rounded-lg border p-3 transition-all ${
                        isSelected
                          ? "border-accent bg-accent/[0.03] ring-1 ring-accent/30 shadow-sm"
                          : "border-border hover:border-ink/30 bg-paper"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-ink line-clamp-1">{deal.title}</span>
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-1 mb-2">
                        <Building className="h-3 w-3" />
                        <span>{deal.company}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/40 font-mono">
                        <span className="font-bold text-ink">${deal.value.toLocaleString()}</span>
                        <span className="text-[10px] text-muted">{deal.probability}% win</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Quick Controller */}
      <div className="border-t border-border bg-paper p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-9 w-9 rounded-lg bg-ink text-paper flex items-center justify-center text-sm font-bold shrink-0">
            {activeDeal.company.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink">{activeDeal.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-muted font-mono font-medium">
                ${activeDeal.value.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-muted">Contact: {activeDeal.contact} • Close Date: {activeDeal.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <span className="text-xs text-muted mr-1 hidden sm:inline">Move Stage:</span>
          {STAGES.map(s => (
            <button
              key={s.key}
              onClick={() => moveDeal(activeDeal.id, s.key)}
              className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                activeDeal.stage === s.key
                  ? "bg-ink text-paper border-ink shadow-xs"
                  : "bg-paper text-muted border-border hover:border-ink/30 hover:text-ink"
              }`}
            >
              {s.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
