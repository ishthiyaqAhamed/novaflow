import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AppHeader } from "@/components/layout/AppHeader"
import { updateProfile } from "./actions"
import { User, ShieldCheck, Mail, Database, CheckCircle2, Building, Key } from "lucide-react"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  const allUsers = await db.user.findMany({
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Workspace Settings"
        subtitle="Manage your profile, team permissions, and revenue integrations."
      />

      <div className="p-6 space-y-8 max-w-4xl">
        {/* 1. Profile Information */}
        <div className="rounded-xl border border-border bg-paper p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent font-mono mb-1">
            <User className="h-4 w-4" />
            <span>Personal Profile</span>
          </div>
          <h2 className="text-base font-bold text-ink mb-4">Account Details</h2>

          <form action={updateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted font-medium mb-1">Full Name</label>
                <input
                  name="name"
                  defaultValue={user?.name || ""}
                  required
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Email Address</label>
                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-lg border border-border bg-ink/[0.03] text-muted px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted font-medium mb-1">Job Title</label>
                <input
                  name="title"
                  defaultValue={user?.title || ""}
                  placeholder="e.g. Head of Revenue"
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Avatar Image URL</label>
                <input
                  name="avatarUrl"
                  defaultValue={user?.avatarUrl || ""}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-ink hover:bg-accent text-paper font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* 2. Team Directory */}
        <div className="rounded-xl border border-border bg-paper p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent font-mono mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Team Members</span>
          </div>
          <h2 className="text-base font-bold text-ink mb-4">Workspace Reps & Admins</h2>

          <div className="divide-y divide-border/60">
            {allUsers.map(member => (
              <div key={member.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-8 w-8 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                      {member.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-ink">{member.name}</div>
                    <div className="text-[11px] text-muted">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-muted">{member.title || "Sales Executive"}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      member.role === "ADMIN"
                        ? "bg-purple-500/10 text-purple-700"
                        : "bg-ink/5 text-muted"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. System Status & Integrations */}
        <div className="rounded-xl border border-border bg-paper p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent font-mono mb-1">
            <Key className="h-4 w-4" />
            <span>Integrations & Health</span>
          </div>
          <h2 className="text-base font-bold text-ink mb-4">Active Infrastructure</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-ink/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="h-4 w-4 text-signal" />
                <div>
                  <div className="font-bold text-ink">PostgreSQL Database</div>
                  <div className="text-[11px] text-muted font-mono">Prisma ORM 7 Driver Adapter</div>
                </div>
              </div>
              <span className="text-signal flex items-center gap-1 font-semibold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
              </span>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-ink/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-signal" />
                <div>
                  <div className="font-bold text-ink">Resend Email Delivery</div>
                  <div className="text-[11px] text-muted font-mono">onboarding@novaflowpro.online</div>
                </div>
              </div>
              <span className="text-signal flex items-center gap-1 font-semibold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
