import { db } from "@/lib/db"
import { AppHeader } from "@/components/layout/AppHeader"
import { ActivitiesClient } from "./activities-client"

export default async function ActivitiesPage() {
  const activities = await db.activityLog.findMany({
    include: {
      user: { select: { name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader
        title="Activity Audit Log"
        subtitle="Chronological feed of customer meetings, calls, notes, and deal progressions."
      />
      <ActivitiesClient initialActivities={activities} />
    </div>
  )
}
