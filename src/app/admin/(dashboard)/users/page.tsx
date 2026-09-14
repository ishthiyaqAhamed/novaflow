import { db } from "@/lib/db"
import { AdminUsersClient } from "./users-client"

import { isSystemAdminEmail, ADMIN_EMAIL } from "@/lib/admin"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  try {
    // Automatically sanitize: Ensure no regular user ever retains an ADMIN role
    await db.user.updateMany({
      where: {
        email: { not: ADMIN_EMAIL },
        role: "ADMIN",
      },
      data: {
        role: "MEMBER",
      },
    })

    const users = await db.user.findMany({
      include: {
        otpCodes: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const serializedUsers = users.map(u => {
      const isSystemAdmin = isSystemAdminEmail(u.email)
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: isSystemAdmin ? "ADMIN" : "MEMBER",
        title: isSystemAdmin ? "System Administrator" : (u.title || "Workspace Owner"),
        avatarUrl: u.avatarUrl || null,
        createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString(),
        _count: {
          otpCodes: u.otpCodes?.length || 0,
          deals: 0,
          contacts: 0,
        },
      }
    })

    return (
      <div className="flex-1 flex flex-col">
        <header className="min-h-16 border-b border-border bg-paper/80 backdrop-blur-xs px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0 sticky top-0 z-40">
          <div>
            <h1 className="text-base font-bold text-ink leading-tight">User Management</h1>
            <p className="text-[11px] text-muted">Manage access roles, inspect registration history, and administer workspace accounts.</p>
          </div>
        </header>

        <AdminUsersClient initialUsers={serializedUsers} />
      </div>
    )
  } catch (error) {
    console.error("AdminUsersPage error:", error)
    return (
      <div className="flex-1 p-6">
        <div className="p-4 rounded-xl border border-alert/20 bg-alert/5 text-alert text-xs">
          Failed to load users. Please refresh.
        </div>
      </div>
    )
  }
}
