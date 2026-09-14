"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  Building,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  Search,
  MoreVertical,
  Check,
  ChevronRight,
  Trash2,
} from "lucide-react"
import { createDeal, updateDealStage, deleteDeal } from "./actions"

interface CompanyOption {
  id: string
  name: string
}

interface ContactOption {
  id: string
  name: string
  companyId?: string | null
}

interface DealItem {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  expectedCloseDate: string | Date | null
  company: { id: string; name: string } | null
  contact: { id: string; name: string; avatarUrl?: string | null } | null
}

interface DealsClientProps {
  initialDeals: DealItem[]
  companies: CompanyOption[]
  contacts: ContactOption[]
}

const STAGES = [
  { key: "LEAD", label: "Lead Inbound", color: "border-amber-400/80 bg-amber-500/5 text-amber-800" },
  { key: "QUALIFIED", label: "Qualified", color: "border-blue-400/80 bg-blue-500/5 text-blue-800" },
  { key: "DEMO", label: "Demo Scheduled", color: "border-indigo-400/80 bg-indigo-500/5 text-indigo-800" },
  { key: "PROPOSAL", label: "Proposal Sent", color: "border-purple-400/80 bg-purple-500/5 text-purple-800" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-pink-400/80 bg-pink-500/5 text-pink-800" },
  { key: "WON", label: "Closed Won", color: "border-signal bg-signal/5 text-signal" },
  { key: "LOST", label: "Closed Lost", color: "border-border bg-ink/[0.02] text-muted" },
]

export function DealsClient({ initialDeals, companies, contacts }: DealsClientProps) {
  const [deals, setDeals] = useState<DealItem[]>(initialDeals)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null)

  const filteredDeals = deals.filter(deal => {
    const q = searchQuery.toLowerCase()
    return (
      deal.title.toLowerCase().includes(q) ||
      deal.company?.name.toLowerCase().includes(q) ||
      deal.contact?.name.toLowerCase().includes(q)
    )
  })

  const totalActivePipeline = deals
    .filter(d => !["WON", "LOST"].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0)

  const totalWon = deals
    .filter(d => d.stage === "WON")
    .reduce((sum, d) => sum + d.value, 0)

  const handleStageChange = (dealId: string, newStage: string) => {
    // Optimistic update
    setDeals(prev =>
      prev.map(d => (d.id === dealId ? { ...d, stage: newStage } : d))
    )
    startTransition(async () => {
      await updateDealStage(dealId, newStage)
    })
  }

  const handleDelete = (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return
    setDeals(prev => prev.filter(d => d.id !== dealId))
    if (selectedDeal?.id === dealId) setSelectedDeal(null)
    startTransition(async () => {
      await deleteDeal(dealId)
    })
  }

  const [mobileStageFilter, setMobileStageFilter] = useState<string>("ALL")

  const visibleStages = mobileStageFilter === "ALL" 
    ? STAGES 
    : STAGES.filter(s => s.key === mobileStageFilter)

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Header Controls & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs text-muted">Active Pipeline:</span>
            <span className="font-display text-lg sm:text-xl font-bold text-ink font-mono">
              ${totalActivePipeline.toLocaleString()}
            </span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="text-xs text-signal font-medium">
              Won: ${totalWon.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search deals, accounts, contacts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Mobile Stage Filter Tabs */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
        <button
          onClick={() => setMobileStageFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            mobileStageFilter === "ALL"
              ? "bg-ink text-paper"
              : "bg-ink/5 text-muted hover:text-ink"
          }`}
        >
          All Stages ({filteredDeals.length})
        </button>
        {STAGES.map(stage => {
          const count = filteredDeals.filter(d => d.stage === stage.key).length
          const isSelected = mobileStageFilter === stage.key

          return (
            <button
              key={stage.key}
              onClick={() => setMobileStageFilter(stage.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? "bg-ink text-paper"
                  : "bg-ink/5 text-muted hover:text-ink"
              }`}
            >
              <span>{stage.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-accent text-paper" : "bg-ink/10 text-muted"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Kanban Columns Board */}
      <div className="flex lg:grid lg:grid-cols-7 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {visibleStages.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage.key)
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0)

          return (
            <div
              key={stage.key}
              className="flex flex-col rounded-xl border border-border/70 bg-[#FCFAF6]/60 p-3 min-w-[210px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${stage.color}`}></span>
                  <span className="text-xs font-bold text-ink">{stage.label}</span>
                </div>
                <span className="text-[10px] font-mono text-muted font-semibold">
                  {stageDeals.length}
                </span>
              </div>

              <div className="text-[11px] font-mono text-muted font-bold mb-3">
                ${stageTotal.toLocaleString()}
              </div>

              {/* Deal Cards */}
              <div className="flex flex-col gap-2.5 flex-grow">
                {stageDeals.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-[10px] text-muted/50 border border-dashed border-border/70 rounded-lg">
                    No deals
                  </div>
                ) : (
                  stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className="group cursor-pointer rounded-lg border border-border bg-paper p-3 shadow-xs hover:border-accent/60 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-ink leading-snug line-clamp-2">
                          {deal.title}
                        </span>
                      </div>

                      {deal.company && (
                        <div className="text-[11px] text-muted flex items-center gap-1 mb-2 truncate">
                          <Building className="h-3 w-3 shrink-0" />
                          <span className="truncate">{deal.company.name}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40 font-mono">
                        <span className="font-bold text-ink">${deal.value.toLocaleString()}</span>
                        <span className="text-[10px] text-muted">{deal.probability}% win</span>
                      </div>

                      {/* Quick stage selector */}
                      <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center justify-between text-[10px]">
                        <select
                          value={deal.stage}
                          onChange={e => {
                            e.stopPropagation()
                            handleStageChange(deal.id, e.target.value)
                          }}
                          className="bg-ink/[0.03] text-muted hover:text-ink font-medium px-1.5 py-0.5 rounded border border-border/60 text-[10px] focus:outline-none"
                        >
                          {STAGES.map(s => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(deal.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-alert transition-opacity p-1"
                          title="Delete deal"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Deal Details Drawer / Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-paper p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-accent font-bold font-mono">
                  Stage: {selectedDeal.stage}
                </span>
                <h2 className="text-lg font-bold text-ink mt-0.5">{selectedDeal.title}</h2>
              </div>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-muted hover:text-ink p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-border text-xs">
              <div>
                <span className="text-muted block text-[10px]">Deal Value:</span>
                <span className="font-mono font-bold text-ink text-base">
                  ${selectedDeal.value.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Win Probability:</span>
                <span className="font-mono font-bold text-signal text-base">
                  {selectedDeal.probability}%
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Company:</span>
                <span className="font-medium text-ink">
                  {selectedDeal.company?.name || "None"}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">Contact Person:</span>
                <span className="font-medium text-ink">
                  {selectedDeal.contact?.name || "None"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDelete(selectedDeal.id)}
                className="text-alert hover:bg-alert/10 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Deal</span>
              </button>

              <button
                onClick={() => setSelectedDeal(null)}
                className="bg-ink text-paper text-xs font-medium px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Create New Deal</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async formData => {
                await createDeal(formData)
                setShowModal(false)
                window.location.reload()
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-muted font-medium mb-1">Deal Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Enterprise Cloud Annual Contract"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Value (USD) *</label>
                  <input
                    name="value"
                    type="number"
                    step="100"
                    required
                    placeholder="50000"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Initial Stage</label>
                  <select
                    name="stage"
                    defaultValue="LEAD"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Company Account</label>
                  <input
                    list="deal-companies-list"
                    name="companyName"
                    placeholder="Type or select company..."
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                  <datalist id="deal-companies-list">
                    {companies.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Key Contact Person</label>
                  <input
                    list="deal-contacts-list"
                    name="contactName"
                    placeholder="Type or select contact..."
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  />
                  <datalist id="deal-contacts-list">
                    {contacts.map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Target Close Date</label>
                <input
                  name="expectedCloseDate"
                  type="date"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-lg border border-border text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-ink hover:bg-accent text-paper font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
