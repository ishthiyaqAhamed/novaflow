import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  let activeDealsCount = 0
  let pendingTasksCount = 0

  try {
    if (db.deal && db.task) {
      const [deals, tasks] = await Promise.all([
        db.deal.count({
          where: {
            workspaceId: user.workspaceId,
            stage: { notIn: ["WON", "LOST"] },
          },
        }),
        db.task.count({
          where: {
            workspaceId: user.workspaceId,
            status: { not: "DONE" },
          },
        }),
      ])
      activeDealsCount = deals
      pendingTasksCount = tasks
    }
  } catch (err) {
    console.warn("Could not fetch badge counts:", err)
  }

  return (
    <div className="flex min-h-screen bg-[#FDFCFB] text-ink font-sans selection:bg-accent/20">
      <AppSidebar
        user={user}
        activeDealsCount={activeDealsCount}
        pendingTasksCount={pendingTasksCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
