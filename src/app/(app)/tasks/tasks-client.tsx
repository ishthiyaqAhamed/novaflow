"use client"

import { useState, useTransition } from "react"
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  Trash2,
  X,
  Search,
  Filter,
} from "lucide-react"
import { createTask, toggleTaskStatus, deleteTask } from "./actions"

interface DealOption {
  id: string
  title: string
}

interface ContactOption {
  id: string
  name: string
}

interface TaskItem {
  id: string
  title: string
  description: string | null
  dueDate: string | Date | null
  priority: string
  status: string
  deal: { id: string; title: string } | null
  contact: { id: string; name: string } | null
}

interface TasksClientProps {
  initialTasks: TaskItem[]
  deals: DealOption[]
  contacts: ContactOption[]
}

export function TasksClient({ initialTasks, deals, contacts }: TasksClientProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [statusTab, setStatusTab] = useState<"ALL" | "TODO" | "DONE">("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.deal?.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusTab === "ALL" ||
      (statusTab === "DONE" ? task.status === "DONE" : task.status !== "DONE")

    const matchesPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleToggle = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE"
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: nextStatus } : t))
    )
    startTransition(async () => {
      await toggleTaskStatus(taskId, currentStatus)
    })
  }

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    startTransition(async () => {
      await deleteTask(taskId)
    })
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-5xl">
      {/* Header controls & tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-ink/[0.04] rounded-xl border border-border/80">
          {(["ALL", "TODO", "DONE"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                statusTab === tab
                  ? "bg-paper text-ink shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
            >
              {tab === "ALL" ? "All Tasks" : tab === "TODO" ? "Pending" : "Completed"}
            </button>
          ))}
        </div>

        {/* Search & Add */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs rounded-lg border border-border bg-paper px-3 py-1.5 text-muted focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-xl border border-border bg-paper shadow-xs divide-y divide-border/60">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-muted text-xs">
            No tasks found matching your filter criteria.
          </div>
        ) : (
          filteredTasks.map(task => {
            const isDone = task.status === "DONE"
            return (
              <div
                key={task.id}
                className="p-4 flex items-start justify-between gap-4 hover:bg-ink/[0.01] transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggle(task.id, task.status)}
                    className="mt-0.5 text-muted hover:text-signal transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-signal fill-signal/10" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted/60" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold leading-snug ${
                        isDone ? "line-through text-muted" : "text-ink"
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="text-[11px] text-muted mt-1 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted mt-2">
                      {task.deal && (
                        <span className="font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded font-mono">
                          Deal: {task.deal.title}
                        </span>
                      )}
                      {task.contact && <span>Contact: {task.contact.name}</span>}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      task.priority === "URGENT"
                        ? "bg-alert/10 text-alert"
                        : task.priority === "HIGH"
                        ? "bg-accent/10 text-accent"
                        : "bg-ink/5 text-muted"
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-alert p-1 transition-opacity"
                    title="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async formData => {
                await createTask(formData)
                setShowModal(false)
                window.location.reload()
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-muted font-medium mb-1">Task Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Follow up on custom security questionnaire"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Add details, notes, or next steps..."
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Priority</label>
                  <select
                    name="priority"
                    defaultValue="MEDIUM"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Due Date</label>
                  <input
                    name="dueDate"
                    type="date"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Associated Deal</label>
                  <select
                    name="dealId"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="">None</option>
                    {deals.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Contact</label>
                  <select
                    name="contactId"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="">None</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
