"use client"

import { useState, useTransition } from "react"
import {
  Users,
  Search,
  Plus,
  Shield,
  Trash2,
  X,
  Mail,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { updateUserRole, deleteUser, adminCreateUser } from "./actions"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  title: string | null
  avatarUrl: string | null
  createdAt: string | Date
  _count: {
    otpCodes: number
    deals: number
    contacts: number
  }
}

export function AdminUsersClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.title?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    )
    startTransition(async () => {
      await updateUserRole(userId, newRole)
    })
  }

  const handleDelete = (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This will also remove their associated data.")) return
    setUsers(prev => prev.filter(u => u.id !== userId))
    startTransition(async () => {
      await deleteUser(userId)
    })
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 max-w-7xl">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-paper placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs rounded-lg border border-border bg-paper px-3 py-1.5 text-muted focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-paper shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-ink/[0.01]">
              <tr className="text-muted font-medium">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">OTP Activity</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-ink/[0.01] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-ink text-xs">{u.name}</div>
                        <div className="text-[10px] text-muted font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className="bg-paper border border-border rounded-lg px-2 py-1 text-xs font-mono font-bold text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-muted">
                      {u._count.otpCodes} OTP{u._count.otpCodes !== 1 ? "s" : ""} generated
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-muted font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-muted hover:text-alert p-1 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-ink">Create New User</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              action={async formData => {
                await adminCreateUser(formData)
                setShowModal(false)
                window.location.reload()
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-muted font-medium mb-1">Full Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="john@company.com"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue="MEMBER"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Password</label>
                  <input
                    name="password"
                    defaultValue="NovaFlow2026!"
                    className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                  />
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
