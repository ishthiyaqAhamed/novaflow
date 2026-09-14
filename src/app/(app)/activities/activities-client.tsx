"use client"

import { useState } from "react"
import {
  Plus,
  Activity,
  Phone,
  Calendar,
  Mail,
  FileText,
  ArrowRightLeft,
  X,
  Search,
} from "lucide-react"
import { createActivity } from "./actions"

interface ActivityItem {
  id: string
  type: string
  note: string
  relatedType: string | null
  relatedId: string | null
  createdAt: string | Date
  user: { name: string; avatarUrl?: string | null }
}

export function ActivitiesClient({ initialActivities }: { initialActivities: ActivityItem[] }) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.note.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "ALL" || act.type === typeFilter
    return matchesSearch && matchesType
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "CALL":
        return <Phone className="h-3.5 w-3.5 text-blue-600" />
      case "MEETING":
        return <Calendar className="h-3.5 w-3.5 text-purple-600" />
      case "EMAIL":
        return <Mail className="h-3.5 w-3.5 text-emerald-600" />
      case "STAGE_CHANGE":
        return <ArrowRightLeft className="h-3.5 w-3.5 text-accent" />
      default:
        return <FileText className="h-3.5 w-3.5 text-muted" />
    }
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs rounded-lg border border-border bg-paper px-3 py-1.5 text-muted focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Types</option>
            <option value="NOTE">Notes</option>
            <option value="CALL">Calls</option>
            <option value="MEETING">Meetings</option>
            <option value="EMAIL">Emails</option>
            <option value="STAGE_CHANGE">Stage Changes</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-border bg-paper shadow-xs divide-y divide-border/60">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-muted text-xs">
            No activity logs found matching your filter.
          </div>
        ) : (
          filteredActivities.map(act => (
            <div key={act.id} className="p-4 flex items-start gap-3 hover:bg-ink/[0.01] transition-colors">
              <div className="h-8 w-8 rounded-lg bg-ink/[0.03] border border-border flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(act.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-accent">
                    {act.type.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-muted font-mono">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-ink leading-relaxed font-medium">{act.note}</p>

                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted">
                  <span>Logged by: <strong className="text-ink">{act.user.name}</strong></span>
                  {act.relatedType && (
                    <span className="bg-ink/5 px-2 py-0.5 rounded font-mono">
                      Target: {act.relatedType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Log Activity / Touchpoint</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async formData => {
                await createActivity(formData)
                setShowModal(false)
                window.location.reload()
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-muted font-medium mb-1">Activity Type</label>
                <select
                  name="type"
                  defaultValue="NOTE"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="NOTE">General Note</option>
                  <option value="CALL">Phone Call</option>
                  <option value="MEETING">Customer Meeting</option>
                  <option value="EMAIL">Email Sent / Received</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Notes & Key Takeaways *</label>
                <textarea
                  name="note"
                  required
                  rows={3}
                  placeholder="Summarize the conversation, blockers, or next steps..."
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
