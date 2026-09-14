"use client"

import { useState, useTransition } from "react"
import { ShieldCheck, UserPlus, Trash2, X, Shield, Users } from "lucide-react"
import { inviteWorkspaceMember, removeWorkspaceMember, updateWorkspaceMemberRole } from "./team-actions"

interface MemberItem {
  id: string
  userId: string
  role: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    title: string | null
  }
}

interface TeamClientProps {
  initialMembers: MemberItem[]
  currentUserId: string
  currentUserRole: string
  workspaceName: string
}

export function TeamClient({
  initialMembers,
  currentUserId,
  currentUserRole,
  workspaceName,
}: TeamClientProps) {
  const [members, setMembers] = useState<MemberItem[]>(initialMembers)
  const [showModal, setShowModal] = useState(false)
  const [formError, setFormError] = useState("")
  const [isPending, startTransition] = useTransition()

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN"
  const isOwner = currentUserRole === "OWNER"

  const handleRemove = (memberId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this workspace?`)) return
    setMembers(prev => prev.filter(m => m.id !== memberId))
    startTransition(async () => {
      const res = await removeWorkspaceMember(memberId)
      if (res?.error) {
        alert(res.error)
        window.location.reload()
      }
    })
  }

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(prev =>
      prev.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
    )
    startTransition(async () => {
      const res = await updateWorkspaceMemberRole(memberId, newRole)
      if (res?.error) {
        alert(res.error)
        window.location.reload()
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-paper p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent font-mono mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Workspace & Team Members</span>
          </div>
          <h2 className="text-base font-bold text-ink">{workspaceName}</h2>
          <p className="text-xs text-muted">
            {members.length} collaborator{members.length !== 1 ? "s" : ""} active in this workspace
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setFormError("")
              setShowModal(true)
            }}
            className="bg-ink hover:bg-accent text-paper text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      <div className="divide-y divide-border/60">
        {members.map(member => {
          const isSelf = member.userId === currentUserId
          const isMemberOwner = member.role === "OWNER"

          return (
            <div key={member.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                {member.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user.name}
                    className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                    {member.user.name.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-ink flex items-center gap-1.5 truncate">
                    <span>{member.user.name}</span>
                    {isSelf && (
                      <span className="text-[9px] bg-ink/5 text-muted px-1.5 py-0.2 rounded font-mono font-medium">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted font-mono truncate">{member.user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-muted hidden sm:inline">
                  {member.user.title || "Sales Executive"}
                </span>

                {isOwner && !isMemberOwner ? (
                  <select
                    value={member.role}
                    onChange={e => handleRoleChange(member.id, e.target.value)}
                    className="text-xs rounded-lg border border-border bg-paper px-2 py-1 font-mono font-semibold focus:outline-none focus:border-accent"
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                ) : (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      member.role === "OWNER"
                        ? "bg-purple-500/10 text-purple-700 border border-purple-500/20"
                        : member.role === "ADMIN"
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "bg-ink/5 text-muted border border-border"
                    }`}
                  >
                    {member.role}
                  </span>
                )}

                {canManage && !isMemberOwner && !isSelf && (
                  <button
                    onClick={() => handleRemove(member.id, member.user.name)}
                    className="text-muted hover:text-alert p-1 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Invite Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-paper p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-ink">Invite to Workspace</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
                {formError}
              </div>
            )}

            <form
              action={async formData => {
                setFormError("")
                const res = await inviteWorkspaceMember(formData)
                if (res?.error) {
                  setFormError(res.error)
                } else {
                  setShowModal(false)
                  window.location.reload()
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-muted font-medium mb-1">Colleague Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Job Title / Role</label>
                <input
                  name="title"
                  placeholder="e.g. Senior Account Executive"
                  defaultValue="Account Executive"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Workspace Permission</label>
                <select
                  name="role"
                  defaultValue="MEMBER"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="MEMBER">Member (Full access to workspace CRM data)</option>
                  <option value="ADMIN">Admin (Can manage team members and settings)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-ink/[0.02] border border-border/80 text-[11px] text-muted space-y-1">
                <div className="font-semibold text-ink">Shared Workspace Access:</div>
                <div>Invited members will collaborate with you inside this CRM workspace. If they do not have an account yet, one will be automatically provisioned for them.</div>
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
                  disabled={isPending}
                  className="bg-ink hover:bg-accent text-paper font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isPending ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
